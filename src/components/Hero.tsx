/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, UserCheck } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
  onExploreServices: () => void;
  onMyBookings?: () => void;
}

export default function Hero({ onStartBooking, onExploreServices, onMyBookings }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      
      const playVideo = () => {
        if (video) {
          video.muted = true;
          video.play().catch(() => {});
        }
      };

      playVideo();

      const handleUserInteraction = () => {
        playVideo();
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      };

      window.addEventListener('click', handleUserInteraction, { once: true });
      window.addEventListener('touchstart', handleUserInteraction, { once: true });

      return () => {
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, []);

  return (
    <section id="hero-section" className="w-full">
      {/* Full-width video banner */}
      <div className="w-full h-[320px] sm:h-[400px] md:h-[470px] overflow-hidden relative bg-[#dcdcdc] flex items-center justify-center">
        <video
          ref={videoRef}
          src="/fondo_hero.mp4"
          autoPlay
          loop
          muted
          defaultMuted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        />

        {/* Soft dark overlay for text contrast */}
        <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px] pointer-events-none" />

        {/* Centered Logo over video with slow soft fade-in (0 to 100) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3.0, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none z-10"
        >
          <img
            src="/logo_clarayoga.svg"
            alt="Clara Yoga"
            className="w-auto h-auto max-w-[72%] max-h-[68%] sm:max-w-[54%] md:max-w-[405px] lg:max-w-[468px] object-contain drop-shadow-lg"
          />
        </motion.div>
      </div>

      {/* Text & Action section below the image */}
      <div className="bg-stone-sand py-12 md:py-16 px-6 sm:px-8 border-b border-stone-borders/40">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          
          {/* Zen label */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 border-b border-primary/40 pb-1.5 text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-5"
          >
            ✹ . mente cuerpo espíritu . ✹
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-charcoal leading-[1.05]"
          >
            Yoga . Arte . Movimiento . Meditación
          </motion.h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-[#3c3129] font-serif font-light leading-relaxed space-y-4 max-w-2xl"
          >
            <p className="italic">
              Yoga como medicina para la vida moderna.<br />
              El objetivo es que puedas integrar cuerpo y mente en una práctica consciente y equilibrada. Desarrollar de manera progresiva un cuerpo fuerte y móvil, una herramienta para que recuperes tu centro y mejores tu bienestar.
            </p>
          </motion.div>

          {/* Call to actions removed as requested */}

        </div>
      </div>
    </section>
  );
}

