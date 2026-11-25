/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import YogaExplainerSection from './components/YogaExplainerSection';
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
import { SERVICES, DEFAULT_CAROUSEL_SLIDES, DEFAULT_PRACTICE_STYLES } from './data';
import { Booking, Service, BlockedSlot, CarouselSlide, PracticeStyle, SectionVisibility, DEFAULT_SECTION_VISIBILITY } from './types';
import { 
  getServicesFromFirestore, 
  getBlockedSlotsFromFirestore, 
  getBookingsFromFirestore,
  getCarouselFromFirestore,
  getEstilosFromFirestore,
  getSectionVisibilityFromFirestore,
  saveSectionVisibilityToFirestore
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

  const [estilos, setEstilos] = useState<PracticeStyle[]>(() => {
    try {
      const cached = localStorage.getItem('clara_cached_estilos');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PRACTICE_STYLES;
  });

  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(() => {
    try {
      const cached = localStorage.getItem('clara_cached_section_visibility');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SECTION_VISIBILITY;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'services' | 'carousel' | 'blocks' | 'bookings' | 'estilos' | 'sections'>('services');

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

    const fetchEstilos = async () => {
      try {
        const resp = await fetch('/api/estilos', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.estilos) && data.estilos.length > 0) {
            setEstilos(data.estilos);
            try {
              localStorage.setItem('clara_cached_estilos', JSON.stringify(data.estilos));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching estilos from Firestore.', err);
      }

      const fsEstilos = await getEstilosFromFirestore();
      if (fsEstilos && fsEstilos.length > 0) {
        setEstilos(fsEstilos);
      }
    };

    const fetchSectionVisibility = async () => {
      try {
        const resp = await fetch('/api/section-visibility', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.sections) {
            setSectionVisibility(data.sections);
            try {
              localStorage.setItem('clara_cached_section_visibility', JSON.stringify(data.sections));
            } catch (e) { console.warn(e); }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable. Fetching section visibility from Firestore.', err);
      }

      const fsVisibility = await getSectionVisibilityFromFirestore();
      if (fsVisibility) {
        setSectionVisibility(fsVisibility);
      }
    };

    fetchServices();
    fetchCarousel();
    fetchEstilos();
    fetchSectionVisibility();
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
          'clases': 'horarios',
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
          initialTab={adminInitialTab}
          services={services}
          onServicesUpdated={(updated) => setServices(updated)}
          blockedSlots={blockedSlots}
          onBlockedSlotsUpdated={(updated) => setBlockedSlots(updated)}
          onClose={() => setIsAdminActive(false)}
          bookings={bookings}
          onBookingsUpdated={(updated) => setBookings(updated)}
          carouselSlides={yogaSlides}
          onCarouselUpdated={(updated) => setYogaSlides(updated)}
          estilos={estilos}
          onEstilosUpdated={(updated) => setEstilos(updated)}
          sectionVisibility={sectionVisibility}
          onSectionVisibilityUpdated={(updated) => setSectionVisibility(updated)}
        />
      ) : (
        <>
          {/* Desktop & Mobile Navigation (Desktop Header above Hero + Mobile Bar) */}
          <FloatingNav 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            sectionVisibility={sectionVisibility}
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
                  
                  {/* Cartel informativo de Pausa Temporal / Receso (Opcional) */}
                  {sectionVisibility.pauseNotice?.enabled && (
                    <section id="aviso-pausa" className="bg-[#FAF7F2] border-y border-[#E3DAC9] py-8 px-4 sm:px-6 md:px-8 text-stone-charcoal relative z-20">
                      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <span className="text-2xl sm:text-3xl p-2 bg-[#F3EDE2] rounded-full border border-[#D5C9B8] shrink-0">🌿</span>
                          <div>
                            <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-charcoal tracking-wide">
                              {sectionVisibility.pauseNotice.title || 'Pausa temporal en actividades'}
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 font-serif italic mt-1 leading-relaxed max-w-2xl">
                              {sectionVisibility.pauseNotice.message || 'En este momento estamos en una pausa. Para novedades o consultas directas, puedes escribirnos por WhatsApp.'}
                            </p>
                          </div>
                        </div>
                        <a
                          href="https://wa.me/34600000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] tracking-[0.18em] uppercase font-bold transition-all shadow-sm hover:shadow shrink-0"
                        >
                          <span>Escribir por WhatsApp</span>
                        </a>
                      </div>
                    </section>
                  )}

                  {/* Screen 2: Yoga */}
                  {sectionVisibility.yoga && (
                    <YogaExplainerSection slides={yogaSlides} />
                  )}

                  {/* Screen 3: Horarios & Abonos */}
                  {sectionVisibility.horarios && (
                    <HorariosSection services={services} />
                  )}

                  {/* Screen 5: Sesiones & Terapias */}
                  {sectionVisibility.terapias && (
                    <ServicesPanel services={services} onSelectService={handleSelectServiceDirectly} />
                  )}
                  
                  {/* Screen 6: Bío (Clara) */}
                  {sectionVisibility.bio && (
                    <TherapeuticTeam />
                  )}

                  {/* Screen 7: Contacto */}
                  {sectionVisibility.contacto ? (
                    <ContactSection onAdminClick={() => {
                      setAdminInitialTab('services');
                      setIsAdminActive(true);
                    }} />
                  ) : (
                    /* Si Clara decide ocultar Contacto, proveer acceso seguro para ingresar al panel de control */
                    <div className="py-6 text-center border-t border-stone-200/50 bg-stone-100/40">
                      <button
                        onClick={() => {
                          setAdminInitialTab('sections');
                          setIsAdminActive(true);
                        }}
                        className="text-[11px] uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      >
                        ⚙️ Panel de Gestión (Clara)
                      </button>
                    </div>
                  )}
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
