import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CarouselSlide, Service, BlockedSlot, Booking } from '../types';
import { SERVICES, DEFAULT_CAROUSEL_SLIDES, DEFAULT_CAROUSEL_SLIDES_2 } from '../data';

// Helper to strip undefined values for Firestore setDoc compatibility
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Fetch carousel slides from Firestore with local cache & fallback
export async function getCarouselFromFirestore(carouselId: 1 | 2 = 1): Promise<CarouselSlide[]> {
  const docName = carouselId === 2 ? 'carousel2' : 'carousel';
  const defaultSlides = carouselId === 2 ? DEFAULT_CAROUSEL_SLIDES_2 : DEFAULT_CAROUSEL_SLIDES;

  try {
    const docRef = doc(db, 'appData', docName);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.slides) && data.slides.length > 0) {
        return data.slides;
      }
    }
  } catch (err) {
    console.warn(`Error fetching ${docName} from Firestore directly:`, err);
  }

  // Check localStorage cache
  const cached = localStorage.getItem(`clara_cached_carousel${carouselId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(`Error parsing cached carousel ${carouselId}:`, e);
    }
  }

  return defaultSlides;
}

// Save carousel slides to Firestore & localStorage
export async function saveCarouselToFirestore(slides: CarouselSlide[], carouselId: 1 | 2 = 1): Promise<boolean> {
  const docName = carouselId === 2 ? 'carousel2' : 'carousel';
  try {
    localStorage.setItem(`clara_cached_carousel${carouselId}`, JSON.stringify(slides));
  } catch (e) {
    console.warn('LocalStorage quota warning', e);
  }

  try {
    const docRef = doc(db, 'appData', docName);
    const payload = cleanForFirestore({ slides, updatedAt: new Date().toISOString() });
    await setDoc(docRef, payload);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Notice: ${docName} saved locally (Quota/Offline).`);
    return true;
  }
}

// Services
export async function getServicesFromFirestore(): Promise<Service[]> {
  let loaded: Service[] = [];
  try {
    const docRef = doc(db, 'appData', 'services');
    const snap = await getDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.services) && snap.data().services.length > 0) {
      loaded = snap.data().services;
      try {
        localStorage.setItem('clara_cached_services', JSON.stringify(loaded));
      } catch (e) {}
      return loaded;
    }
  } catch (err) {
    // Quota or offline fallback
  }

  if (!loaded || loaded.length === 0) {
    const cached = localStorage.getItem('clara_cached_services');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  return SERVICES;
}

export async function saveServicesToFirestore(services: Service[]): Promise<boolean> {
  try {
    localStorage.setItem('clara_cached_services', JSON.stringify(services));
  } catch (e) { console.warn(e); }

  try {
    const docRef = doc(db, 'appData', 'services');
    const payload = cleanForFirestore({ services, updatedAt: new Date().toISOString() });
    await setDoc(docRef, payload);
    return true;
  } catch (err) {
    console.warn('[Firestore] Notice: services saved locally (Quota/Offline).');
    return true;
  }
}

// Blocked Slots
export async function getBlockedSlotsFromFirestore(): Promise<BlockedSlot[]> {
  try {
    const docRef = doc(db, 'appData', 'blockedSlots');
    const snap = await getDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.blockedSlots)) {
      return snap.data().blockedSlots;
    }
  } catch (err) {
    // Quota or offline fallback
  }

  const cached = localStorage.getItem('clara_cached_blocked_slots');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  return [];
}

export async function saveBlockedSlotsToFirestore(slots: BlockedSlot[]): Promise<boolean> {
  try {
    localStorage.setItem('clara_cached_blocked_slots', JSON.stringify(slots));
  } catch (e) { console.warn(e); }

  try {
    const docRef = doc(db, 'appData', 'blockedSlots');
    const payload = cleanForFirestore({ blockedSlots: slots, updatedAt: new Date().toISOString() });
    await setDoc(docRef, payload);
    return true;
  } catch (err) {
    console.warn('[Firestore] Notice: blockedSlots saved locally (Quota/Offline).');
    return true;
  }
}

// Bookings
export async function getBookingsFromFirestore(): Promise<Booking[]> {
  try {
    const docRef = doc(db, 'appData', 'bookings');
    const snap = await getDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.bookings)) {
      return snap.data().bookings;
    }
  } catch (err) {
    // Quota or offline fallback
  }

  const cached = localStorage.getItem('clara_cached_bookings');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  return [];
}

export async function saveBookingsToFirestore(bookings: Booking[]): Promise<boolean> {
  try {
    localStorage.setItem('clara_cached_bookings', JSON.stringify(bookings));
  } catch (e) { console.warn(e); }

  try {
    const docRef = doc(db, 'appData', 'bookings');
    const payload = cleanForFirestore({ bookings, updatedAt: new Date().toISOString() });
    await setDoc(docRef, payload);
    return true;
  } catch (err) {
    console.warn('[Firestore] Notice: bookings saved locally (Quota/Offline).');
    return true;
  }
}
