import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CarouselSlide } from '../types';
import { DEFAULT_CAROUSEL_SLIDES } from '../data';
import { getCarouselFromFirestore } from '../lib/firestoreStorage';

interface YogaExplainerSectionProps {
  slides?: CarouselSlide[];
}

export default function YogaExplainerSection({ slides: propSlides }: YogaExplainerSectionProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(() => {
    if (propSlides && propSlides.length > 0) return propSlides;
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

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedImageModal, setSelectedImageModal] = useState<CarouselSlide | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propSlides && propSlides.length > 0) {
      setSlides(propSlides);
    }
  }, [propSlides]);

  // Initial fetch fallback if not provided
  useEffect(() => {
    if (!propSlides || propSlides.length === 0) {
      const loadSlides = async () => {
        try {
          const resp = await fetch('/api/carousel/1', { cache: 'no-store' });
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
              setSlides(data.slides);
              return;
            }
          }
        } catch (e) {}

        const fsSlides = await getCarouselFromFirestore(1);
        if (fsSlides && fsSlides.length > 0) {
          setSlides(fsSlides);
        }
      };
      loadSlides();
    }
  }, [propSlides]);

  const totalSlides = slides.length;

  // Auto-rotation when not hovered
  useEffect(() => {
    if (totalSlides <= 3 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(interval);
  }, [totalSlides, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Compute 3 visible slides in a wrap-around window
  const getVisibleSlides = () => {
    if (totalSlides === 0) return [];
    if (totalSlides <= 3) return slides;
    const visible: { slide: CarouselSlide; originalIndex: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = (currentIndex + i) % totalSlides;
      visible.push({ slide: slides[idx], originalIndex: idx });
    }
    return visible;
  };

  const visibleSlides = getVisibleSlides();

  return (
    <section 
      id="yoga-explainer" 
      className="w-full bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] py-6 sm:py-8 md:py-10 flex flex-col justify-between overflow-hidden"
    >
      {/* Upper Text Block - Raised and optimized for seamless screen fit */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 w-full my-auto">
        <div className="text-center flex flex-col items-center gap-1 sm:gap-2 max-w-4xl mx-auto">
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-light tracking-tight text-stone-charcoal leading-[1.08]">
            Yoga
          </h3>
          <p className="font-serif text-[19px] sm:text-[22px] md:text-[24px] font-light tracking-wide text-stone-charcoal/90 mb-1">
            Medicina para la vida moderna.
          </p>
          <div className="font-serif italic text-stone-700 font-light text-[18px] leading-relaxed max-w-3xl text-center">
            <p>
              Propongo un trabajo progresivo y cuidado, donde cada practicante puede explorar y avanzar a su propio ritmo. El objetivo es que puedas integrar cuerpo y mente en una práctica consciente y equilibrada. Desarrollar de manera progresiva un cuerpo fuerte y móvil, una herramienta para que recuperes tu centro y mejores tu bienestar. Con una mirada integral, se ajusta cada herramienta del yoga a las posibilidades reales de quien practica, priorizando la salud y la conexión personal.
            </p>
          </div>
        </div>
      </div>

      {/* Full-width 3-Images Horizontal Carousel Container */}
      <div 
        className="w-full mt-4 sm:mt-6 relative px-3 sm:px-6 lg:px-10 pb-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full max-w-[1920px] mx-auto relative">
          
          {/* Navigation Controls (Arrows) */}
          {totalSlides > 3 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Imagen anterior"
                className="absolute -left-2 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 bg-white/90 hover:bg-white text-stone-charcoal border border-stone-borders shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5 text-stone-charcoal group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente imagen"
                className="absolute -right-2 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 bg-white/90 hover:bg-white text-stone-charcoal border border-stone-borders shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105"
              >
                <ChevronRight className="h-5 w-5 text-stone-charcoal group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* 3 Horizontal Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 w-full">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleSlides.map((item, idx) => {
                const slide = 'slide' in item ? item.slide : item;
                const keyId = slide.id || `slide-${idx}-${currentIndex}`;
                return (
                  <motion.div
                    key={keyId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="relative w-full aspect-[16/10] sm:aspect-[16/10] md:aspect-[16/10] overflow-hidden bg-stone-200 border border-stone-borders/80 group shadow-xs cursor-pointer"
                    onClick={() => setSelectedImageModal(slide)}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title || 'Foto de Yoga'}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* Subtle bottom gradient & overlay caption if available */}
                    {slide.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <p className="font-serif text-white text-sm sm:text-base font-light tracking-wide drop-shadow-xs">
                          {slide.title}
                        </p>
                        {slide.description && (
                          <p className="font-sans text-[11px] sm:text-xs text-white/80 line-clamp-1 mt-0.5 drop-shadow-xs">
                            {slide.description}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Indicators / Dots if multiple slides */}
          {totalSlides > 3 && (
            <div className="flex justify-center items-center gap-1.5 mt-4 sm:mt-5">
              {slides.map((_, dotIdx) => (
                <button
                  key={`dot-${dotIdx}`}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Ir a diapositiva ${dotIdx + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    dotIdx === currentIndex
                      ? 'w-6 bg-stone-charcoal'
                      : 'w-1.5 bg-stone-charcoal/25 hover:bg-stone-charcoal/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Full view modal when clicked */}
      <AnimatePresence>
        {selectedImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-10"
            onClick={() => setSelectedImageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImageModal.image}
                alt={selectedImageModal.title || 'Foto de Yoga'}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-none border border-white/10 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              {selectedImageModal.title && (
                <div className="mt-4 text-center text-white">
                  <h4 className="font-serif text-lg sm:text-xl font-light">{selectedImageModal.title}</h4>
                  {selectedImageModal.description && (
                    <p className="font-sans text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">{selectedImageModal.description}</p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full cursor-pointer transition-colors"
                aria-label="Cerrar vista previa"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

