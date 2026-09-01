/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import YogaExplainerSection from './components/YogaExplainerSection';
import EstilosPracticaSection from './components/EstilosPracticaSection';
import HorariosSection from './components/HorariosSection';
import ServicesPanel from './components/ServicesPanel';
import BookingForm from './components/BookingForm';
import MyReservations from './components/MyReservations';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import TherapeuticTeam from './components/TherapeuticTeam';
import ContactSection from './components/ContactSection';
import ZenBackgroundAudio from './components/ZenBackgroundAudio';
import FloatingNav from './components/FloatingNav';
import { SERVICES, DEFAULT_CAROUSEL_SLIDES } from './data';
import { Booking, Service, BlockedSlot, CarouselSlide } from './types';
import { 
  getServicesFromFirestore, 
  getBlockedSlotsFromFirestore, 
  getBookingsFromFirestore,
  getCarouselFromFirestore
} from './lib/firestoreStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'my-bookings'>('home');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [refreshFlag, setRefreshFlag] = useState<number>(0);
  
  // Services state and authentication togglers
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const cached = localStorage.getItem('clara_cached_services');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return SERVICES;
  });

  const [yogaSlides, setYogaSlides] = useState<CarouselSlide[]>(() => {
    try {
      const cached = localStorage.getItem('clara_cached_carousel1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_CAROUSEL_SLIDES;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);

  // Fetch updated services list, blocked slots and bookings on startup/refresh
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await fetch('/api/services', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.services) && data.services.length > 0) {
            setServices(data.services);
            try {
              localStorage.setItem('clara_cached_services', JSON.stringify(data.services));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching services from Firestore.', err);
      }

      const fsServices = await getServicesFromFirestore();
      setServices(fsServices);
    };

    const fetchCarousel = async () => {
      try {
        const resp = await fetch('/api/carousel/1', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
            setYogaSlides(data.slides);
            try {
              localStorage.setItem('clara_cached_carousel1', JSON.stringify(data.slides));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching carousel from Firestore.', err);
      }

      const fsSlides = await getCarouselFromFirestore(1);
      if (fsSlides && fsSlides.length > 0) {
        setYogaSlides(fsSlides);
      }
    };

    const fetchBlockedSlots = async () => {
      try {
        const resp = await fetch('/api/blocked-slots', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.blockedSlots)) {
            setBlockedSlots(data.blockedSlots);
            try {
              localStorage.setItem('clara_cached_blocked_slots', JSON.stringify(data.blockedSlots));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching blocked slots from Firestore.', err);
      }

      const fsSlots = await getBlockedSlotsFromFirestore();
      setBlockedSlots(fsSlots);
    };

    const fetchBookings = async () => {
      try {
        const resp = await fetch('/api/bookings', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.bookings)) {
            setBookings(data.bookings);
            try {
              localStorage.setItem('clara_cached_bookings', JSON.stringify(data.bookings));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching bookings from Firestore.', err);
      }

      const fsBookings = await getBookingsFromFirestore();
      setBookings(fsBookings);
    };

    fetchServices();
    fetchCarousel();
    fetchBlockedSlots();
    fetchBookings();
  }, [refreshFlag]);

  // Sync / count non-cancelled bookings to update the Navbar badges
  const updateBookingCount = () => {
    try {
      const stored = localStorage.getItem('yoga_shiatsu_bookings');
      if (stored) {
        const parsed: Booking[] = JSON.parse(stored);
        const activeOnes = parsed.filter(b => b.status !== 'cancelled');
        setBookingCount(activeOnes.length);
      } else {
        setBookingCount(0);
      }
    } catch (err) {
      console.error('Error counting bookings', err);
    }
  };

  useEffect(() => {
    updateBookingCount();
  }, [refreshFlag]);

  // Clean absolute URL anchor handler (e.g. https://.../#yoga, https://.../#reservar)
  useEffect(() => {
    const handleHashNavigation = () => {
      const rawHash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
      if (!rawHash) return;

      if (rawHash === 'reservar' || rawHash === 'book' || rawHash === 'reserva') {
        setActiveTab('book');
        const targetUrl = `${window.location.pathname}#reservar`;
        if (window.location.hash !== '#reservar') {
          window.history.replaceState(null, '', targetUrl);
        }
      } else if (rawHash === 'misturnos' || rawHash === 'turnos' || rawHash === 'my-bookings') {
        setActiveTab('my-bookings');
        const targetUrl = `${window.location.pathname}#misturnos`;
        if (window.location.hash !== '#misturnos') {
          window.history.replaceState(null, '', targetUrl);
        }
      } else {
        setActiveTab('home');
        const aliasMap: Record<string, string> = {
          'yoga-explainer': 'yoga',
          'estilos-practica': 'estilos',
          'horarios-section': 'horarios',
          'services-section': 'terapias',
          'servicios': 'terapias',
          'therapeutic-team-section': 'bio',
          'team': 'bio',
          'contact-section': 'contacto',
          'hero-section': 'inicio',
          'home': 'inicio',
        };
        const cleanHash = aliasMap[rawHash] || rawHash;
        const targetUrl = `${window.location.pathname}#${cleanHash}`;
        window.history.replaceState(null, '', targetUrl);

        setTimeout(() => {
          const el = document.getElementById(cleanHash) || document.getElementById(rawHash);
          if (el) {
            const navHeader = document.getElementById('desktop-floating-nav');
            const navHeight = (navHeader && window.innerWidth >= 768) ? navHeader.getBoundingClientRect().height : 0;
            const targetScrollTop = el.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
          }
        }, 200);
      }
    };

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);

  // Update URL hash when tab changes directly
  const handleTabChange = (tab: 'home' | 'book' | 'my-bookings') => {
    setActiveTab(tab);
    if (tab === 'book') {
      window.history.replaceState(null, '', `${window.location.pathname}#reservar`);
    } else if (tab === 'my-bookings') {
      window.history.replaceState(null, '', `${window.location.pathname}#misturnos`);
    } else if (tab === 'home') {
      window.history.replaceState(null, '', `${window.location.pathname}#inicio`);
    }
  };

  // Handle direct booking click on a particular service from catalog
  const handleSelectServiceDirectly = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    setActiveTab('book');
  };

  // Triggered when booking completes successfully
  const handleBookingSuccess = () => {
    setRefreshFlag(prev => prev + 1);
    setPreselectedServiceId(null); // Clear once processed
  };

  const handleStartPlainBooking = () => {
    setPreselectedServiceId(null);
    setActiveTab('book');
  };

  const handleScrollToServices = () => {
    window.history.replaceState(null, '', `${window.location.pathname}#terapias`);
    if (activeTab !== 'home') {
      setActiveTab('home');
      // Wait for tab switch rendering before scrolling
      setTimeout(() => {
        const el = document.getElementById('terapias') || document.getElementById('services-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('terapias') || document.getElementById('services-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="zen-app-root" className="min-h-screen bg-stone-sand flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      
      {isAdminActive ? (
        <AdminPanel 
          services={services}
          onServicesUpdated={(updated) => setServices(updated)}
          blockedSlots={blockedSlots}
          onBlockedSlotsUpdated={(updated) => setBlockedSlots(updated)}
          onClose={() => setIsAdminActive(false)}
          bookings={bookings}
          onBookingsUpdated={(updated) => setBookings(updated)}
          carouselSlides={yogaSlides}
          onCarouselUpdated={(updated) => setYogaSlides(updated)}
        />
      ) : (
        <>
          {/* Desktop & Mobile Navigation (Desktop Header above Hero + Mobile Bar) */}
          <FloatingNav 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />

          {/* Main Dynamic Workspace body */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div
                  key="home-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-0"
                >
                  <Hero 
                    onStartBooking={handleStartPlainBooking}
                    onExploreServices={handleScrollToServices}
                    onMyBookings={() => handleTabChange('my-bookings')}
                  />
                  
                  {/* Screen 2: Yoga (Introducción y Método con Carrusel de 3 fotos) */}
                  <YogaExplainerSection slides={yogaSlides} />

                  {/* Screen 3: Estilos de Práctica */}
                  <EstilosPracticaSection />

                  {/* Screen 4: Horarios & Abonos */}
                  <HorariosSection services={services} />

                  {/* Screen 5: Sesiones & Terapias */}
                  <ServicesPanel services={services} onSelectService={handleSelectServiceDirectly} />
                  
                  {/* Screen 6: Bío (Clara) */}
                  <TherapeuticTeam />

                  {/* Screen 7: Contacto */}
                  <ContactSection onAdminClick={() => setIsAdminActive(true)} />
                </motion.div>
              )}

              {activeTab === 'book' && (
                <motion.div
                  key="book-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-stone-50/50 min-h-[70vh]"
                >
                  <BookingForm 
                    services={services}
                    preselectedServiceId={preselectedServiceId}
                    onBookingSuccess={handleBookingSuccess}
                    onViewReservations={() => handleTabChange('my-bookings')}
                    onGoHome={() => handleTabChange('home')}
                    blockedSlots={blockedSlots}
                    bookings={bookings}
                  />
                </motion.div>
              )}

              {activeTab === 'my-bookings' && (
                <motion.div
                  key="my-bookings-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-stone-50/50 min-h-[70vh]"
                >
                  <MyReservations 
                    services={services}
                    onStartBooking={handleStartPlainBooking}
                    onGoHome={() => handleTabChange('home')}
                    refreshFlag={refreshFlag}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Structured Footer for non-home subviews */}
          {activeTab !== 'home' && (
            <div className="pb-16 md:pb-0">
              <Footer onAdminClick={() => setIsAdminActive(true)} />
            </div>
          )}
        </>
      )}

      {/* Zen Ambient Background Audio */}
      <ZenBackgroundAudio />

    </div>
  );
}
