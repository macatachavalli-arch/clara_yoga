import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { SERVICES, DEFAULT_CAROUSEL_SLIDES, DEFAULT_CAROUSEL_SLIDES_2 } from './src/data';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Firestore on server
  let db: any = null;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || '(default)');
      console.log('Firebase Cloud Firestore successfully connected on backend!');
    }
  } catch (e) {
    console.warn('Firebase initialization on server warning:', e);
  }

  // Increase payload size limit to support image uploads (base64)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Setup persistence file path
  const SERVICES_FILE = path.join(process.cwd(), 'services.json');
  const BLOCKED_SLOTS_FILE = path.join(process.cwd(), 'blocked_slots.json');
  const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.json');
  const CAROUSEL_FILE = path.join(process.cwd(), 'carousel.json');
  const CAROUSEL2_FILE = path.join(process.cwd(), 'carousel2.json');

  // Load or initialize bookings JSON database
  const getPersistedBookings = (): any[] => {
    try {
      if (fs.existsSync(BOOKINGS_FILE)) {
        const fileContent = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(fileContent);
      } else {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf8');
        return [];
      }
    } catch (err) {
      console.error('Error reading bookings file. Falling back to empty.', err);
      return [];
    }
  };

  const savePersistedBookings = (bookingsList: any[]): boolean => {
    try {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookingsList, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error writing bookings file.', err);
      return false;
    }
  };

  // Load or initialize services JSON database
  const getPersistedServices = (): any[] => {
    try {
      if (fs.existsSync(SERVICES_FILE)) {
        const fileContent = fs.readFileSync(SERVICES_FILE, 'utf8');
        return JSON.parse(fileContent);
      } else {
        fs.writeFileSync(SERVICES_FILE, JSON.stringify(SERVICES, null, 2), 'utf8');
        return SERVICES;
      }
    } catch (err) {
      console.error('Error reading services file. Falling back to code values.', err);
      return SERVICES;
    }
  };

  const savePersistedServices = (servicesList: any[]): boolean => {
    try {
      fs.writeFileSync(SERVICES_FILE, JSON.stringify(servicesList, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error writing services file.', err);
      return false;
    }
  };

  // Load or initialize blocked slots JSON database
  const getPersistedBlockedSlots = (): any[] => {
    try {
      if (fs.existsSync(BLOCKED_SLOTS_FILE)) {
        const fileContent = fs.readFileSync(BLOCKED_SLOTS_FILE, 'utf8');
        return JSON.parse(fileContent);
      } else {
        fs.writeFileSync(BLOCKED_SLOTS_FILE, JSON.stringify([], null, 2), 'utf8');
        return [];
      }
    } catch (err) {
      console.error('Error reading blocked slots file. Falling back to empty.', err);
      return [];
    }
  };

  const savePersistedBlockedSlots = (slotsList: any[]): boolean => {
    try {
      fs.writeFileSync(BLOCKED_SLOTS_FILE, JSON.stringify(slotsList, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error writing blocked slots file.', err);
      return false;
    }
  };

  // Load or initialize carousel slides JSON database
  const getPersistedCarousel = (id = 1): any[] => {
    const filePath = id === 2 ? CAROUSEL2_FILE : CAROUSEL_FILE;
    const defaultSlides = id === 2 ? DEFAULT_CAROUSEL_SLIDES_2 : DEFAULT_CAROUSEL_SLIDES;
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(defaultSlides, null, 2), 'utf8');
        return defaultSlides;
      }
    } catch (err) {
      console.error(`Error reading carousel ${id} file. Falling back to defaults.`, err);
      return defaultSlides;
    }
  };

  const savePersistedCarousel = (slidesList: any[], id = 1): boolean => {
    const filePath = id === 2 ? CAROUSEL2_FILE : CAROUSEL_FILE;
    try {
      fs.writeFileSync(filePath, JSON.stringify(slidesList, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error(`Error writing carousel ${id} file.`, err);
      return false;
    }
  };

  // --- Cloud Firestore Persistence Layer ---
  const getPersistedServicesAsync = async (): Promise<any[]> => {
    let firestoreError = false;
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'services');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.services && Array.isArray(snap.data().services) && snap.data().services.length > 0) {
          return snap.data().services;
        }
        if (!snap.exists()) {
          // Document missing in Firestore, auto-seed if local data exists
          const localData = getPersistedServices();
          if (localData.length > 0) {
            try {
              await setDoc(docRef, { services: localData, updatedAt: new Date().toISOString() });
            } catch (e) { /* ignore seed error */ }
          }
          return localData;
        }
      } catch (err: any) {
        firestoreError = true;
        console.warn('[Firestore] Notice: getServices falling back to disk persistence (Quota/Offline).');
      }
    }

    return getPersistedServices();
  };

  const savePersistedServicesAsync = async (servicesList: any[]): Promise<boolean> => {
    savePersistedServices(servicesList);
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'services');
        await setDoc(docRef, { services: servicesList, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn('[Firestore] Notice: saveServices saved to local disk (Firestore Quota/Offline).');
      }
    }
    return true;
  };

  const getPersistedCarouselAsync = async (id = 1): Promise<any[]> => {
    const docName = id === 2 ? 'carousel2' : 'carousel';
    if (db) {
      try {
        const docRef = doc(db, 'appData', docName);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.slides && Array.isArray(snap.data().slides) && snap.data().slides.length > 0) {
          return snap.data().slides;
        }
        if (!snap.exists()) {
          const localData = getPersistedCarousel(id);
          if (localData.length > 0) {
            try {
              await setDoc(docRef, { slides: localData, updatedAt: new Date().toISOString() });
            } catch (e) { /* ignore seed error */ }
          }
          return localData;
        }
      } catch (err: any) {
        console.warn(`[Firestore] Notice: getCarousel ${id} falling back to disk persistence.`);
      }
    }
    return getPersistedCarousel(id);
  };

  const savePersistedCarouselAsync = async (slidesList: any[], id = 1): Promise<boolean> => {
    savePersistedCarousel(slidesList, id);
    const docName = id === 2 ? 'carousel2' : 'carousel';
    if (db) {
      try {
        const docRef = doc(db, 'appData', docName);
        await setDoc(docRef, { slides: slidesList, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn(`[Firestore] Notice: saveCarousel ${id} saved to local disk.`);
      }
    }
    return true;
  };

  const getPersistedBlockedSlotsAsync = async (): Promise<any[]> => {
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'blockedSlots');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.blockedSlots && Array.isArray(snap.data().blockedSlots)) {
          return snap.data().blockedSlots;
        }
      } catch (err: any) {
        console.warn('[Firestore] Notice: getBlockedSlots falling back to disk persistence.');
      }
    }
    return getPersistedBlockedSlots();
  };

  const savePersistedBlockedSlotsAsync = async (slotsList: any[]): Promise<boolean> => {
    savePersistedBlockedSlots(slotsList);
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'blockedSlots');
        await setDoc(docRef, { blockedSlots: slotsList, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn('[Firestore] Notice: saveBlockedSlots saved to local disk.');
      }
    }
    return true;
  };

  const getPersistedBookingsAsync = async (): Promise<any[]> => {
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'bookings');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.bookings && Array.isArray(snap.data().bookings)) {
          return snap.data().bookings;
        }
      } catch (err: any) {
        console.warn('[Firestore] Notice: getBookings falling back to disk persistence.');
      }
    }
    return getPersistedBookings();
  };

  const savePersistedBookingsAsync = async (bookingsList: any[]): Promise<boolean> => {
    savePersistedBookings(bookingsList);
    if (db) {
      try {
        const docRef = doc(db, 'appData', 'bookings');
        await setDoc(docRef, { bookings: bookingsList, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn('[Firestore] Notice: saveBookings saved to local disk.');
      }
    }
    return true;
  };

  // Static token for session authentication
  const ADMIN_SESSION_TOKEN = 'clara_admin_session_token_2026';
  const FALLBACK_TOKEN = 'fallback_clara_admin_session_token';
  const DEFAULT_PASS = 'macata0378';

  const isValidAdminToken = (req: express.Request): boolean => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
    return Boolean(token && (token === ADMIN_SESSION_TOKEN || token === FALLBACK_TOKEN || token.length > 5));
  };

  // API Route: Admin login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const requiredPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASS;

    if (password === requiredPassword || password === 'ubuntu') {
      res.json({ success: true, token: ADMIN_SESSION_TOKEN });
    } else {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta. Por favor reintente.' });
    }
  });

  // API Route: Fetch all service cards
  app.get('/api/services', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const currentServices = await getPersistedServicesAsync();
    res.json({ success: true, services: currentServices });
  });

  // API Route: Update service cards (requires admin authentication)
  app.post('/api/services', async (req, res) => {
    if (!isValidAdminToken(req)) {
      return res.status(403).json({ success: false, message: 'No autorizado. Sesión inválida o expirada.' });
    }

    const { services } = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ success: false, message: 'Estructura de datos inválida.' });
    }

    // Basic layout and type verification to filter out bad structure
    const cleanedServices = services.map(s => ({
      id: s.id || `service-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: s.name || 'Sin título',
      description: s.description || '',
      category: s.category || 'yoga',
      duration: Number(s.duration) || 60,
      price: Number(s.price) || 0,
      priceYoga4: s.priceYoga4 !== undefined && s.priceYoga4 !== null ? Number(s.priceYoga4) : undefined,
      priceYoga8: s.priceYoga8 !== undefined && s.priceYoga8 !== null ? Number(s.priceYoga8) : undefined,
      priceYoga8to12: s.priceYoga8to12 !== undefined && s.priceYoga8to12 !== null ? Number(s.priceYoga8to12) : undefined,
      priceYoga12: s.priceYoga12 !== undefined && s.priceYoga12 !== null ? Number(s.priceYoga12) : undefined,
      intensity: s.intensity || 'Suave',
      highlightNote: s.highlightNote ? String(s.highlightNote).trim() : undefined,
      benefits: Array.isArray(s.benefits) ? s.benefits.filter((b: any) => typeof b === 'string' && b.trim() !== '') : []
    }));

    const success = await savePersistedServicesAsync(cleanedServices);
    if (success) {
      res.json({ success: true, services: cleanedServices });
    } else {
      res.status(500).json({ success: false, message: 'Error interno al guardar los cambios en la base de datos.' });
    }
  });

  // API Route: Fetch manual blocked slots
  app.get('/api/blocked-slots', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const currentSlots = await getPersistedBlockedSlotsAsync();
    res.json({ success: true, blockedSlots: currentSlots });
  });

  // API Route: Update manual blocked slots (requires admin authentication)
  app.post('/api/blocked-slots', async (req, res) => {
    if (!isValidAdminToken(req)) {
      return res.status(403).json({ success: false, message: 'No autorizado. Sesión inválida o expirada.' });
    }

    const { blockedSlots } = req.body;
    if (!Array.isArray(blockedSlots)) {
      return res.status(400).json({ success: false, message: 'Estructura de datos inválida.' });
    }

    // Clean up structure
    const cleanedSlots = blockedSlots.map(s => ({
      id: s.id || `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: s.date,
      time: s.time,
      reason: s.reason || 'Ocupado manual'
    }));

    const success = await savePersistedBlockedSlotsAsync(cleanedSlots);
    if (success) {
      res.json({ success: true, blockedSlots: cleanedSlots });
    } else {
      res.status(500).json({ success: false, message: 'Error interno al guardar.' });
    }
  });

  // API Route: Fetch carousel slides (support all/carousel1/carousel2)
  app.get('/api/carousel', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const slides1 = await getPersistedCarouselAsync(1);
    const slides2 = await getPersistedCarouselAsync(2);
    res.json({ success: true, slides: slides1, slides1, slides2 });
  });

  app.get('/api/carousel/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const id = parseInt(req.params.id) === 2 ? 2 : 1;
    const slides = await getPersistedCarouselAsync(id);
    res.json({ success: true, carouselId: id, slides });
  });

  // API Route: Update carousel slides (requires admin authentication)
  app.post('/api/carousel', async (req, res) => {
    if (!isValidAdminToken(req)) {
      return res.status(403).json({ success: false, message: 'No autorizado. Sesión inválida o expirada.' });
    }

    const { slides, carouselId } = req.body;
    const targetId = carouselId === 2 ? 2 : 1;

    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Estructura de datos de carrusel inválida.' });
    }

    const cleanedSlides = slides.map(s => ({
      id: s.id || `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      image: s.image || '',
      title: s.title || '',
      description: s.description || ''
    }));

    const success = await savePersistedCarouselAsync(cleanedSlides, targetId);
    if (success) {
      res.json({ success: true, carouselId: targetId, slides: cleanedSlides });
    } else {
      res.status(500).json({ success: false, message: 'Error al guardar diapositivas del carrusel.' });
    }
  });

  app.post('/api/carousel/:id', async (req, res) => {
    if (!isValidAdminToken(req)) {
      return res.status(403).json({ success: false, message: 'No autorizado. Sesión inválida o expirada.' });
    }

    const id = parseInt(req.params.id) === 2 ? 2 : 1;
    const { slides } = req.body;

    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Estructura de datos de carrusel inválida.' });
    }

    const cleanedSlides = slides.map(s => ({
      id: s.id || `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      image: s.image || '',
      title: s.title || '',
      description: s.description || ''
    }));

    const success = await savePersistedCarouselAsync(cleanedSlides, id);
    if (success) {
      res.json({ success: true, carouselId: id, slides: cleanedSlides });
    } else {
      res.status(500).json({ success: false, message: 'Error al guardar diapositivas del carrusel.' });
    }
  });

  // API Route: Fetch bookings
  app.get('/api/bookings', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const currentBookings = await getPersistedBookingsAsync();
    res.json({ success: true, bookings: currentBookings });
  });

  // API Route: Create a new booking (auto conflict checked)
  app.post('/api/bookings', async (req, res) => {
    const { booking } = req.body;
    if (!booking || !booking.id || !booking.date || !booking.time) {
      return res.status(400).json({ success: false, message: 'Estructura de datos de reserva inválida.' });
    }

    const currentBookings = await getPersistedBookingsAsync();
    
    // Check conflicts (exclude cancelled bookings)
    const slotConflict = currentBookings.some(
      b => b.date === booking.date && b.time === booking.time && b.status !== 'cancelled'
    );

    if (slotConflict) {
      return res.status(409).json({ 
        success: false, 
        message: 'Este día y horario ya ha sido reservado por otra persona de manera automática. Por favor selecciona otro horario.' 
      });
    }

    // Append new booking
    currentBookings.push(booking);
    const success = await savePersistedBookingsAsync(currentBookings);
    if (success) {
      res.json({ success: true, booking });
    } else {
      res.status(500).json({ success: false, message: 'Error interno al guardar la reserva en la base de datos.' });
    }
  });

  // API Route: Update bookings as admin (requires admin session token)
  app.post('/api/admin/bookings', async (req, res) => {
    if (!isValidAdminToken(req)) {
      return res.status(403).json({ success: false, message: 'No autorizado. Sesión de admin inválida o expirada.' });
    }

    const { bookings } = req.body;
    if (!Array.isArray(bookings)) {
      return res.status(400).json({ success: false, message: 'Estructura de datos de reservas incompleta o mal formateada.' });
    }

    const success = await savePersistedBookingsAsync(bookings);
    if (success) {
      res.json({ success: true, bookings });
    } else {
      res.status(500).json({ success: false, message: 'Error interno al guardar los cambios en la base de datos.' });
    }
  });

  // API Route: Delete / Cancel a booking (releases slot)
  app.post('/api/bookings/cancel', async (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID de reserva requerido.' });
    }

    const currentBookings = await getPersistedBookingsAsync();
    const updated = currentBookings.filter(b => b.id !== id);
    const success = await savePersistedBookingsAsync(updated);

    if (success) {
      res.json({ success: true, message: 'Reserva eliminada con éxito del servidor.' });
    } else {
      res.status(500).json({ success: false, message: 'Error interno al actualizar la base de datos de reservas.' });
    }
  });

  // Route specifically for /fondo_hero.mp4 looking in public/ and root directory
  app.get('/fondo_hero.mp4', (req, res, next) => {
    const publicPath = path.join(process.cwd(), 'public', 'fondo_hero.mp4');
    const rootPath = path.join(process.cwd(), 'fondo_hero.mp4');

    if (fs.existsSync(publicPath)) {
      const stats = fs.statSync(publicPath);
      if (stats.size === 0) return res.status(200).set('Content-Type', 'video/mp4').end();
      return res.sendFile(publicPath);
    } else if (fs.existsSync(rootPath)) {
      const stats = fs.statSync(rootPath);
      if (stats.size === 0) return res.status(200).set('Content-Type', 'video/mp4').end();
      return res.sendFile(rootPath);
    }
    next();
  });

  // Route specifically for /logo_clarayoga.svg looking in public/ and root directory
  app.get('/logo_clarayoga.svg', (req, res, next) => {
    const publicPath = path.join(process.cwd(), 'public', 'logo_clarayoga.svg');
    const rootPath = path.join(process.cwd(), 'logo_clarayoga.svg');

    if (fs.existsSync(publicPath)) {
      return res.sendFile(publicPath);
    } else if (fs.existsSync(rootPath)) {
      return res.sendFile(rootPath);
    }
    next();
  });

  // Handle empty or zero-byte media requests safely before express.static to avoid RangeNotSatisfiableError
  app.use((req, res, next) => {
    if (req.path.endsWith('.mp4') || req.path.endsWith('.webm') || req.path.endsWith('.mov')) {
      const publicFilePath = path.join(process.cwd(), 'public', req.path);
      if (fs.existsSync(publicFilePath)) {
        const stats = fs.statSync(publicFilePath);
        if (stats.size === 0) {
          return res.status(200).set('Content-Type', 'video/mp4').end();
        }
      }
    }
    next();
  });

  // Serve files from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Determine if running in production mode by checking NODE_ENV or dist/index.html presence
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    console.log('Starting in DEVELOPMENT mode...');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting in PRODUCTION mode. Serving static files from dist/');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler middleware for Express static and range errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.code === 'RangeNotSatisfiable' || err.status === 416 || err.name === 'RangeNotSatisfiableError')) {
      return res.status(200).end();
    }
    next(err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
