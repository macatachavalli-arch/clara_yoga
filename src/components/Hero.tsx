/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

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
    <section id="hero-section" className="w-full relative overflow-hidden min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex items-center justify-center">
      {/* Full-screen video banner */}
      <div className="w-full h-full min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] overflow-hidden relative bg-[#dcdcdc] flex items-center justify-center">
        <video
          ref={videoRef}
          src="/fondo_hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] object-cover object-center"
        />

        {/* Soft dark overlay for text/logo contrast */}
        <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[0.5px] pointer-events-none" />

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
            className="w-auto h-auto max-w-[75%] max-h-[60vh] sm:max-w-[55%] md:max-w-[440px] lg:max-w-[500px] object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}

