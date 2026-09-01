/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, KeyRound, ShieldCheck, PlusCircle, Trash2, Edit3, 
  Save, Undo2, AlertCircle, CheckCircle, Sparkles, X, ChevronRight, FileText, Plus, Calendar, Clock,
  User, Phone, Upload, Image as ImageIcon, ArrowUp, ArrowDown
} from 'lucide-react';
import { Service, BlockedSlot, Booking, CarouselSlide } from '../types';
import { DEFAULT_CAROUSEL_SLIDES } from '../data';
import { 
  saveServicesToFirestore, 
  saveBlockedSlotsToFirestore, 
  saveBookingsToFirestore,
  saveCarouselToFirestore,
  getCarouselFromFirestore
} from '../lib/firestoreStorage';

interface AdminPanelProps {
  services: Service[];
  onServicesUpdated: (updatedServices: Service[]) => void;
  blockedSlots: BlockedSlot[];
  onBlockedSlotsUpdated: (updatedSlots: BlockedSlot[]) => void;
  onClose: () => void;
  bookings: Booking[];
  onBookingsUpdated: (updatedBookings: Booking[]) => void;
  carouselSlides?: CarouselSlide[];
  onCarouselUpdated?: (updatedSlides: CarouselSlide[]) => void;
}

// Pre-defined templates for creating new service cards
const SERVICE_TEMPLATES = {
  yoga: {
    name: 'Nueva Práctica de Yoga',
    description: 'Descripción detallada de la propuesta, indicando los enfoques en respiración (Pranayama), posturas (Asanas) y meditación Zen.',
    category: 'yoga' as const,
    duration: 60,
    price: 30000,
    priceYoga4: 30000,
    priceYoga8to12: 45000,
    intensity: 'Suave' as const,
    highlightNote: 'Práctica presencial • Cupos reducidos',
    benefits: [
      'Reduce notablemente el estrés y la tensión mental',
      'Mejora la flexibilidad corporal y el balance general',
      'Fomenta la autorregulación física y mental'
    ]
  },
  shiatsu: {
    name: 'Nueva Sesión de Shiatsu Zen',
    description: 'Terapia manual de acupresión, estiramientos y rotaciones suaves destinadas a liberar la tensión física y transitar una experiencia corporal profunda y restaurativa.',
    category: 'shiatsu' as const,
    duration: 60,
    price: 7000,
    intensity: 'Moderada' as const,
    benefits: [
      'Alivia contracturas corporales and dolores cronificados',
      'Sincroniza y estimula la circulación de energía vital',
      'Aporta un profundo estado de bienestar y armonía física'
    ]
  },
  combo: {
    name: 'Combo de Bienestar',
    description: 'Disfruta de la combinación perfecta de Yoga Dinámico y Shiatsu Terapéutico en una sola sesión de pura relajación y alineación.',
    category: 'combo' as const,
    duration: 90,
    price: 8500,
    intensity: 'Restaurativa' as const,
    benefits: [
      'Alivio del estrés inmediato',
      'Equilibrio integral de cuerpo y mente',
      'Flexibilidad corporal asistida y digitopresión'
    ]
  },
  reiki: {
    name: 'Sesión de Reiki Usui',
    description: 'Terapia de armonización por imposición de manos para sintonizar y balancear la energía vital de tu ser, brindándote relajación profunda.',
    category: 'reiki' as const,
    duration: 60,
    price: 5000,
    intensity: 'Restaurativa' as const,
    benefits: [
      'Desbloquea los flujos de energía vital y sintoniza los chakras',
      'Profunda relajación física y sosiego mental',
      'Favorece la autocuración estimulando el sistema inmunitario'
    ]
  }
};

const compressImage = (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminPanel({ 
  services, 
  onServicesUpdated, 
  blockedSlots, 
  onBlockedSlotsUpdated, 
  onClose,
  bookings,
  onBookingsUpdated,
  carouselSlides,
  onCarouselUpdated
}: AdminPanelProps) {
  // Authentication states
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

  // Toggle active administration tab: 'services' | 'carousel' | 'blocks' | 'bookings'
  const [adminTab, setAdminTab] = useState<'services' | 'carousel' | 'blocks' | 'bookings'>('services');

  // Yoga Carousel Management states
  const [carouselSlidesList, setCarouselSlidesList] = useState<CarouselSlide[]>(() => {
    if (carouselSlides && carouselSlides.length > 0) return carouselSlides;
    try {
      const cached = localStorage.getItem('clara_cached_carousel1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CAROUSEL_SLIDES;
  });
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [isCreatingSlide, setIsCreatingSlide] = useState<boolean>(false);
  const [slideImageInput, setSlideImageInput] = useState<string>('');
  const [slideTitleInput, setSlideTitleInput] = useState<string>('');
  const [slideDescInput, setSlideDescInput] = useState<string>('');
  const [isUploadingSlideImage, setIsUploadingSlideImage] = useState<boolean>(false);
  const [deleteConfirmSlideId, setDeleteConfirmSlideId] = useState<string | null>(null);

  // Sync prop changes for carouselSlides
  useEffect(() => {
    if (carouselSlides && carouselSlides.length > 0) {
      setCarouselSlidesList(carouselSlides);
    }
  }, [carouselSlides]);

  // Booking management states
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [ebName, setEbName] = useState<string>('');
  const [ebEmail, setEbEmail] = useState<string>('');
  const [ebPhone, setEbPhone] = useState<string>('');
  const [ebDate, setEbDate] = useState<string>('');
  const [ebTime, setEbTime] = useState<string>('');
  const [ebStatus, setEbStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('confirmed');
  const [ebComments, setEbComments] = useState<string>('');
  const [ebServiceId, setEbServiceId] = useState<string>('');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');

  // Input states for calendar manual locking
  const [blockDateInput, setBlockDateInput] = useState<string>(''); // YYYY-MM-DD
  const [blockTimeInput, setBlockTimeInput] = useState<string>('all'); // HH:MM or "all"
  const [blockReasonInput, setBlockReasonInput] = useState<string>(''); 

  // Listing and editing states
  const [editedServices, setEditedServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newServiceCategory, setNewServiceCategory] = useState<'yoga' | 'shiatsu' | 'combo'>('yoga');
  const [deleteConfirmCardId, setDeleteConfirmCardId] = useState<string | null>(null);

  // Input states for active editor
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'yoga' | 'shiatsu' | 'combo' | 'reiki'>('yoga');
  const [editDuration, setEditDuration] = useState<number>(60);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editPriceYoga4, setEditPriceYoga4] = useState<number>(30000);
  const [editPriceYoga8, setEditPriceYoga8] = useState<number>(45000);
  const [editPriceYoga8to12, setEditPriceYoga8to12] = useState<number>(45000);
  const [editPriceYoga12, setEditPriceYoga12] = useState<number>(55000);
  const [editPriceYogaPaseLibre, setEditPriceYogaPaseLibre] = useState<number>(55000);
  const [editIntensity, setEditIntensity] = useState<'Suave' | 'Moderada' | 'Intensa' | 'Restaurativa' | 'Equilibrio' | 'Sintonización Energética'>('Suave');
  const [editHighlightNote, setEditHighlightNote] = useState<string>('');
  const [editBackgroundImage, setEditBackgroundImage] = useState<string>('');
  const [isUploadingBgImage, setIsUploadingBgImage] = useState<boolean>(false);
  const [editBenefits, setEditBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState<string>('');

  // Status message overlays
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Load token from localStorage on initialization
  useEffect(() => {
    const savedToken = localStorage.getItem('clara_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Set editable services list when props or authentication changes
  useEffect(() => {
    setEditedServices([...services]);
  }, [services, isAuthenticated]);

  // Handle administrator login with smart client-side fallback (for static platforms like Vercel)
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const data = await resp.json();

      if (data.success && data.token) {
        localStorage.setItem('clara_admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError(data.message || 'Contraseña incorrecta. Por favor reintente.');
      }
    } catch (err) {
      console.warn('Backend connection failed, executing client-side password verification fallback.', err);
      // Fallback local password verification when backend is static (e.g. Vercel)
      if (passwordInput === 'macata0378' || passwordInput === 'ubuntu') {
        const fallbackToken = 'fallback_clara_admin_session_token';
        localStorage.setItem('clara_admin_token', fallbackToken);
        setToken(fallbackToken);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError('Contraseña incorrecta. Por favor reintente.');
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clara_admin_token');
    setToken('');
    setIsAuthenticated(false);
    setSelectedService(null);
    setIsCreatingNew(false);
  };

  // Open the card editor for a specific service
  const handleStartEdit = (service: Service) => {
    setSelectedService(service);
    setIsCreatingNew(false);
    setEditName(service.name);
    setEditDescription(service.description);
    setEditCategory(service.category);
    setEditDuration(service.duration);
    setEditPrice(service.price || 0);
    setEditPriceYoga4(service.priceYoga4 ?? 30000);
    setEditPriceYoga8(service.priceYoga8 ?? service.priceYoga8to12 ?? 45000);
    setEditPriceYoga8to12(service.priceYoga8to12 ?? service.priceYoga8 ?? 45000);
    setEditPriceYoga12(service.priceYoga12 ?? 55000);
    setEditPriceYogaPaseLibre(service.priceYogaPaseLibre ?? service.priceYoga12 ?? 55000);
    setEditIntensity(service.intensity || 'Suave');
    setEditHighlightNote(service.highlightNote || '');
    setEditBackgroundImage(service.backgroundImage || '');
    setEditBenefits([...service.benefits]);
    setNewBenefitInput('');
    setStatusMessage(null);
  };

  // Start creation of a service based on matching templates
  const handleStartCreate = (category: keyof typeof SERVICE_TEMPLATES) => {
    const template = SERVICE_TEMPLATES[category];
    const temporaryId = `service-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    
    setSelectedService({
      id: temporaryId,
      ...template
    });
    setIsCreatingNew(true);
    setEditName(template.name);
    setEditDescription(template.description);
    setEditCategory(template.category);
    setEditDuration(template.duration);
    setEditPrice(template.price);
    setEditPriceYoga4((template as any).priceYoga4 ?? 30000);
    setEditPriceYoga8((template as any).priceYoga8 ?? (template as any).priceYoga8to12 ?? 45000);
    setEditPriceYoga8to12((template as any).priceYoga8to12 ?? (template as any).priceYoga8 ?? 45000);
    setEditPriceYoga12((template as any).priceYoga12 ?? 55000);
    setEditPriceYogaPaseLibre((template as any).priceYogaPaseLibre ?? (template as any).priceYoga12 ?? 55000);
    setEditIntensity(template.intensity);
    setEditHighlightNote(('highlightNote' in template) ? (template as any).highlightNote : '');
    setEditBackgroundImage('');
    setEditBenefits([...template.benefits]);
    setNewBenefitInput('');
    setStatusMessage(null);
  };

  // Benefit dynamic lists
  const handleAddBenefit = () => {
    if (newBenefitInput.trim() !== '') {
      setEditBenefits([...editBenefits, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (indexToRemove: number) => {
    setEditBenefits(editBenefits.filter((_, i) => i !== indexToRemove));
  };

  // Save the temporary edited card into state and sync with the database immediately
  const handleSaveCardLocally = async () => {
    if (!editName.trim()) {
      setStatusMessage({ text: 'El nombre del servicio no puede estar vacío.', isError: true });
      return;
    }

    if (!selectedService) return;

    const updatedServiceItem: Service = {
      id: selectedService.id,
      name: editName.trim(),
      description: editDescription.trim(),
      category: editCategory,
      duration: editDuration !== undefined && editDuration !== null ? Number(editDuration) : 0,
      price: Number(editPrice) || 0,
      priceYoga4: editCategory === 'yoga' ? (Number(editPriceYoga4) || 0) : undefined,
      priceYoga8: editCategory === 'yoga' ? (Number(editPriceYoga8) || 0) : undefined,
      priceYoga8to12: editCategory === 'yoga' ? (Number(editPriceYoga8) || 0) : undefined,
      priceYoga12: editCategory === 'yoga' ? (Number(editPriceYogaPaseLibre) || Number(editPriceYoga12) || 0) : undefined,
      priceYogaPaseLibre: editCategory === 'yoga' ? (Number(editPriceYogaPaseLibre) || 0) : undefined,
      intensity: editIntensity,
      highlightNote: editHighlightNote.trim() || undefined,
      backgroundImage: editBackgroundImage.trim() || undefined,
      benefits: editBenefits
    };

    let updatedList: Service[];
    if (isCreatingNew) {
      updatedList = [...editedServices, updatedServiceItem];
    } else {
      updatedList = editedServices.map(s => s.id === selectedService.id ? updatedServiceItem : s);
    }

    setEditedServices(updatedList);
    onServicesUpdated(updatedList);
    setSelectedService(null);
    setIsCreatingNew(false);

    // Save directly to backend for instant feedback and a highly reactive admin experience
    await handleSyncWithBackend(updatedList);
  };

  // Sync state list with the Express JSON backend (and local backup cache)
  const handleSyncWithBackend = async (listToSync = editedServices) => {
    setSaveLoading(true);
    setStatusMessage(null);

    // Auto-merge any active edits from the open card editor into the target list
    let targetList = [...listToSync];
    if (selectedService && editName.trim()) {
      const activeEditedItem: Service = {
        id: selectedService.id,
        name: editName.trim(),
        description: editDescription.trim(),
        category: editCategory,
        duration: editDuration !== undefined && editDuration !== null ? Number(editDuration) : 0,
        price: Number(editPrice) || 0,
        priceYoga4: editCategory === 'yoga' ? (Number(editPriceYoga4) || 0) : undefined,
        priceYoga8: editCategory === 'yoga' ? (Number(editPriceYoga8) || 0) : undefined,
        priceYoga8to12: editCategory === 'yoga' ? (Number(editPriceYoga8) || 0) : undefined,
        priceYoga12: editCategory === 'yoga' ? (Number(editPriceYogaPaseLibre) || Number(editPriceYoga12) || 0) : undefined,
        priceYogaPaseLibre: editCategory === 'yoga' ? (Number(editPriceYogaPaseLibre) || 0) : undefined,
        intensity: editIntensity,
        highlightNote: editHighlightNote.trim() || undefined,
        backgroundImage: editBackgroundImage.trim() || undefined,
        benefits: editBenefits
      };

      const existsIndex = targetList.findIndex(s => s.id === selectedService.id);
      if (existsIndex >= 0) {
        targetList[existsIndex] = activeEditedItem;
      } else {
        targetList.push(activeEditedItem);
      }
    }

    // Save to Firestore and local cache
    await saveServicesToFirestore(targetList);

    const activeToken = token || localStorage.getItem('clara_admin_token') || 'clara_admin_session_token_2026';

    try {
      const resp = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ services: targetList })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.services)) {
          onServicesUpdated(data.services);
          setEditedServices(data.services);
        }
      }
    } catch (err) {
      console.warn('Backend API endpoint missing. Saved directly via Firebase Firestore.', err);
    } finally {
      onServicesUpdated(targetList);
      setEditedServices(targetList);
      setSelectedService(null);
      setIsCreatingNew(false);
      setStatusMessage({ 
        text: '¡Cambios en los servicios guardados con éxito en Firebase!', 
        isError: false 
      });
      setSaveLoading(false);
    }
  };

  // Sync blocked slots list with backend
  const handleSyncBlockedSlotsWithBackend = async (listToSync = blockedSlots) => {
    setSaveLoading(true);
    setStatusMessage(null);

    // Save to Firestore & local cache
    await saveBlockedSlotsToFirestore(listToSync);

    try {
      const resp = await fetch('/api/blocked-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blockedSlots: listToSync })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.blockedSlots)) {
          onBlockedSlotsUpdated(data.blockedSlots);
        }
      }
    } catch (err) {
      console.warn('Network or backend missing for blocked slots. Saved directly to Firestore.', err);
    } finally {
      onBlockedSlotsUpdated(listToSync);
      setStatusMessage({ 
        text: '¡Bloqueos de calendario guardados con éxito en Firebase!', 
        isError: false 
      });
      setSaveLoading(false);
    }
  };

  // Add a new manual blocked slot
  const handleAddBlockedSlot = (e: FormEvent) => {
    e.preventDefault();
    if (!blockDateInput) {
      setStatusMessage({ text: 'Por favor, selecciona una fecha válida.', isError: true });
      return;
    }

    // Check if duplicate exists
    const duplicate = blockedSlots.some(
      s => s.date === blockDateInput && s.time === blockTimeInput
    );
    if (duplicate) {
      setStatusMessage({ 
        text: `Ya existe un bloqueo registrado para la fecha ${blockDateInput} a la hora ${blockTimeInput === 'all' ? 'Todo el día' : blockTimeInput + ' hs'}.`, 
        isError: true 
      });
      return;
    }

    const newSlot: BlockedSlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: blockDateInput,
      time: blockTimeInput,
      reason: blockReasonInput.trim() || 'Ocupado manual'
    };

    const updatedSlots = [...blockedSlots, newSlot];
    onBlockedSlotsUpdated(updatedSlots);
    
    // Clear form inputs
    setBlockReasonInput('');
    
    // Sync with database
    handleSyncBlockedSlotsWithBackend(updatedSlots);
  };

  // Remove manual blocked slot
  const handleRemoveBlockedSlot = (slotId: string) => {
    const updatedSlots = blockedSlots.filter(s => s.id !== slotId);
    onBlockedSlotsUpdated(updatedSlots);
    handleSyncBlockedSlotsWithBackend(updatedSlots);
  };

  // Select a booking for editing
  const handleSelectBookingForEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEbName(booking.userName);
    setEbEmail(booking.userEmail);
    setEbPhone(booking.userPhone);
    setEbDate(booking.date);
    setEbTime(booking.time);
    setEbStatus(booking.status);
    setEbComments(booking.comments || '');
    setEbServiceId(booking.serviceId);
  };

  // Save the edited booking back to the server
  const handleUpdateBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    const chosenService = services.find(s => s.id === ebServiceId);
    
    // Construct the updated booking matching original type schema
    const updated: Booking = {
      ...editingBooking,
      serviceId: ebServiceId,
      serviceName: chosenService ? chosenService.name : editingBooking.serviceName,
      serviceCategory: chosenService ? chosenService.category : editingBooking.serviceCategory,
      userName: ebName,
      userEmail: ebEmail,
      userPhone: ebPhone,
      date: ebDate,
      time: ebTime,
      status: ebStatus,
      comments: ebComments
    };

    const nextBookings = bookings.map(b => b.id === editingBooking.id ? updated : b);
    
    setSaveLoading(true);
    setStatusMessage(null);
    try {
      const resp = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookings: nextBookings })
      });
      if (resp.ok) {
        onBookingsUpdated(nextBookings);
        setEditingBooking(null);
        setStatusMessage({ text: 'Cambios de la reserva aplicados con éxito permanentemente.', isError: false });
      } else {
        setStatusMessage({ text: 'Error al persistir cambios de reserva en el servidor.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error de red o backend desconectado al persistir reservas.', isError: true });
    } finally {
      setSaveLoading(false);
    }
  };

  // Completely delete a booking from the backend database
  const handleDeleteBookingCompletely = async (bookingId: string) => {
    const nextBookings = bookings.filter(b => b.id !== bookingId);
    setSaveLoading(true);
    setStatusMessage(null);
    try {
      const resp = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookings: nextBookings })
      });
      if (resp.ok) {
        onBookingsUpdated(nextBookings);
        setStatusMessage({ text: 'La reserva ha sido eliminada por completo del servidor.', isError: false });
      } else {
        setStatusMessage({ text: 'Error al eliminar la reserva de la base de datos.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error de conexión para eliminar del servidor.', isError: true });
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete a service card (uses clean state-based confirmation instead of vulnerable window.confirm)
  const handleDeleteCard = (id: string) => {
    const updatedList = editedServices.filter(s => s.id !== id);
    setEditedServices(updatedList);
    onServicesUpdated(updatedList);
    setDeleteConfirmCardId(null);
    if (selectedService?.id === id) {
      setSelectedService(null);
      setIsCreatingNew(false);
    }
    
    // Sync with backend immediately
    handleSyncWithBackend(updatedList);
  };

  // --- 📸 YOGA CAROUSEL MANAGEMENT HANDLERS ---
  const handleStartCreateSlide = () => {
    setSelectedSlide({
      id: `slide-${Date.now()}`,
      image: '',
      title: '',
      description: ''
    });
    setIsCreatingSlide(true);
    setSlideImageInput('');
    setSlideTitleInput('');
    setSlideDescInput('');
    setStatusMessage(null);
  };

  const handleStartEditSlide = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setIsCreatingSlide(false);
    setSlideImageInput(slide.image);
    setSlideTitleInput(slide.title || '');
    setSlideDescInput(slide.description || '');
    setStatusMessage(null);
  };

  const handleUploadSlideImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlideImage(true);
    try {
      const base64 = await compressImage(file, 1400, 900, 0.82);
      const activeToken = token || localStorage.getItem('clara_admin_token') || 'clara_admin_session_token_2026';
      
      // Attempt server-side image upload to get a lightweight URL
      try {
        const uploadResp = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            image: base64,
            name: selectedSlide?.id || `slide-${Date.now()}`
          })
        });

        if (uploadResp.ok) {
          const uploadData = await uploadResp.json();
          if (uploadData.success && uploadData.url) {
            setSlideImageInput(uploadData.url);
            setStatusMessage({ text: 'Foto subida y optimizada con éxito.', isError: false });
            setIsUploadingSlideImage(false);
            return;
          }
        }
      } catch (uploadErr) {
        console.warn('Direct upload endpoint failed, falling back to compressed base64:', uploadErr);
      }

      setSlideImageInput(base64);
      setStatusMessage({ text: 'Foto procesada correctamente y lista para guardar.', isError: false });
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error al procesar la imagen seleccionada.', isError: true });
    } finally {
      setIsUploadingSlideImage(false);
    }
  };

  const handleSyncCarouselWithBackend = async (listToSync = carouselSlidesList) => {
    setSaveLoading(true);
    setStatusMessage(null);

    let finalSlides = listToSync;

    try {
      const activeToken = token || localStorage.getItem('clara_admin_token') || 'clara_admin_session_token_2026';
      const resp = await fetch('/api/carousel/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ slides: listToSync })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.slides)) {
          finalSlides = data.slides;
          setCarouselSlidesList(data.slides);
          if (onCarouselUpdated) onCarouselUpdated(data.slides);
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable. Saving directly to Firestore and local cache.', err);
    }

    // Save final processed lightweight slides to Firestore & local storage
    await saveCarouselToFirestore(finalSlides, 1);

    if (onCarouselUpdated) {
      onCarouselUpdated(finalSlides);
    }

    setStatusMessage({ 
      text: '¡Carrusel de Yoga guardado y sincronizado con éxito en la nube!', 
      isError: false 
    });
    setSaveLoading(false);
  };

  const handleSaveSlideLocally = async () => {
    if (!slideImageInput.trim()) {
      setStatusMessage({ text: 'Por favor, sube una foto o ingresa el enlace de la imagen.', isError: true });
      return;
    }

    if (!selectedSlide) return;

    const updatedSlide: CarouselSlide = {
      id: selectedSlide.id,
      image: slideImageInput.trim(),
      title: slideTitleInput.trim(),
      description: slideDescInput.trim()
    };

    let updatedList: CarouselSlide[];
    if (isCreatingSlide) {
      updatedList = [...carouselSlidesList, updatedSlide];
    } else {
      updatedList = carouselSlidesList.map(s => s.id === selectedSlide.id ? updatedSlide : s);
    }

    setCarouselSlidesList(updatedList);
    setSelectedSlide(null);
    setIsCreatingSlide(false);

    // Sync with backend / Firestore immediately
    await handleSyncCarouselWithBackend(updatedList);
  };

  const handleDeleteSlide = (slideId: string) => {
    const updatedList = carouselSlidesList.filter(s => s.id !== slideId);
    setCarouselSlidesList(updatedList);
    setDeleteConfirmSlideId(null);
    if (selectedSlide?.id === slideId) {
      setSelectedSlide(null);
      setIsCreatingSlide(false);
    }
    handleSyncCarouselWithBackend(updatedList);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= carouselSlidesList.length) return;

    const updated = [...carouselSlidesList];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    setCarouselSlidesList(updated);
    handleSyncCarouselWithBackend(updated);
  };

  return (
    <div id="admin-panel-container" className="mx-auto max-w-5xl px-4 py-12">
      
      {/* Top action bar: only Volver a la Web button */}
      <div className="flex items-center justify-center pb-6 border-b border-stone-borders mb-8">
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 border border-stone-borders hover:border-stone-charcoal hover:bg-stone-charcoal hover:text-stone-sand text-stone-600 font-bold text-[9px] uppercase tracking-widest px-4 py-2.5 transition-all duration-300 rounded-none cursor-pointer"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Volver a la Web
        </button>
      </div>

      {/* 🔐 AUTHENTICATION FORM OVERLAY if not authenticated */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white border border-stone-borders p-8 shadow-none mt-12">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-stone-sand rounded-none p-4 border border-stone-borders">
              <Lock className="h-6 w-6 text-stone-gold" />
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Introduce la contraseña"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal placeholder:text-stone-300 font-mono transition-colors focus:border-stone-charcoal outline-hidden pr-10"
                  required
                />
                <KeyRound className="absolute right-3.5 top-3 h-4 w-4 text-stone-300" />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 text-red-650 rounded-none">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className={`w-full py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDFCF8] rounded-none transition-all duration-300 cursor-pointer bg-stone-charcoal border border-stone-charcoal hover:bg-primary hover:border-primary disabled:bg-stone-300 disabled:border-stone-300 disabled:cursor-not-allowed`}
            >
              {isLoginLoading ? 'Verificando...' : 'Iniciar Administración'}
            </button>
          </form>
        </div>
      ) : (
        /* 🛠️ AUTHENTICATED ADMIN AREA */
        <div className="space-y-8">
          
          {/* Admin Context Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-sand border border-stone-borders">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-charcoal">
                Sesión de Admin autorizada
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="text-[9px] uppercase font-bold tracking-widest text-stone-400 hover:text-red-650 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap border-b border-stone-borders gap-1 mt-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setAdminTab('services');
                setStatusMessage(null);
                setSelectedService(null);
                setIsCreatingNew(false);
              }}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border-b-2 ${
                adminTab === 'services'
                  ? 'border-primary text-stone-charcoal bg-white'
                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
              }`}
            >
              Tarjetas de Servicios
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminTab('carousel');
                setStatusMessage(null);
                setSelectedSlide(null);
                setIsCreatingSlide(false);
              }}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border-b-2 ${
                adminTab === 'carousel'
                  ? 'border-primary text-stone-charcoal bg-white'
                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
              }`}
            >
              Carrusel Yoga 📸
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminTab('blocks');
                setStatusMessage(null);
              }}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border-b-2 ${
                adminTab === 'blocks'
                  ? 'border-primary text-stone-charcoal bg-white'
                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
              }`}
            >
              Bloquear Días y Horarios 🕒
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminTab('bookings');
                setStatusMessage(null);
                setEditingBooking(null);
              }}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border-b-2 ${
                adminTab === 'bookings'
                  ? 'border-primary text-stone-charcoal bg-white'
                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
              }`}
            >
              Reservas de Alumnos 📝
            </button>
          </div>

          {/* Status feedback panel if active */}
          {statusMessage && (
            <div className={`p-4 border flex items-start gap-3 rounded-none ${
              statusMessage.isError 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {statusMessage.isError ? (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-light">
                {statusMessage.text}
              </div>
              <button 
                onClick={() => setStatusMessage(null)} 
                className="ml-auto text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* TWO COLUMN GRID: LEFT = CARD LIST OR CREATE ACTIONS, RIGHT = CARD EDITOR */}
          {adminTab === 'services' && (
            <>
              <div className="grid gap-8 lg:grid-cols-12 items-start">
            
            {/* LEFT AREA: Cards & templates list (8 columns or full if editor closed) */}
            <div className={`${selectedService ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6`}>
              
              {/* Template creation area */}
              <div className="bg-white border border-stone-borders p-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block mb-4">
                  Crear Nueva Tarjeta basado en Plantillas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStartCreate('yoga')}
                    className="flex flex-col items-center text-center p-4 border border-stone-borders bg-stone-sand/20 hover:bg-stone-sand hover:border-stone-charcoal transition-all duration-300 rounded-none cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-charcoal">Yoga</span>
                    <span className="text-[9px] text-stone-400 font-light mt-1">Yin & Yang | Antopotécnica</span>
                  </button>

                  <button
                    onClick={() => handleStartCreate('shiatsu')}
                    className="flex flex-col items-center text-center p-4 border border-stone-borders bg-stone-sand/20 hover:bg-stone-sand hover:border-stone-charcoal transition-all duration-300 rounded-none cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#867768]">Masaje Shiatsu Zen</span>
                    <span className="text-[9px] text-stone-400 font-light mt-1">Acupresión Japonesa</span>
                  </button>

                  <button
                    onClick={() => handleStartCreate('reiki')}
                    className="flex flex-col items-center text-center p-4 border border-[#C5A059]/45 bg-[#FCDA16]/5 hover:bg-[#FCDA16]/10 hover:border-stone-gold transition-all duration-300 rounded-none cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-gold">Reiki Usui</span>
                    <span className="text-[9px] text-stone-450 font-light mt-1">Sintonización Energética</span>
                  </button>
                </div>
              </div>

              {/* Master List of current editable cards */}
              <div className="bg-white border border-stone-borders p-6">
                <div className="flex justify-between items-center pb-4 border-b border-stone-borders mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                    Tarjetas Actuales ({editedServices.length})
                  </span>
                  <button
                    onClick={() => handleSyncWithBackend()}
                    disabled={saveLoading}
                    className="flex items-center gap-1.5 border border-[#C5A059] bg-[#FDFCF8] hover:bg-stone-charcoal hover:border-stone-charcoal hover:text-stone-sand text-stone-gold font-bold text-[9px] uppercase tracking-widest px-3.5 py-1.5 transition-all duration-300 rounded-none cursor-pointer disabled:bg-stone-100 disabled:border-stone-105"
                  >
                    <Save className="h-3 w-3" />
                    {saveLoading ? 'Sincronizando...' : 'Guardar todo en Servidor'}
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                  {editedServices.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 font-light text-xs">
                      No hay tarjetas disponibles. Crea una con las plantillas superiores.
                    </div>
                  ) : (
                    editedServices.map((service) => {
                      const isActiveEd = selectedService?.id === service.id;
                      return (
                        <div
                          key={service.id}
                          className={`p-4 border transition-all duration-300 flex items-center justify-between gap-4 ${
                            isActiveEd 
                              ? 'border-stone-charcoal bg-stone-sand/40 scale-[0.99] shadow-inner' 
                              : (service.category === 'combo' || service.category === 'reiki')
                              ? 'border-stone-gold/50 bg-stone-sand/10 hover:border-stone-charcoal'
                              : 'border-stone-borders hover:border-stone-charcoal bg-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-mono uppercase tracking-[0.15em] px-1.5 py-0.5 ${
                                service.category === 'yoga' ? 'bg-indigo-50 border border-indigo-100 text-indigo-750' :
                                service.category === 'shiatsu' ? 'bg-olive-50 border border-olive-150 text-olive-800' :
                                service.category === 'combo' ? 'bg-[#FDFCF8] border border-stone-gold text-stone-gold' :
                                'bg-emerald-50 border border-emerald-100 text-emerald-800'
                              }`}>
                                {service.category === 'yoga' ? 'Yoga' : service.category === 'shiatsu' ? 'Masaje Shiatsu Zen' : service.category === 'combo' ? 'Combo de Bienestar' : 'Reiki Usui'}
                              </span>
                              {service.backgroundImage && (
                                <span className="flex items-center gap-1 text-[8px] font-medium bg-stone-sand text-stone-700 px-1.5 py-0.5 border border-stone-borders">
                                  <ImageIcon className="w-2.5 h-2.5 text-stone-500" />
                                  Con Foto
                                </span>
                              )}
                              <span className="text-[9px] font-mono text-stone-400">
                                {service.duration} min • {
                                  service.category === 'yoga'
                                    ? `4: $${(service.priceYoga4 || service.price || 0).toLocaleString('es-AR')} | 8: $${(service.priceYoga8 || service.priceYoga8to12 || 0).toLocaleString('es-AR')} | 12: $${(service.priceYoga12 || 0).toLocaleString('es-AR')}`
                                    : (service.price && service.price > 0 ? `$${service.price.toLocaleString('es-AR')}` : 'A consultar')
                                }
                              </span>
                            </div>
                            <h4 className="font-serif text-sm font-medium text-stone-charcoal truncate">
                              {service.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {deleteConfirmCardId === service.id ? (
                              <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1">
                                <span className="text-[9px] text-red-650 font-bold uppercase tracking-wider px-1">
                                  ¿Borrar?
                                </span>
                                <button
                                  onClick={() => handleDeleteCard(service.id)}
                                  className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white bg-[#b92c2c] hover:bg-red-705 transition-colors cursor-pointer"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmCardId(null)}
                                  className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-600 border border-stone-borders bg-white hover:bg-stone-sand transition-colors cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(service)}
                                  title="Editar propiedades de tarjeta"
                                  className="p-2 border border-stone-borders bg-white text-stone-600 hover:border-stone-charcoal hover:bg-stone-charcoal hover:text-stone-sand transition-all rounded-none cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmCardId(service.id)}
                                  title="Eliminar tarjeta"
                                  className="p-2 border border-red-150 bg-red-50 text-red-650 hover:bg-red-650 hover:text-white transition-all rounded-none cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT AREA: THE ACTIVE FORM EDITOR (7 columns) */}
            <AnimatePresence mode="wait">
              {selectedService && (
                <motion.div
                  key={`editor-${selectedService.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="lg:col-span-7 bg-white border border-stone-charcoal p-6 md:p-8"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-stone-borders mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-stone-gold animate-bounce" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-charcoal">
                        {isCreatingNew ? 'Creando Nueva Opción' : 'Editando Tarjeta de Opción'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedService(null);
                        setIsCreatingNew(false);
                      }}
                      className="text-stone-400 hover:text-stone-750 transition-colors p-1"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Unique ID displays as informational */}
                    <div>
                      <label className="block text-[8px] font-mono uppercase tracking-widest text-stone-400 mb-1">
                        ID Único de Identificación (Slug)
                      </label>
                      <input
                        type="text"
                        value={selectedService.id}
                        disabled
                        className="w-full rounded-none border border-stone-borders bg-stone-sand/20 px-3.5 py-2 text-xs font-mono text-stone-500 outline-hidden cursor-not-allowed"
                      />
                    </div>

                    {/* Title Name */}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                        Título de la Disciplina / Sesión
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Yoga Zen para Principiantes"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden"
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                          Categoría Técnica
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e: any) => setEditCategory(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal transition-colors focus:border-stone-charcoal outline-hidden cursor-pointer"
                        >
                          <option value="yoga">Yoga</option>
                          <option value="shiatsu">Masaje Shiatsu Zen</option>
                          <option value="combo">Combo de Bienestar</option>
                          <option value="reiki">Reiki Usui</option>
                        </select>
                      </div>

                      {/* Intensity Select level */}
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                          Nivel de Intensidad
                        </label>
                        <select
                          value={editIntensity}
                          onChange={(e: any) => setEditIntensity(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal transition-colors focus:border-stone-charcoal outline-hidden cursor-pointer"
                        >
                          <option value="Suave">Suave (Relajante)</option>
                          <option value="Moderada">Moderada (Activa)</option>
                          <option value="Intensa">Intensa (Física)</option>
                          <option value="Restaurativa">Restaurativa (Fascia/Sostén)</option>
                          <option value="Equilibrio">Equilibrio (Balance)</option>
                          <option value="Sintonización Energética">Sintonización Energética</option>
                        </select>
                      </div>
                    </div>

                    {/* Duration / Price numbers row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                          Duración de Sesión (Minutos)
                        </label>
                        <input
                          type="number"
                          placeholder="60 (pon 0 para no mostrar)"
                          min="0"
                          max="240"
                          value={editDuration}
                          onChange={(e) => setEditDuration(Number(e.target.value) || 0)}
                          className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden"
                        />
                        <span className="block text-[10px] text-stone-500 italic mt-1 font-sans">
                          Si colocas 0, la duración no se mostrará en la tarjeta publicada.
                        </span>
                      </div>

                      {editCategory === 'yoga' ? (
                        <div className="sm:col-span-2 space-y-3 pt-2">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal">
                            Valores de Inversión Yoga ($ ARS)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-sand/30 p-4 border border-stone-borders">
                            <div>
                              <label className="block text-[11px] font-medium text-stone-700 mb-1.5 font-sans">
                                Abono 4 clases (mensual) ($ ARS)
                              </label>
                              <input
                                type="number"
                                placeholder="30000"
                                min="0"
                                value={editPriceYoga4 || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const num = val === '' ? 0 : Number(val);
                                  setEditPriceYoga4(num);
                                  setEditPrice(num);
                                }}
                                className="w-full rounded-none border border-stone-borders bg-white px-3 py-2.5 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-stone-700 mb-1.5 font-sans">
                                Abono 8 clases (mensual) ($ ARS)
                              </label>
                              <input
                                type="number"
                                placeholder="45000"
                                min="0"
                                value={editPriceYoga8 || editPriceYoga8to12 || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const num = val === '' ? 0 : Number(val);
                                  setEditPriceYoga8(num);
                                  setEditPriceYoga8to12(num);
                                }}
                                className="w-full rounded-none border border-stone-borders bg-white px-3 py-2.5 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-stone-700 mb-1.5 font-sans">
                                Abono 12 clases (mensual) ($ ARS)
                              </label>
                              <input
                                type="number"
                                placeholder="55000"
                                min="0"
                                value={editPriceYogaPaseLibre || editPriceYoga12 || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const num = val === '' ? 0 : Number(val);
                                  setEditPriceYogaPaseLibre(num);
                                  setEditPriceYoga12(num);
                                }}
                                className="w-full rounded-none border border-stone-borders bg-white px-3 py-2.5 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden"
                              />
                            </div>
                          </div>
                          <span className="block text-[10px] text-stone-500 italic font-sans">
                            * Lo que no tiene precio (o queda en 0) no aparecerá en la tarjeta.
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal">
                              Precio de la Sesión ($ ARS)
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] text-stone-600 font-sans cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!editPrice || Number(editPrice) === 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditPrice(0);
                                  } else {
                                    setEditPrice(40000);
                                  }
                                }}
                                className="rounded-none border-stone-borders text-stone-charcoal focus:ring-0 cursor-pointer"
                              />
                              <span>Sin precio visible (ocultar)</span>
                            </label>
                          </div>
                          <input
                            type="number"
                            placeholder="40000"
                            min="0"
                            disabled={!editPrice || Number(editPrice) === 0}
                            value={!editPrice || Number(editPrice) === 0 ? '' : editPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditPrice(val === '' ? 0 : Number(val));
                            }}
                            className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden disabled:bg-stone-sand/40 disabled:text-stone-400 disabled:cursor-not-allowed"
                          />
                          {(!editPrice || Number(editPrice) === 0) ? (
                            <span className="block text-[10px] text-stone-400 italic mt-1 font-sans">
                              * Si dejas este campo vacío o en 0, no se mostrará ningún precio en la tarjeta.
                            </span>
                          ) : (
                            <span className="block text-[10px] text-stone-500 italic mt-1 font-sans">
                              * Se mostrará como ${Number(editPrice).toLocaleString('es-AR')} ARS en la tarjeta.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description Paragraph */}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                        Descripción Informativa de la Clase o Manual
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Brinda detalles precisos de la práctica, técnicas asimiladas y enfoque sutil zen..."
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs text-stone-charcoal font-sans transition-colors focus:border-stone-charcoal outline-hidden resize-none leading-relaxed"
                      />
                    </div>

                    {/* Bold Highlight Note */}
                    <div className="p-4 bg-stone-sand/30 border border-stone-borders">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal mb-2">
                        Días y Horarios / Texto Destacado en Negrita
                      </label>
                      <textarea
                        rows={3}
                        placeholder={"Ej: Lunes y Miércoles 18 hs\nMartes y Jueves 9 hs"}
                        value={editHighlightNote}
                        onChange={(e) => setEditHighlightNote(e.target.value)}
                        className="w-full rounded-none border border-stone-borders bg-white px-3.5 py-3 text-xs font-bold text-stone-charcoal transition-colors focus:border-stone-charcoal outline-hidden leading-relaxed resize-y"
                      />
                      <span className="block text-[10px] text-stone-500 italic mt-1 font-sans">
                        Puedes presionar Enter para escribir en varias líneas. Se respetarán los saltos de línea en las tarjetas.
                      </span>
                    </div>

                    {/* Background Image Uploader & Manager */}
                    <div className="p-4 bg-white border border-stone-borders space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-stone-charcoal">
                          <ImageIcon className="w-3.5 h-3.5 text-stone-gold" />
                          Imagen de Fondo de la Tarjeta (Opcional)
                        </label>
                        {editBackgroundImage && (
                          <button
                            type="button"
                            onClick={() => setEditBackgroundImage('')}
                            className="text-[9px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Quitar Imagen
                          </button>
                        )}
                      </div>

                      {editBackgroundImage ? (
                        <div className="space-y-3">
                          {/* Image preview box */}
                          <div className="relative w-full h-40 bg-stone-sand/30 border border-stone-borders overflow-hidden flex items-center justify-center group">
                            <img
                              src={editBackgroundImage}
                              alt="Vista previa de fondo"
                              className="w-full h-full object-cover object-center"
                              referrerPolicy="no-referrer"
                            />
                            {/* Card mockup overlay showing real tone */}
                            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent">
                              <div>
                                <span className="text-[8px] font-mono uppercase tracking-widest text-white/90 drop-shadow-xs block">Tonalidad Real</span>
                                <h5 className="font-serif text-base font-light text-white drop-shadow-xs mt-1 truncate">{editName || 'Título del Servicio'}</h5>
                              </div>
                              <span className="text-[9px] font-sans text-white/90 drop-shadow-xs italic">La imagen se muestra en su tonalidad y color real.</span>
                            </div>

                            {/* Hover overlay actions */}
                            <div className="absolute inset-0 bg-stone-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="bg-white text-stone-charcoal text-[9px] font-bold uppercase tracking-wider px-3 py-2 cursor-pointer hover:bg-stone-sand transition-colors flex items-center gap-1 shadow-sm">
                                <Upload className="w-3 h-3" />
                                Reemplazar Imagen
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setIsUploadingBgImage(true);
                                      try {
                                        const compressed = await compressImage(file, 1600, 1200, 0.85);
                                        setEditBackgroundImage(compressed);
                                      } catch (err) {
                                        console.error('Error procesando imagen:', err);
                                      } finally {
                                        setIsUploadingBgImage(false);
                                      }
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setEditBackgroundImage('')}
                                className="bg-[#b92c2c] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-2 cursor-pointer hover:bg-red-700 transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                                Quitar
                              </button>
                            </div>
                          </div>

                          {/* Alternative direct URL input */}
                          <div className="pt-1">
                            <label className="block text-[8px] font-mono uppercase tracking-widest text-stone-400 mb-1">
                              Enlace directo de la imagen (o editar URL)
                            </label>
                            <input
                              type="text"
                              value={editBackgroundImage.startsWith('data:') ? 'Imagen cargada en base64 (almacenada localmente)' : editBackgroundImage}
                              onChange={(e) => setEditBackgroundImage(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              disabled={editBackgroundImage.startsWith('data:')}
                              className="w-full rounded-none border border-stone-borders bg-white px-3 py-2 text-xs font-mono text-stone-600 transition-colors focus:border-stone-charcoal outline-hidden disabled:bg-stone-sand/30 disabled:text-stone-400"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Upload zone */}
                          <label className="border-2 border-dashed border-stone-borders hover:border-stone-charcoal p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-stone-sand/15 hover:bg-stone-sand/30">
                            <Upload className="w-5 h-5 text-stone-500" />
                            <div className="text-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-charcoal block">
                                {isUploadingBgImage ? 'Procesando imagen...' : 'Subir imagen desde tu dispositivo'}
                              </span>
                              <span className="text-[9px] text-stone-400 mt-0.5 block font-sans">
                                JPG, PNG o WebP (se optimizará y comprimirá automáticamente)
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingBgImage}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploadingBgImage(true);
                                  try {
                                    const compressed = await compressImage(file, 1600, 1200, 0.85);
                                    setEditBackgroundImage(compressed);
                                  } catch (err) {
                                    console.error('Error al procesar la imagen:', err);
                                    setStatusMessage({ text: 'No se pudo procesar el archivo seleccionado.', isError: true });
                                  } finally {
                                    setIsUploadingBgImage(false);
                                  }
                                }
                              }}
                            />
                          </label>

                          {/* Or paste URL */}
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-stone-400 shrink-0">O pegar URL:</span>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={editBackgroundImage}
                              onChange={(e) => setEditBackgroundImage(e.target.value)}
                              className="w-full rounded-none border border-stone-borders bg-white px-2.5 py-1.5 text-xs text-stone-charcoal transition-colors focus:border-stone-charcoal outline-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save Locally Actions */}
                    <div className="pt-6 border-t border-stone-borders flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSaveCardLocally}
                        className="flex-1 flex items-center justify-center gap-2 rounded-none bg-stone-charcoal border border-stone-charcoal text-[#FDFCF8] font-bold text-[10px] uppercase tracking-wider px-6 py-4 cursor-pointer hover:bg-emerald-600 hover:border-emerald-600 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Aplicar Cambios en Tarjeta
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedService(null);
                          setIsCreatingNew(false);
                        }}
                        className="rounded-none border border-stone-borders bg-white hover:bg-stone-sand text-stone-500 font-bold text-[10px] uppercase tracking-wider px-6 py-4 cursor-pointer transition-colors"
                      >
                        Descartar
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Massive footer instruction for Clara */}
          <div className="bg-stone-charcoal border border-stone-charcoal p-6 md:p-8 text-stone-sand/90 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 md:max-w-2xl text-center md:text-left">
              <span className="text-[10px] text-stone-gold font-bold uppercase tracking-[0.2em] block">Sincronización de Base de Datos</span>
              <h3 className="font-serif text-lg font-light text-[#FDFCF8]">¿Terminaste de actualizar tus tarjetas?</h3>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                Cada tarjeta modificada arriba se aplica temporalmente en tu navegador. Para que estos cambios queden grabados permanentemente en el servidor y sean visibles para todos los alumnos que ingresen a la aplicación, haz clic en el botón Sincronizar.
              </p>
            </div>

            <button
              onClick={() => handleSyncWithBackend()}
              disabled={saveLoading}
              className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-none bg-[#FDFCF8] hover:bg-stone-gold border border-[#FDFCF8] hover:border-stone-gold px-8 py-4.5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-charcoal hover:text-stone-sand active:scale-98 transition-all duration-300 cursor-pointer shadow-md`}
            >
              <Save className="h-4.5 w-4.5" />
              {saveLoading ? 'Sincronizando...' : 'Sincronizar con el Servidor'}
            </button>
          </div>
          </>
          )}

          {/* 📸 YOGA CAROUSEL MANAGER VIEW */}
          {adminTab === 'carousel' && (
            <div className="space-y-6 pb-12">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white border border-stone-borders">
                <div>
                  <h3 className="font-serif text-lg text-stone-charcoal font-light">
                    Fotos del Carrusel de Yoga
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Estas imágenes se presentan de a 3 de forma horizontal a lo ancho completo en la sección de Yoga.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartCreateSlide}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-charcoal hover:bg-emerald-700 text-stone-sand text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Nueva Foto
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* LEFT: Slides list */}
                <div className="lg:col-span-7 space-y-4">
                  {carouselSlidesList.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-dashed border-stone-borders">
                      <ImageIcon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-serif italic text-stone-400">
                        Aún no has agregado fotos al carrusel.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartCreateSlide}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-charcoal text-white text-xs uppercase font-bold tracking-wider"
                      >
                        <Plus className="h-3.5 w-3.5" /> Subir primera foto
                      </button>
                    </div>
                  ) : (
                    carouselSlidesList.map((slide, idx) => (
                      <div
                        key={slide.id || `slide-${idx}`}
                        className={`p-4 bg-white border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                          selectedSlide?.id === slide.id
                            ? 'border-stone-charcoal ring-1 ring-stone-charcoal'
                            : 'border-stone-borders hover:border-stone-400'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-full sm:w-32 h-20 bg-stone-100 border border-stone-borders overflow-hidden shrink-0 relative">
                          <img
                            src={slide.image}
                            alt={slide.title || `Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Title and details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm text-stone-charcoal font-medium truncate">
                            {slide.title || <span className="italic text-stone-400">Sin título</span>}
                          </h4>
                          {slide.description && (
                            <p className="text-xs text-stone-500 font-light truncate mt-0.5">
                              {slide.description}
                            </p>
                          )}
                          <p className="text-[10px] text-stone-400 font-mono mt-1">
                            Posición {idx + 1} de {carouselSlidesList.length}
                          </p>
                        </div>

                        {/* Reorder & Action buttons */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                          {deleteConfirmSlideId === slide.id ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1">
                              <span className="text-[9px] text-red-650 font-bold uppercase tracking-wider px-1">
                                ¿Eliminar?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(slide.id || `slide-${idx}`)}
                                className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white bg-[#b92c2c] hover:bg-red-705 transition-colors cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmSlideId(null)}
                                className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-600 border border-stone-borders bg-white hover:bg-stone-sand transition-colors cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSlide(idx, 'up')}
                                className="p-1.5 border border-stone-borders text-stone-600 hover:bg-stone-sand disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                title="Mover arriba"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={idx === carouselSlidesList.length - 1}
                                onClick={() => handleMoveSlide(idx, 'down')}
                                className="p-1.5 border border-stone-borders text-stone-600 hover:bg-stone-sand disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                title="Mover abajo"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartEditSlide(slide)}
                                className="flex items-center gap-1 px-2.5 py-1.5 border border-stone-borders hover:bg-stone-sand text-stone-charcoal text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                              >
                                <Edit3 className="h-3 w-3" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmSlideId(slide.id || `slide-${idx}`)}
                                className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Eliminar foto"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* RIGHT: Slide Editor / Uploader */}
                <div className="lg:col-span-5 bg-white border border-stone-borders p-6 space-y-5">
                  {selectedSlide ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                          {isCreatingSlide ? 'Agregar Nueva Foto' : 'Editar Foto del Carrusel'}
                        </span>
                        <p className="text-[11px] text-stone-400 mt-1 font-light leading-relaxed">
                          Sube una foto desde tu dispositivo o ingresa un enlace directo. Se optimizará para visualización horizontal.
                        </p>
                      </div>

                      {/* Image Preview & Upload options */}
                      <div className="space-y-3">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600">
                          Foto / Imagen *
                        </label>

                        {slideImageInput ? (
                          <div className="space-y-3">
                            <div className="relative w-full aspect-[16/10] bg-stone-100 border border-stone-borders overflow-hidden">
                              <img
                                src={slideImageInput}
                                alt="Vista previa"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => setSlideImageInput('')}
                              className="text-[10px] font-bold text-red-600 uppercase tracking-wider hover:underline block"
                            >
                              Cambiar imagen
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Device Upload Zone */}
                            <label className="border-2 border-dashed border-stone-borders hover:border-stone-charcoal p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-stone-sand/15 hover:bg-stone-sand/30">
                              <Upload className="w-6 h-6 text-stone-500" />
                              <div className="text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-charcoal block">
                                  {isUploadingSlideImage ? 'Procesando foto...' : 'Subir foto desde tu dispositivo'}
                                </span>
                                <span className="text-[9px] text-stone-400 mt-0.5 block font-sans">
                                  JPG, PNG o WebP (optimización automática)
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isUploadingSlideImage}
                                className="hidden"
                                onChange={handleUploadSlideImage}
                              />
                            </label>

                            {/* Or direct URL */}
                            <div className="space-y-1 pt-1">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block">
                                O pegar URL directa de la foto:
                              </span>
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                value={slideImageInput}
                                onChange={(e) => setSlideImageInput(e.target.value)}
                                className="w-full rounded-none border border-stone-borders bg-white px-3 py-2 text-xs text-stone-charcoal focus:border-stone-charcoal outline-hidden"
                              />
                            </div>
                          </div>
                        )}

                        {/* Title Input */}
                        <div className="space-y-1 pt-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-stone-600 block">
                            Título / Epígrafe (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Postura de Apertura (Asanas)"
                            value={slideTitleInput}
                            onChange={(e) => setSlideTitleInput(e.target.value)}
                            className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                          />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-stone-600 block">
                            Breve Descripción (Opcional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Ej: Integración consciente de cuerpo y respiración"
                            value={slideDescInput}
                            onChange={(e) => setSlideDescInput(e.target.value)}
                            className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden resize-none"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3">
                          <button
                            type="button"
                            onClick={handleSaveSlideLocally}
                            disabled={saveLoading || !slideImageInput}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-none bg-stone-charcoal hover:bg-emerald-600 text-[#FDFCF8] font-bold text-[9px] uppercase tracking-wider py-3 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {saveLoading ? 'Guardando...' : 'Guardar Foto'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlide(null);
                              setIsCreatingSlide(false);
                            }}
                            className="flex-1 rounded-none border border-stone-borders bg-white hover:bg-stone-sand text-stone-500 font-bold text-[9px] uppercase tracking-wider py-3 cursor-pointer transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-stone-400 font-light text-xs font-serif italic border border-dashed border-stone-borders bg-stone-sand/10">
                      Selecciona una foto de la lista para editarla o haz clic en "Agregar Nueva Foto".
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sync Banner */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-stone-charcoal text-stone-sand shadow-lg mt-8">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-serif text-base tracking-wide text-[#FDFCF8]">
                    ¿Deseas asegurar la sincronización del carrusel?
                  </h4>
                  <p className="text-xs text-stone-300 font-light max-w-2xl leading-relaxed">
                    Las fotos se guardan automáticamente en tu base de datos y Firestore. Puedes forzar una sincronización manual en cualquier momento con este botón.
                  </p>
                </div>

                <button
                  onClick={() => handleSyncCarouselWithBackend()}
                  disabled={saveLoading}
                  className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-none bg-[#FDFCF8] hover:bg-stone-gold border border-[#FDFCF8] hover:border-stone-gold px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-charcoal hover:text-stone-sand active:scale-98 transition-all duration-300 cursor-pointer shadow-md"
                >
                  <Save className="h-4 w-4" />
                  {saveLoading ? 'Sincronizando...' : 'Sincronizar Carrusel'}
                </button>
              </div>
            </div>
          )}

          {adminTab === 'blocks' && (
            /* SCHEDULE BLOCKS MANAGER VIEW */
            <div className="grid gap-8 lg:grid-cols-12 items-start pb-12">
              {/* Form to block a date-time slot */}
              <div className="lg:col-span-4 bg-white border border-stone-borders p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                    Bloquear Día/Horario Nuevo
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1 font-light leading-relaxed">
                    Marca un día entero o un horario específico como ocupado. Esto se visualizará grayed-out (grisado) e inhabilitado en el formulario de reservas para los pacientes.
                  </p>
                </div>

                <form onSubmit={handleAddBlockedSlot} className="space-y-4">
                  {/* Select Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-650 block">Fecha a Bloquear *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="date"
                        value={blockDateInput}
                        onChange={(e) => setBlockDateInput(e.target.value)}
                        className="w-full rounded-none border border-stone-borders bg-white py-2.5 pl-10 pr-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                        required
                        min={new Date().toISOString().split('T')[0]} // Suggest from today onwards
                      />
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-650 block">Horario *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <select
                        value={blockTimeInput}
                        onChange={(e) => setBlockTimeInput(e.target.value)}
                        className="w-full rounded-none border border-stone-borders bg-white py-2.5 pl-10 pr-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden appearance-none"
                      >
                        <option value="all">Todo el día (Cerrado completo)</option>
                        <option value="11:30">11:30 hs (Sábados)</option>
                        <option value="14:30">14:30 hs</option>
                        <option value="16:00">16:00 hs</option>
                        <option value="17:30">17:30 hs</option>
                        <option value="19:00">19:00 hs</option>
                      </select>
                    </div>
                  </div>

                  {/* Reason Note */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-650 block">Nota / Motivo (Ej: Nombre del paciente)</label>
                    <input
                      type="text"
                      placeholder="Ej. Sofía Rossi (Pendiente confirmar)"
                      value={blockReasonInput}
                      onChange={(e) => setBlockReasonInput(e.target.value)}
                      className="w-full rounded-none border border-stone-borders bg-white py-2.5 px-3.5 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-none bg-stone-charcoal border border-stone-charcoal text-[#FDFCF8] font-bold text-[10px] uppercase tracking-[0.2em] py-3.5 cursor-pointer hover:bg-primary hover:border-primary transition-all duration-300"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Registrar Bloqueo Manual
                  </button>
                </form>
              </div>

              {/* List currently manual blocked slots */}
              <div className="lg:col-span-8 bg-white border border-stone-borders p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                    Agenda de Bloqueos Manuales ({blockedSlots.length})
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1 font-light leading-relaxed">
                    Listado de días y horarios que has inhabilitado manualmente de la agenda pública. Se sincroniza con el servidor en tiempo real cada vez que registras o eliminas una entrada.
                  </p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {blockedSlots.length === 0 ? (
                    <div className="text-center py-16 text-stone-400 font-light text-xs font-serif italic border border-dashed border-stone-borders bg-stone-sand/10">
                      No hay bloqueos manuales registrados por el momento. Todos los días y horarios que no estén reservados por pacientes están disponibles.
                    </div>
                  ) : (
                    // Sort by Date, then Time
                    [...blockedSlots]
                      .sort((a,b) => new Date(`${a.date}T${a.time === 'all' ? '00:00' : a.time}`).getTime() - new Date(`${b.date}T${b.time === 'all' ? '00:00' : b.time}`).getTime())
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-stone-borders bg-[#FDFCF8] hover:border-stone-charcoal transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="border border-stone-borders bg-stone-charcoal px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-stone-sand">
                                {slot.time === 'all' ? 'TODO EL DÍA' : `${slot.time} hs`}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-stone-charcoal pt-1">
                              {(() => {
                                const parts = slot.date.split('-');
                                if (parts.length === 3) {
                                  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                }
                                return slot.date;
                              })()}
                            </div>
                            {slot.reason && (
                              <p className="text-[11px] text-stone-500 font-light italic">
                                Nota: {slot.reason}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveBlockedSlot(slot.id)}
                            className="flex items-center gap-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 hover:border-red-350 px-3.5 py-2 text-[9px] uppercase font-bold tracking-wider rounded-none transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar Bloqueo
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {adminTab === 'bookings' && (
            <div className="grid gap-8 lg:grid-cols-12 items-start pb-12">
              {/* LEFT/MAIN AREA: Bookings list */}
              <div className="lg:col-span-8 bg-white border border-stone-borders p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                      Listado de Reservas registrados ({bookings.length})
                    </span>
                    <p className="text-[11px] text-stone-400 mt-1 font-light leading-relaxed">
                      Sincronizado de la base de datos de Clara en tiempo real.
                    </p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por alumno/tel..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="rounded-none border border-stone-borders bg-[#FDFCF8] px-3 py-1.5 pl-8 text-xs text-stone-charcoal placeholder:text-stone-400 focus:border-stone-charcoal focus:outline-hidden w-56 font-sans"
                    />
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  </div>
                </div>

                <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
                  {(() => {
                    const filtered = bookings.filter(b => {
                      const q = bookingSearchQuery.toLowerCase();
                      return (
                        b.userName?.toLowerCase().includes(q) ||
                        b.userEmail?.toLowerCase().includes(q) ||
                        b.userPhone?.toLowerCase().includes(q) ||
                        b.serviceName?.toLowerCase().includes(q) ||
                        b.id?.toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-16 text-stone-400 font-light text-xs font-serif italic border border-dashed border-stone-borders bg-stone-sand/10">
                          {bookingSearchQuery ? 'No se encontraron reservas con esos filtros.' : 'No hay reservas registradas en el sistema aún.'}
                        </div>
                      );
                    }

                    // Sort newest date first
                    return [...filtered]
                      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                      .map((book) => {
                        const isSelectedForEdit = editingBooking?.id === book.id;
                        return (
                          <div
                            key={book.id}
                            className={`p-5 border transition-all ${
                              isSelectedForEdit
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-stone-borders bg-[#FDFCF8] hover:border-stone-charcoal'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-1 bg-transparent">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                                    book.status === 'confirmed'
                                      ? 'bg-emerald-55/70 border-emerald-250 text-emerald-800'
                                      : book.status === 'cancelled'
                                      ? 'bg-stone-100 border-stone-200 text-stone-500 line-through'
                                      : 'bg-amber-50 border-amber-250 text-amber-800'
                                  }`}>
                                    {book.status === 'confirmed' ? 'Confirmado' : book.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                  </span>
                                  <span className="text-[10px] text-stone-400 font-mono">
                                    Código: {book.id}
                                  </span>
                                </div>

                                <h4 className="font-serif text-sm font-semibold text-stone-charcoal pt-1">
                                  {book.userName}
                                </h4>

                                <div className="text-xs space-y-1 pt-1 font-light text-stone-550">
                                  <p className="flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-stone-400 shrink-0" />
                                    <span className="font-medium text-stone-charcoal">{book.serviceName}</span>
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-stone-400 shrink-0" />
                                    <span className="capitalize">
                                      {(() => {
                                        const parts = book.date.split('-');
                                        if (parts.length === 3) {
                                          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                          return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                                        }
                                        return book.date;
                                      })()}
                                      {' '} a las <strong className="text-stone-charcoal font-medium">{book.time} hs</strong>
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <Phone className="h-3 w-3 text-stone-400 shrink-0" />
                                    <span>{book.userPhone}</span>
                                    {book.userEmail && <><span>|</span><span>{book.userEmail}</span></>}
                                  </p>
                                  {book.comments && (
                                    <p className="text-[11px] p-2 bg-stone-50/70 border border-stone-sand rounded-none italic mt-2 text-stone-500">
                                      Nota de alumno: "{book.comments}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => handleSelectBookingForEdit(book)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-stone-borders hover:bg-stone-sand text-stone-charcoal px-3 py-2 text-[9px] uppercase font-bold tracking-wider rounded-none transition-colors cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  Modificar / Ver
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Estás segura de eliminar completamente el turno de ${book.userName}? Esto liberará el turno de forma inmediata en la agenda pública.`)) {
                                      handleDeleteBookingCompletely(book.id);
                                    }
                                  }}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-red-200 bg-red-50/10 hover:bg-red-50 text-red-650 px-3 py-2 text-[9px] uppercase font-bold tracking-wider rounded-none transition-colors cursor-pointer"
                                  title="Eliminar permanentemente del servidor"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* RIGHT AREA: Side Edit form (only shown when editingBooking is set) */}
              <div className="lg:col-span-4 bg-white border border-stone-borders p-6 space-y-5">
                {editingBooking ? (
                  <form onSubmit={handleUpdateBooking} className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-charcoal block">
                        Modificar Ficha de Turno
                      </span>
                      <p className="text-[11px] text-stone-400 mt-1 font-light leading-relaxed">
                        Aplica cambios a valores reales del turno. Se guardan en el servidor y sincronizan instantáneamente.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Nombre del Alumno *</label>
                        <input
                          type="text"
                          value={ebName}
                          onChange={(e) => setEbName(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Teléfono / WhatsApp *</label>
                        <input
                          type="text"
                          value={ebPhone}
                          onChange={(e) => setEbPhone(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Correo Electrónico</label>
                        <input
                          type="email"
                          value={ebEmail}
                          onChange={(e) => setEbEmail(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                        />
                      </div>

                      {/* Service select */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Servicio Seleccionado</label>
                        <select
                          value={ebServiceId}
                          onChange={(e) => setEbServiceId(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                        >
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Fecha reservada *</label>
                        <input
                          type="date"
                          value={ebDate}
                          onChange={(e) => setEbDate(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Time */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Horario asignado *</label>
                        <input
                          type="text"
                          placeholder="Ej: 14:00"
                          value={ebTime}
                          onChange={(e) => setEbTime(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Comments */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Comentarios / Notas</label>
                        <textarea
                          rows={2}
                          value={ebComments}
                          onChange={(e) => setEbComments(e.target.value)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden resize-none font-sans"
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#000000] block">Estado del Turno</label>
                        <select
                          value={ebStatus}
                          onChange={(e) => setEbStatus(e.target.value as any)}
                          className="w-full rounded-none border border-stone-borders bg-[#FDFCF8] py-2 px-3 text-xs text-stone-charcoal focus:border-stone-charcoal focus:outline-hidden"
                        >
                          <option value="pending">Pendiente de confirmación</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="cancelled">Cancelado (Libera el cupo en agenda)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-none bg-stone-charcoal hover:bg-emerald-600 border border-stone-charcoal hover:border-emerald-600 text-[#FDFCF8] font-bold text-[9px] uppercase tracking-wider py-3 cursor-pointer transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBooking(null)}
                        className="flex-1 rounded-none border border-stone-borders bg-white hover:bg-stone-sand text-stone-500 font-bold text-[9px] uppercase tracking-wider py-3 cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-24 text-stone-400 font-light text-xs font-serif italic border border-dashed border-stone-borders bg-stone-sand/10">
                    Haz clic en "Modificar / Ver" en cualquiera de las tarjetas de reserva para gestionar sus detalles e información de contacto aquí.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
