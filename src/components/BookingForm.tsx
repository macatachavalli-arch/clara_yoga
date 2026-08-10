/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, Calendar, Clock, User, Mail, Phone, ChevronRight, 
  ChevronLeft, MessageSquare, AlertCircle, Sparkles, Heart 
} from 'lucide-react';
import { HOLES_CALENDAR } from '../data';
import { Service, Booking, BlockedSlot } from '../types';
import { getBookingsFromFirestore, saveBookingsToFirestore } from '../lib/firestoreStorage';

interface BookingFormProps {
  services: Service[];
  preselectedServiceId: string | null;
  onBookingSuccess: () => void;
  onViewReservations: () => void;
  onGoHome?: () => void;
  blockedSlots?: BlockedSlot[];
  bookings?: Booking[];
}

export default function BookingForm({ 
  services,
  preselectedServiceId, 
  onBookingSuccess, 
  onViewReservations,
  onGoHome,
  blockedSlots = [],
  bookings = []
}: BookingFormProps) {
  
  const formatYogaPrices = (s: Service, addSuffix = false) => {
    const parts: string[] = [];
    const p4 = s.priceYoga4 || s.price;
    if (p4 && p4 > 0) parts.push(`Abono 4: $${p4.toLocaleString('es-AR')}${addSuffix ? ' ARS' : ''}`);
    const p8 = s.priceYoga8 || s.priceYoga8to12;
    if (p8 && p8 > 0) parts.push(`Abono 8: $${p8.toLocaleString('es-AR')}${addSuffix ? ' ARS' : ''}`);
    if (s.priceYoga12 && s.priceYoga12 > 0) parts.push(`Abono 12: $${s.priceYoga12.toLocaleString('es-AR')}${addSuffix ? ' ARS' : ''}`);
    return parts.length > 0 ? parts.join(' | ') : 'A consultar';
  };
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Date and Time selection
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // HH:MM
  
  // Client Info
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+54 9 ');
  const [clientComments, setClientComments] = useState<string>('');
  
  // Validation messages
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Generated success ticket details
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [requestSentVia, setRequestSentVia] = useState<'whatsapp' | 'email' | null>(null);

  // Set pre-selected service if provided
  useEffect(() => {
    if (preselectedServiceId) {
      const found = services.find(s => s.id === preselectedServiceId);
      if (found) {
        if (found.category === 'yoga' || found.name.toLowerCase().includes('yoga')) {
          const message = `¡Hola Clara! Quisiera consultar y coordinar mi lugar para la clase de Yoga: ${found.name}`;
          window.open(`https://wa.me/5492215232417?text=${encodeURIComponent(message)}`, '_blank');
          if (onGoHome) onGoHome();
        } else if (found.category === 'shiatsu' || found.category === 'reiki' || found.name.toLowerCase().includes('shiatsu') || found.name.toLowerCase().includes('reiki')) {
          const message = `¡Hola Clara! Quisiera reservar mi turno para: ${found.name}`;
          window.open(`https://wa.me/549221523147?text=${encodeURIComponent(message)}`, '_blank');
          if (onGoHome) onGoHome();
        } else {
          setSelectedService(found);
          setStep(2); // Jump straight to date selection for a smoother UX!
        }
      }
    }
  }, [preselectedServiceId]);

  // Interface for Date item inside the week grid
  interface DateItem {
    iso: string;
    dayNum: number;
    dayName: string;
    monthLabel: string;
    year: number;
  }

  // Grid generator helper with day-of-week sorting (columns: LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM)
  const getWeeksGrid = () => {
    const weeks: (DateItem | null)[][] = [];
    const today = new Date();
    
    // Find Monday of the current week (getDay(): 0=Sun, 1=Mon, 2=Tue, etc.)
    const currentDay = today.getDay(); 
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    // Generate up to 6 weeks to cover at least 30-35 valid calendar days
    for (let w = 0; w < 6; w++) {
      const weekRow: (DateItem | null)[] = [null, null, null, null, null, null, null]; // [LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM]
      const targetOffsets = [0, 1, 2, 3, 4, 5, 6]; // Offsets from Monday (Monday=0, Tuesday=1 ... Sunday=6)
      
      targetOffsets.forEach((offset, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + offset + (w * 7));
        
        // Normalize for strict comparison
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        const compareToday = new Date(today);
        compareToday.setHours(0, 0, 0, 0);
        
        const compareMax = new Date(today);
        compareMax.setDate(today.getDate() + 35); // Look up to 35 days ahead
        compareMax.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() >= compareToday.getTime() && compareDate.getTime() <= compareMax.getTime()) {
          weekRow[index] = {
            iso: date.toISOString().split('T')[0],
            dayNum: date.getDate(),
            dayName: date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase(),
            monthLabel: date.toLocaleDateString('es-AR', { month: 'long' }),
            year: date.getFullYear(),
          };
        }
      });
      
      // Keep week if at least one day is valid
      if (weekRow.some(day => day !== null)) {
        weeks.push(weekRow);
      }
    }
    return weeks;
  };

  // Helper to get available slots for a specific date (Tuesday restrictions, Thursday restrictions, Saturday standard slots)
  const getSlotsForDate = (dateStr: string) => {
    if (!dateStr) return HOLES_CALENDAR;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 0) { // Monday, Tuesday, Wednesday, Sunday
      return [];
    }
    if (dayOfWeek === 4) { // Thursday: remove 19:00 hs and 17:30 hs
      return HOLES_CALENDAR.filter(slot => slot !== '19:00' && slot !== '17:30');
    }
    if (dayOfWeek === 5) { // Friday: only 17:30 hs as requested
      return ['17:30'];
    }
    if (dayOfWeek === 6) { // Saturday: only 14:30 hs as requested
      return ['14:30'];
    }
    // Default fallback
    return HOLES_CALENDAR;
  };

  // Helper to check if a specific time on a chosen date is blocked (manual lock or existing reservation)
  const isTimeSlotBlocked = (dateStr: string, timeStr: string) => {
    if (!dateStr) return false;
    
    // Check if entire day is blocked by Clara
    const hasAllBlock = blockedSlots.some(s => s.date === dateStr && s.time === 'all');
    if (hasAllBlock) return true;

    // Check specific manual block slot
    const isManualBlocked = blockedSlots.some(s => s.date === dateStr && s.time === timeStr);
    if (isManualBlocked) return true;

    // Auto-disable if already booked by anyone (where booking is not cancelled)
    const isAlreadyBooked = bookings.some(
      b => b.date === dateStr && b.time === timeStr && b.status !== 'cancelled'
    );
    if (isAlreadyBooked) return true;

    // Same-day check: block if slot hour has already passed today
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (dateStr === todayIso) {
      const [slotHours, slotMinutes] = timeStr.split(':').map(Number);
      const slotTime = new Date(now);
      slotTime.setHours(slotHours, slotMinutes, 0, 0);
      if (slotTime.getTime() <= now.getTime()) {
        return true;
      }
    }

    return false;
  };

  // Helper to determine if a full day (date) is blocked or fully booked
  const isDateBlocked = (dateStr: string) => {
    if (!dateStr) return false;

    // Mondays, Tuesdays, Wednesdays, and Sundays are always blocked/disabled
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 0) {
      return true;
    }

    // Check if there is an "all" block for this date
    const hasAllBlock = blockedSlots.some(s => s.date === dateStr && s.time === 'all');
    if (hasAllBlock) return true;

    // Check if every single slot for this date is fully blocked/booked
    const slots = getSlotsForDate(dateStr);
    if (slots.length === 0) return true;

    const isAllSlotsBlocked = slots.every(slot => {
      return isTimeSlotBlocked(dateStr, slot);
    });

    return isAllSlotsBlocked;
  };

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    if (service.category === 'yoga' || service.name.toLowerCase().includes('yoga')) {
      const message = `¡Hola Clara! Quisiera consultar y coordinar mi lugar para la clase de Yoga: ${service.name}`;
      window.open(`https://wa.me/5492215232417?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }
    setSelectedService(service);
    setErrorMsg('');
    setStep(2);
  };

  // Step 2 Validation: Check Date & Time
  const handleNextToInfo = () => {
    if (!selectedDate) {
      setErrorMsg('Por favor seleccione una fecha en el calendario.');
      return;
    }
    if (!selectedTime) {
      setErrorMsg('Por favor elija un horario disponible.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  // Step 3 Validation: Form inputs & Submit Booking
  const handleSubmitBooking = (e: FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      setErrorMsg('Por favor ingrese su nombre completo.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clientEmail.trim() || !emailRegex.test(clientEmail)) {
      setErrorMsg('Por favor ingrese un correo electrónico válido.');
      return;
    }

    if (!clientPhone.trim() || clientPhone.length < 7) {
      setErrorMsg('Por favor ingrese un número telefónico de contacto válido.');
      return;
    }

    if (!selectedService) {
      setErrorMsg('No hay ningún servicio seleccionado.');
      return;
    }

    // Compose Booking object
    const bookingCode = `ZEN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: bookingCode,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      date: selectedDate,
      time: selectedTime,
      userName: clientName,
      userEmail: clientEmail,
      userPhone: clientPhone,
      comments: clientComments,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage & server database / Firestore
    const saveBooking = async () => {
      try {
        const currentList = await getBookingsFromFirestore();
        const updatedList = [...currentList, newBooking];
        await saveBookingsToFirestore(updatedList);

        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking: newBooking })
          });
        } catch (apiErr) {
          console.warn('Backend API endpoint missing. Saved directly to Firestore.', apiErr);
        }

        const existing = localStorage.getItem('yoga_shiatsu_bookings');
        const list: Booking[] = existing ? JSON.parse(existing) : [];
        list.push(newBooking);
        localStorage.setItem('yoga_shiatsu_bookings', JSON.stringify(list));
        
        setConfirmedBooking(newBooking);
        setErrorMsg('');
        setStep(4);
        onBookingSuccess(); // notify parent component to refresh count badge!
      } catch (err) {
        console.warn('Network or backend error. Storing in browser cache fallback.', err);
        const existing = localStorage.getItem('yoga_shiatsu_bookings');
        const list: Booking[] = existing ? JSON.parse(existing) : [];
        list.push(newBooking);
        localStorage.setItem('yoga_shiatsu_bookings', JSON.stringify(list));

        setConfirmedBooking(newBooking);
        setErrorMsg('');
        setStep(4);
        onBookingSuccess();
      }
    };
    saveBooking();
  };

  // Simple date formatter
  const formatDateLabel = (isoString: string) => {
    if (!isoString) return '';
    const parts = isoString.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Generate dynamic WhatsApp link prefilled with reservation details
  const getWhatsAppLink = () => {
    if (!confirmedBooking || !selectedService) return '#';
    
    // WhatsApp number configured for Clara's studio
    const whatsappPhone = '542215232417';
    
    // Using ultra-safe, highly compatible emojis to ensure they render perfectly everywhere
    const message = `¡Hola Clara! Acabo de registrar un turno desde la web y me gustaría confirmarlo:\n\n` +
      `🌸 *Disciplina:* ${selectedService.name}\n` +
      `👤 *Alumno/Paciente:* ${confirmedBooking.userName}\n` +
      `📞 *Teléfono de contacto:* ${confirmedBooking.userPhone}\n` +
      `📅 *Fecha:* ${formatDateLabel(confirmedBooking.date)}\n` +
      `⏰ *Horario:* ${confirmedBooking.time} hs\n` +
      `⏳ *Duración:* ${selectedService.duration} min\n` +
      `💵 *Inversión:* ${selectedService.price && selectedService.price > 0 ? `$${selectedService.price.toLocaleString('es-AR')} ARS` : 'A consultar'}\n` +
      (confirmedBooking.comments ? `\n💬 *Comentarios:* "${confirmedBooking.comments}"` : '') +
      `\n\nQuedo a la espera de la confirmación. ¡Muchas gracias!`;

    return `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(message)}`;
  };

  // Generate dynamic email link prefilled with reservation details
  const getEmailLink = () => {
    if (!confirmedBooking || !selectedService) return '#';
    
    const emailTo = 'clara.ch.yoga@gmail.com';
    const subject = `Solicitud de Turno: ${selectedService.name} - ${confirmedBooking.userName}`;
    const body = `¡Hola Clara!\n\nAcabo de registrar una solicitud de turno desde la web y me gustaría confirmarla:\n\n` +
      `🌸 Disciplina: ${selectedService.name}\n` +
      `👤 Alumno/Paciente: ${confirmedBooking.userName}\n` +
      `📞 Teléfono de contacto: ${confirmedBooking.userPhone}\n` +
      `✉️ Correo electrónico: ${confirmedBooking.userEmail}\n` +
      `📅 Fecha: ${formatDateLabel(confirmedBooking.date)}\n` +
      `⏰ Horario: ${confirmedBooking.time} hs\n` +
      `⏳ Duración: ${selectedService.duration} min\n` +
      `💵 Inversión: ${selectedService.price && selectedService.price > 0 ? `$${selectedService.price.toLocaleString('es-AR')} ARS` : 'A consultar'}` +
      (confirmedBooking.comments ? `\n\n💬 Comentarios: "${confirmedBooking.comments}"` : '') +
      `\n\nQuedo a la espera de la confirmación. ¡Muchas gracias!`;

    return `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div id="booking-wizard-container" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
      
      {onGoHome && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </button>
        </div>
      )}
      
      {/* Wizard Progress Stepper - Sharp minimalist boxes */}
      {step < 4 && (
        <div id="progress-bar-steps" className="mb-6 sm:mb-12 flex items-center justify-between px-1 sm:px-12 relative">
          <div className="absolute top-4 sm:top-5 left-8 sm:left-12 right-8 sm:right-12 h-[1px] bg-stone-borders -z-10" />
          {[
            { num: 1, label: 'Elegir Sesión' },
            { num: 2, label: 'Fecha y Hora' },
            { num: 3, label: 'Tus Datos' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1.5 sm:gap-2 bg-stone-sand px-1.5 sm:px-3 relative z-10">
              <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-none text-xs font-bold border transition-all duration-300 ${
                step >= s.num 
                  ? 'bg-stone-charcoal border-stone-charcoal text-stone-sand' 
                  : 'bg-white border-stone-borders text-stone-400'
              }`}>
                {step > s.num ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : s.num}
              </div>
              <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.11em] sm:tracking-[0.15em] ${
                step >= s.num ? 'text-stone-charcoal' : 'text-stone-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-none bg-[#FDFCF8] border border-red-200 p-4 text-xs text-red-700 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span className="font-light">{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center max-w-lg mx-auto px-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Reserva de Turno</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-charcoal mt-1">Elige la disciplina o terapia</h3>
            <p className="text-xs text-stone-400 mt-2 font-light">
              Selecciona una de las clases de Yoga o una sesión de masaje individual Shiatsu para continuar.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                onClick={() => handleServiceSelect(s)}
                className="group relative cursor-pointer rounded-none border border-stone-borders bg-white p-4 sm:p-6 transition-all hover:border-stone-charcoal flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="border border-stone-borders bg-stone-sand px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-stone-charcoal">
                      {s.category === 'yoga' ? 'Yoga' : s.category === 'shiatsu' ? 'Masaje Shiatsu Zen' : s.category === 'combo' ? 'Combo de Bienestar' : 'Reiki Usui'}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary text-right">
                      {s.category === 'yoga' ? (
                        formatYogaPrices(s)
                      ) : (
                        s.price && s.price > 0 ? `$${s.price.toLocaleString('es-AR')}` : 'A consultar'
                      )}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm sm:text-base font-semibold text-stone-charcoal mt-2.5 sm:mt-3.5 group-hover:text-primary transition-colors">
                    {s.name}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1.5 sm:mt-2 line-clamp-2 font-light leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-borders flex items-center justify-between text-[10px] text-stone-400 font-sans tracking-wide">
                  <span className="uppercase font-semibold">{s.duration} min</span>
                  {s.category === 'yoga' || s.name.toLowerCase().includes('yoga') ? (
                    <span className="text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Reservar mi lugar <ChevronRight className="h-3 w-3 text-primary" />
                    </span>
                  ) : (
                    <span className="text-stone-charcoal font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Seleccionar <ChevronRight className="h-3 w-3 text-primary" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* STEP 2: Date & Time picker */}
      {step === 2 && selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header of selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-borders pb-4 gap-2.5">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-700 cursor-pointer self-start"
            >
              <ChevronLeft className="h-4 w-4" /> Volver a terapias
            </button>
            <div className="text-left sm:text-right">
              <span className="text-[9px] text-[#867768] uppercase tracking-widest block">Servicio elegido</span>
              <span className="font-serif text-sm font-semibold text-stone-charcoal">{selectedService.name}</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            
            {/* Custom Interactive Calendar Columns */}
            <div className="md:col-span-12">
              <h4 className="font-serif text-lg sm:text-xl font-light text-stone-charcoal mb-3 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                1. Elige la Fecha para tu Sesión
              </h4>

              <div className="w-full rounded-none border border-stone-300 bg-[#FDFCF8] p-3 sm:p-5 shadow-xs">
                {/* Headers with improved contrast and backgrounds */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3.5 text-center text-[10px] sm:text-xs font-bold font-sans tracking-wide uppercase">
                  <div className="text-stone-500 font-semibold bg-stone-100/50 py-1">Lun</div>
                  <div className="text-stone-charcoal font-bold bg-stone-100 py-1">Mar</div>
                  <div className="text-stone-500 font-semibold bg-stone-100/50 py-1">Mié</div>
                  <div className="text-stone-charcoal font-bold bg-stone-100 py-1">Jue</div>
                  <div className="text-stone-charcoal font-bold bg-stone-100 py-1">Vie</div>
                  <div className="text-stone-charcoal font-bold bg-stone-100 py-1">Sáb</div>
                  <div className="text-stone-500 font-semibold bg-stone-100/50 py-1">Dom</div>
                </div>
                
                {/* Rows of weeks */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {getWeeksGrid().map((weekRow, wIdx) => (
                    <div key={wIdx} className="grid grid-cols-7 gap-1 sm:gap-2">
                      {weekRow.map((dayItem, dIdx) => {
                        if (!dayItem) {
                          return (
                            <div 
                              key={`empty-${wIdx}-${dIdx}`} 
                              className="h-[56px] sm:h-[68px] bg-stone-50/50 border border-stone-200/40 opacity-20"
                            />
                          );
                        }
                        
                        const isSelected = selectedDate === dayItem.iso;
                        const isBlocked = isDateBlocked(dayItem.iso);
                        
                        // In our weekRow layout, dIdx maps to: 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb, 6=Dom
                        const isClosedDay = dIdx === 0 || dIdx === 1 || dIdx === 2 || dIdx === 6;
                        
                        return (
                          <button
                            key={dayItem.iso}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => {
                              setSelectedDate(dayItem.iso);
                              setSelectedTime(''); // Reset selected time when date changes
                              setErrorMsg('');
                            }}
                            className={`flex flex-col items-center justify-center p-0.5 sm:p-1.5 rounded-none border transition-all h-[56px] sm:h-[68px] ${
                              isBlocked
                                ? 'bg-stone-100/90 border-stone-200 text-stone-500 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-stone-charcoal border-stone-charcoal text-stone-sand font-bold shadow-xs cursor-pointer ring-1 ring-stone-charcoal'
                                  : 'bg-white border-stone-300 hover:border-stone-charcoal text-stone-900 font-semibold cursor-pointer hover:bg-stone-50 hover:shadow-2xs'
                            }`}
                          >
                            <span className={`text-sm sm:text-base font-serif font-bold my-0.5 ${isBlocked ? 'text-stone-400 font-light' : isSelected ? 'text-stone-sand' : 'text-stone-905'}`}>
                              {dayItem.dayNum}
                            </span>
                            <span className={`text-[7.5px] sm:text-[8.5px] uppercase tracking-wider font-semibold truncate max-w-full font-sans ${isBlocked ? 'text-stone-500' : isSelected ? 'text-stone-sand/90' : 'text-[#867768]'}`}>
                              {isClosedDay ? 'No disp.' : isBlocked ? 'Completo' : dayItem.monthLabel.slice(0, 3)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Time slot picker row with high contrast adjustments */}
            <div className="md:col-span-12">
              <h4 className="font-serif text-lg sm:text-xl font-light text-stone-charcoal mb-3 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" />
                2. Horarios Disponibles
              </h4>
 
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 sm:grid-cols-4 md:grid-cols-6 rounded-none border border-stone-300 bg-white p-2.5 sm:p-4 shadow-2xs">
                {getSlotsForDate(selectedDate).map((timeSlot) => {
                  const isSelected = selectedTime === timeSlot;
                  const isBlocked = isTimeSlotBlocked(selectedDate, timeSlot);
                  return (
                    <button
                      key={timeSlot}
                      type="button"
                      disabled={!selectedDate || isBlocked}
                      onClick={() => {
                        setSelectedTime(timeSlot);
                        setErrorMsg('');
                      }}
                      className={`py-2 sm:py-3 rounded-none border text-[11px] sm:text-xs font-mono font-bold transition-all text-center ${
                        isBlocked
                          ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80 line-through'
                          : isSelected
                            ? 'bg-stone-charcoal border-stone-charcoal text-stone-sand shadow-sm cursor-pointer'
                            : 'bg-white border-stone-300 hover:border-stone-charcoal text-stone-900 cursor-pointer hover:bg-stone-50'
                      }`}
                    >
                      {timeSlot} hs
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Wizard Actions Footer */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-stone-borders pt-5">
            <div className="text-[15px] text-stone-500 font-serif italic font-light text-center sm:text-left">
              {selectedDate && selectedTime ? (
                <span className="text-stone-700 font-medium">
                  Fecha asignada: <strong className="text-primary not-italic font-bold font-sans tracking-wide block sm:inline">{formatDateLabel(selectedDate)}</strong> a las <strong className="text-primary not-italic font-bold font-mono">{selectedTime} hs</strong>
                </span>
              ) : (
                'Elija día y hora correspondientes para continuar.'
              )}
            </div>

            <button
              onClick={handleNextToInfo}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-none bg-stone-charcoal border border-stone-charcoal px-5 py-3 sm:px-7 sm:py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-sand hover:bg-primary hover:border-primary active:scale-98 transition-all duration-300 cursor-pointer"
            >
              Siguiente Paso <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Client Details */}
      {step === 3 && selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header of selection */}
          <div className="flex items-center justify-between border-b border-stone-borders pb-5">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Volver a fecha
            </button>
            <div className="text-right">
              <span className="text-[9px] text-[#867768] uppercase tracking-widest block">Resumen Horario</span>
              <span className="font-serif text-sm font-semibold text-stone-charcoal">
                {formatDateLabel(selectedDate)} — {selectedTime} hs
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitBooking} className="grid gap-4 sm:gap-6 md:grid-cols-12 rounded-none border border-stone-borders bg-white p-4 sm:p-8">
            
            <div className="md:col-span-12">
              <h3 className="font-serif text-lg sm:text-xl font-light text-stone-charcoal">Reserva de Turno: Tus Datos de Contacto</h3>
              <p className="text-xs text-stone-400 mt-1 font-light">
                La solicitud quedará registrada. Te enviaré un correo de confirmación antes de la sesión.
              </p>
            </div>

            {/* Full Name input */}
            <div className="md:col-span-12 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-650 block">Nombre Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder=""
                  className="w-full rounded-none border border-stone-borders bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Email input */}
            <div className="md:col-span-6 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-650 block">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder=""
                  className="w-full rounded-none border border-stone-borders bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="md:col-span-6 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-650 block">Teléfono Móvil (WhatsApp) *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder=""
                  className="w-full rounded-none border border-stone-borders bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Comments input */}
            <div className="md:col-span-12 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-650 block">Comentarios, lesiones o síntomas (Opcional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <textarea
                  value={clientComments}
                  onChange={(e) => setClientComments(e.target.value)}
                  placeholder=""
                  rows={2}
                  className="w-full rounded-none border border-stone-borders bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Summary card before submitting */}
            <div className="md:col-span-12 mt-2 rounded-none bg-stone-sand border border-stone-borders p-3 sm:p-4">
              <div className="flex justify-between items-center text-xs text-stone-500 gap-2">
                <span className="font-serif italic text-stone-400 text-left shrink-0">Servicio seleccionado:</span>
                <span className="font-bold text-stone-800 text-right">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500 mt-2 gap-2">
                <span className="font-serif italic text-stone-400 text-left shrink-0">Inversión de sesión:</span>
                <span className="font-bold text-primary font-mono text-right">
                  {selectedService.category === 'yoga' ? (
                    formatYogaPrices(selectedService, true)
                  ) : (
                    selectedService.price && selectedService.price > 0 ? `$${selectedService.price.toLocaleString('es-AR')} ARS` : 'A consultar'
                  )}
                </span>
              </div>
            </div>

            {/* Form actions */}
            <div className="md:col-span-12 border-t border-stone-borders pt-4 sm:pt-6 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-none bg-stone-charcoal border border-stone-charcoal px-5 py-3 sm:px-8 sm:py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-sand hover:bg-primary hover:border-primary active:scale-98 transition-all duration-300 cursor-pointer"
              >
                Concluir y Confirmar Turno
              </button>
            </div>
            
          </form>
        </motion.div>
      )}

      {/* STEP 4: Successful Confirmation */}
      {step === 4 && confirmedBooking && selectedService && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-none border border-stone-borders bg-white p-4 sm:p-10 shadow-none text-center space-y-6 sm:space-y-8"
        >
          {/* Zen Stamp */}
          <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-none bg-stone-sand text-stone-charcoal border border-stone-borders animate-pulse">
            <Check className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          <div id="confirmation-header">
            <h3 className="font-serif text-xl sm:text-3xl font-light text-stone-charcoal px-2">¡Tu Reserva se ha registrado con éxito!</h3>
            <p className="text-[9px] sm:text-[10px] text-primary tracking-[0.15em] sm:tracking-[0.2em] font-medium uppercase mt-2">
              Confirmado • Clara Chiaravalli • Yoga & Shiatsu
            </p>
          </div>

          {/* Ticket Card */}
          <div className="mx-auto max-w-md border border-dashed border-stone-borders rounded-none p-4 sm:p-6 bg-stone-sand relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
            
            <h4 className="font-serif text-sm sm:text-base font-semibold text-stone-charcoal text-left border-b border-stone-borders pb-2.5">Resumen de Turno Zen</h4>
            
            <div className="mt-3.5 space-y-2 text-xs text-stone-500 text-left">
              <div className="flex justify-between gap-4">
                <span className="font-serif italic text-stone-400">Servicio:</span>
                <strong className="text-stone-750 text-right">{selectedService.name}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-serif italic text-stone-400">Paciente / Alumno:</span>
                <strong className="text-stone-750 text-right">{confirmedBooking.userName}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-serif italic text-stone-400">Fecha:</span>
                <strong className="text-stone-750 text-right">{formatDateLabel(confirmedBooking.date)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-serif italic text-stone-400">Horario:</span>
                <strong className="text-primary font-bold font-mono">{confirmedBooking.time} hs</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-serif italic text-stone-400">Duración:</span>
                <strong className="text-stone-700">{selectedService.duration} min</strong>
              </div>
              <div className="flex justify-between border-t border-stone-borders pt-2.5 text-sm">
                <span className="font-serif font-semibold text-stone-600">Inversión total:</span>
                <strong className="text-primary font-mono font-bold">{selectedService.price && selectedService.price > 0 ? `$${selectedService.price.toLocaleString('es-AR')} ARS` : 'A consultar'}</strong>
              </div>
            </div>

            {confirmedBooking.comments && (
              <div className="mt-3 rounded-none bg-white p-2.5 border border-stone-borders text-left">
                <span className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block">Notas del paciente:</span>
                <p className="text-xs text-stone-500 mt-1 italic font-light">"{confirmedBooking.comments}"</p>
              </div>
            )}
          </div>

          {/* Guidance details */}
          <div className="max-w-xl mx-auto rounded-none bg-[#FDFCF8] border border-stone-borders p-4 sm:p-5 text-left flex gap-3 sm:gap-3.5">
            <Heart className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-sans text-[10px] font-bold text-stone-charcoal uppercase tracking-[0.12em] sm:tracking-[0.15em]">Recomendaciones para tu Visita:</h5>
              <ul className="list-disc list-inside text-xs text-stone-550 space-y-1 leading-relaxed pt-1.5 font-light">
                <li>Asistir con ropa cómoda preferentemente de algodón.</li>
                <li>Por favor llegar 10 minutos antes.</li>
                <li>Si necesitás reprogramar tu sesión avisar con 24 horas de antelación.</li>
              </ul>
            </div>
          </div>

          {/* Direct Actions in screen 4 */}
          <div className="pt-6 sm:pt-8 flex flex-col items-center justify-center gap-4 border-t border-stone-borders">
            <div className="w-full max-w-xl mx-auto rounded-none border border-stone-borders bg-[#FDFCF8] p-5 text-center">
              <span className="inline-block bg-[#FDFCF8] text-stone-605 border border-[#867768]/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 mb-2.5">
                🔒 Turno Bloqueado Exclusivamente Para Ti
              </span>
              <h5 className="font-serif text-base font-semibold text-stone-charcoal">
                El día y horario elegido ya quedaron inhabilitados en el calendario
              </h5>
              <p className="text-xs text-stone-550 mt-2 font-light leading-relaxed text-center">
                Para tu tranquilidad, el sistema ha reservado tu horario automáticamente de manera firme en la web para que ningún otro usuario pueda seleccionarlo. Te sugerimos enviar los detalles a Clara para coordinar o sacarte cualquier duda:
              </p>

              {/* Selection Options - Optional triggers */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setRequestSentVia('whatsapp')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-305 cursor-pointer rounded-none text-white border ${
                    requestSentVia === 'whatsapp'
                      ? 'bg-emerald-700 border-emerald-700 font-extrabold'
                      : 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  Enviar por WhatsApp
                </a>

                <a
                  href={getEmailLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setRequestSentVia('email')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-305 cursor-pointer rounded-none border ${
                    requestSentVia === 'email'
                      ? 'bg-stone-charcoal text-stone-sand border-stone-charcoal font-extrabold'
                      : 'bg-white text-stone-charcoal border-stone-borders hover:border-stone-charcoal hover:bg-stone-50'
                  }`}
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  Enviar por Correo
                </a>
              </div>
            </div>

            {/* Post-submission Navigation Actions - Now enabled instantly! */}
            <div className="w-full text-center space-y-2 mt-2">
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 w-full sm:w-auto mt-2">
                <button
                  onClick={() => {
                    // Reset state
                    setStep(1);
                    setSelectedService(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setClientComments('');
                    setConfirmedBooking(null);
                    setRequestSentVia(null);
                  }}
                  className="rounded-none border border-stone-borders bg-transparent px-4 py-2.5 sm:px-6 sm:py-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border-stone-borders text-stone-charcoal hover:bg-stone-charcoal hover:text-stone-sand cursor-pointer"
                >
                  Agendar otro turno
                </button>

                <button
                  onClick={onViewReservations}
                  className="rounded-none px-4 py-2.5 sm:px-6 sm:py-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 bg-stone-charcoal border border-stone-charcoal text-stone-sand hover:bg-primary hover:border-primary cursor-pointer"
                >
                  Ver mis turnos agendados
                </button>
              </div>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
