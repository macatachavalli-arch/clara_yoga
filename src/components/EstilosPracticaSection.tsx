import { useState, useEffect, useCallback, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PracticeStyle } from '../types';
import { DEFAULT_PRACTICE_STYLES } from '../data';

interface EstilosPracticaSectionProps {
  estilos?: PracticeStyle[];
  onAdminClick?: () => void;
}

export default function EstilosPracticaSection({ estilos, onAdminClick }: EstilosPracticaSectionProps) {
  const allItems = estilos && estilos.length > 0 ? estilos : DEFAULT_PRACTICE_STYLES;
  const items = allItems.filter((item) => item.visible !== false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Safe index bounds if items change
  const activeIndex = items.length > 0 && currentIndex < items.length ? currentIndex : 0;
  const currentItem = items.length > 0 ? (items[activeIndex] || items[0]) : null;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  return (
    <section 
      id="estilos" 
      className="w-full bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-center py-8 sm:py-12 md:py-16 relative"
    >
      <div id="estilos-practica" className="sr-only" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 w-full my-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto">
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-charcoal tracking-tight">
            Estilos de práctica
          </h3>
        </div>

        {/* Big Dynamic Card Slider (Tarjetón Dinámico) */}
        {!currentItem ? (
          <div className="max-w-md mx-auto text-center p-8 bg-white/90 backdrop-blur-xs rounded-xl border border-stone-200 shadow-xs">
            <p className="font-serif italic text-stone-600 text-sm">
              Esta sección está en actualización. Vuelve a visitarnos pronto para conocer nuestros estilos de práctica.
            </p>
          </div>
        ) : (
          <div 
            id="estilos-slider-card"
            className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-stone-300 overflow-hidden flex flex-col md:flex-row min-h-[460px] md:min-h-[500px] relative w-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* LEFT SIDE: Image extending to the outer edges */}
            <div className="w-full md:w-1/2 relative min-h-[260px] sm:min-h-[320px] md:min-h-full overflow-hidden shrink-0 bg-stone-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id || activeIndex}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = DEFAULT_PRACTICE_STYLES[activeIndex % DEFAULT_PRACTICE_STYLES.length]?.image || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200';
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Subtle aesthetic gradient overlay at edge on desktop */}
            <div className="hidden md:block absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
          </div>

          {/* RIGHT SIDE: Text and Title */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-between bg-white relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id || activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Title */}
                <h4 className="font-serif text-2xl font-light text-stone-charcoal tracking-tight leading-snug">
                  {currentItem.title}
                </h4>

                {/* Description */}
                <p className="text-stone-600 text-[13px] leading-relaxed font-normal pt-1">
                  {currentItem.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Slider Navigation Controls */}
            <div className="pt-6 sm:pt-8 mt-6 border-t border-stone-100 flex items-center justify-between gap-4">
              {/* Dots indicator */}
              <div className="flex items-center gap-2">
                {items.map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ver estilo ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === activeIndex
                        ? 'w-7 h-2 bg-stone-charcoal'
                        : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-prev-estilo"
                  onClick={handlePrev}
                  aria-label="Estilo anterior"
                  className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-charcoal hover:text-white hover:border-stone-charcoal transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  id="btn-next-estilo"
                  onClick={handleNext}
                  aria-label="Siguiente estilo"
                  className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-charcoal hover:text-white hover:border-stone-charcoal transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
