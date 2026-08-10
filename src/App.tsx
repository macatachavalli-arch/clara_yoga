/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import ServicesPanel from './components/ServicesPanel';
import BookingForm from './components/BookingForm';
import MyReservations from './components/MyReservations';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import TherapeuticTeam from './components/TherapeuticTeam';
import ContactSection from './components/ContactSection';
import ZenBackgroundAudio from './components/ZenBackgroundAudio';
import { SERVICES } from './data';
import { Booking, Service, BlockedSlot } from './types';
import { 
  getServicesFromFirestore, 
  getBlockedSlotsFromFirestore, 
  getBookingsFromFirestore 
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
    if (activeTab !== 'home') {
      setActiveTab('home');
      // Wait for tab switch rendering before scrolling
      setTimeout(() => {
        document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
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
        />
      ) : (
        <>
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
                    onMyBookings={() => setActiveTab('my-bookings')}
                  />
                  
                  {/* Full-width banner image before InfoSection */}
                  <div className="w-full h-[250px] sm:h-[350px] md:h-[470px] overflow-hidden bg-stone-900 relative">
                    <img 
                      src="https://i.imgur.com/NAsTvBt.jpeg" 
                      alt="Yoga y Shiatsu Zen" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <InfoSection services={services} />

                  {/* Full-width banner image between Yoga and Reservas */}
                  <div className="w-full h-[250px] sm:h-[350px] md:h-[470px] overflow-hidden bg-stone-900 relative">
                    <img 
                      src="https://i.imgur.com/EOITdTC.jpeg" 
                      alt="Yoga y Shiatsu Zen" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <ServicesPanel services={services} onSelectService={handleSelectServiceDirectly} />
                  
                  {/* Full-width image banner between Yoga & Sesiones and Sobre mí */}
                  <div className="w-full h-[250px] sm:h-[350px] md:h-[470px] overflow-hidden bg-stone-900 relative">
                    <img 
                      src="https://i.imgur.com/ZhcTfPP.jpeg" 
                      alt="Yoga y Shiatsu Zen" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <TherapeuticTeam />
                  <ContactSection />
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
                    onViewReservations={() => setActiveTab('my-bookings')}
                    onGoHome={() => setActiveTab('home')}
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
                    onGoHome={() => setActiveTab('home')}
                    refreshFlag={refreshFlag}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Structured Footer / FAQ Panel */}
          <Footer onAdminClick={() => setIsAdminActive(true)} />
        </>
      )}

      {/* Zen Ambient Background Audio */}
      <ZenBackgroundAudio />

    </div>
  );
}
