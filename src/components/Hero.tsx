/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface HeroProps {
  onStartBooking: () => void;
  onExploreServices: () => void;
  onMyBookings?: () => void;
}

export default function Hero({ onStartBooking, onExploreServices, onMyBookings }: HeroProps) {
  return (
    <section id="inicio" className="w-full relative overflow-hidden bg-[#867768] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex items-center justify-center scroll-mt-[48px] md:scroll-mt-[52px]">
      <div id="hero-section" className="sr-only" />
      {/* Full-screen banner with background image clarayoga_inicio.jpeg */}
      <div className="w-full h-full min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] overflow-hidden relative bg-[#867768] bg-[url('/clarayoga_inicio.jpeg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        {/* Subtle 20% dark brown tint over photo */}
        <div className="absolute inset-0 bg-[#3E2E22]/20 pointer-events-none" />
        {/* Centered Logo with slow soft fade-in (0 to 100) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3.0, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none z-10 -translate-y-[20%] md:-translate-y-[30%]"
        >
          <img
            src="/logo_clarayoga.svg"
            alt="Clara Yoga"
            className="w-auto h-auto max-w-[54%] max-h-[43vh] sm:max-w-[40%] md:max-w-[264px] md:max-h-[36vh] lg:max-w-[300px] object-contain drop-shadow-2xl -translate-y-[7%]"
          />
        </motion.div>
      </div>
    </section>
  );
}

