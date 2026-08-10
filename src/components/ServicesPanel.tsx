/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Clock, Tag, Flame, Waves } from 'lucide-react';
import { Service } from '../types';

interface ServicesPanelProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

export default function ServicesPanel({ services, onSelectService }: ServicesPanelProps) {
  // Filter out yoga cards so only non-yoga session cards appear in Sesiones
  const displayServices = services.filter(
    (s) => s.category !== 'yoga' && !s.name.toLowerCase().includes('yoga')
  );

  return (
    <section id="services-section" className="py-20 bg-stone-sand border-b border-stone-borders scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div className="w-full">
            <h2 className="font-serif text-[36px] italic font-light text-stone-charcoal mt-2 md:text-[36px] leading-tight">
              Sesiones
            </h2>
          </div>
        </div>

        {/* Services Grid Display */}
        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {displayServices.map((service, index) => {
            const isYoga = service.category === 'yoga' || service.name.toLowerCase().includes('yoga');
            const isCombo = service.category === 'combo';

            const hasP4 = Boolean(service.priceYoga4 && service.priceYoga4 > 0);
            const hasP8 = Boolean((service.priceYoga8 && service.priceYoga8 > 0) || (service.priceYoga8to12 && service.priceYoga8to12 > 0));
            const hasPLibre = Boolean((service.priceYogaPaseLibre && service.priceYogaPaseLibre > 0) || (service.priceYoga12 && service.priceYoga12 > 0));

            const p4Val = service.priceYoga4;
            const p8Val = service.priceYoga8 || service.priceYoga8to12;
            const pLibreVal = service.priceYogaPaseLibre || service.priceYoga12;

            return (
              <motion.div
                key={service.id}
                id={`service-card-${service.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`relative flex flex-col justify-between bg-white p-6 shadow-none transition-all hover:border-stone-charcoal duration-300 rounded-[12px] border border-[#e5e1d8] ${
                  isCombo 
                    ? 'border-[#e5e1d8] bg-stone-sand/40' 
                    : 'border-[#e5e1d8]'
                }`}
              >
                {/* Card Top Section info */}
                <div>
                  {/* 1. Title */}
                  <h3 className="font-serif text-xl font-light text-stone-charcoal leading-snug">
                    {service.name}
                  </h3>

                  {/* 2. Duration */}
                  {isYoga ? (
                    Number(service.duration) > 0 && (
                      <div className="mt-2.5 mb-3.5 flex items-center gap-1.5 text-xs font-mono text-stone-500 border-b border-stone-sand pb-2.5">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        <span className="font-sans text-stone-500">{service.duration} minutos por clase</span>
                      </div>
                    )
                  ) : (
                    (Number(service.duration) > 0 || (service.price && service.price > 0)) && (
                      <div className="mt-2.5 mb-3.5 flex items-center gap-4 text-xs font-mono text-stone-500 border-b border-stone-sand pb-2.5">
                        {Number(service.duration) > 0 && (
                          <span className="flex items-center gap-1 font-sans text-stone-500">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            {service.duration} minutos
                          </span>
                        )}
                        {Number(service.duration) > 0 && service.price && service.price > 0 && (
                          <span className="h-1.5 w-1.5 bg-stone-borders rounded-none" />
                        )}
                        {service.price && service.price > 0 && (
                          <span className="font-semibold text-primary">
                            ${service.price.toLocaleString('es-AR')} ARS
                          </span>
                        )}
                      </div>
                    )
                  )}

                  {/* 3. Días y horarios en negrita (Yoga) */}
                  {isYoga && service.highlightNote && (
                    <div className="mb-3.5 text-xs font-bold text-stone-charcoal leading-relaxed whitespace-pre-line">
                      {service.highlightNote}
                    </div>
                  )}

                  {/* 4. Description */}
                  <p className="text-xs text-[#867768] leading-relaxed font-normal mb-4 whitespace-pre-line">
                    {service.description}
                  </p>

                  {/* 5. Values for Yoga (only those > 0) */}
                  {isYoga && (hasP4 || hasP8 || hasPLibre) && (
                    <div className="my-4 border-t border-stone-sand pt-3 space-y-2">
                      <div className="flex flex-col gap-1.5 text-xs font-mono">
                        {hasP4 && (
                          <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2 border border-stone-borders/50">
                            <span className="font-sans text-stone-600 font-medium">Abono 4 clases (mensual)</span>
                            <span className="font-semibold text-primary">
                              ${p4Val?.toLocaleString('es-AR')} ARS
                            </span>
                          </div>
                        )}

                        {hasP8 && (
                          <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2 border border-stone-borders/50">
                            <span className="font-sans text-stone-600 font-medium">Abono 8 clases (mensual)</span>
                            <span className="font-semibold text-primary">
                              ${p8Val?.toLocaleString('es-AR')} ARS
                            </span>
                          </div>
                        )}

                        {hasPLibre && (
                          <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2 border border-stone-borders/50">
                            <span className="font-sans text-stone-600 font-medium">Abono 12 clases (mensual)</span>
                            <span className="font-semibold text-primary">
                              ${pLibreVal?.toLocaleString('es-AR')} ARS
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isYoga && service.highlightNote && (
                    <div className="mt-3 pt-2.5 border-t border-stone-borders/60 text-xs font-bold text-stone-charcoal leading-relaxed whitespace-pre-line">
                      {service.highlightNote}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Button trigger */}
                <div className="mt-8 border-t border-stone-borders pt-5">
                  {isYoga ? (
                    <a
                      id={`book-btn-${service.id}`}
                      href={`https://wa.me/5492215232417?text=${encodeURIComponent(`¡Hola Clara! Quisiera reservar mi lugar para la clase de Yoga: ${service.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 cursor-pointer bg-stone-charcoal border border-stone-charcoal text-stone-sand hover:bg-primary hover:border-primary hover:text-stone-sand"
                    >
                      Reservar mi lugar
                    </a>
                  ) : (
                    <a
                      id={`book-btn-${service.id}`}
                      href={`https://wa.me/549221523147?text=${encodeURIComponent(`¡Hola Clara! Quisiera reservar mi turno para: ${service.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 cursor-pointer ${
                        isCombo
                          ? 'bg-stone-gold border border-stone-gold text-stone-sand hover:bg-stone-charcoal hover:border-stone-charcoal shadow-none'
                          : 'bg-stone-charcoal border border-stone-charcoal text-stone-sand hover:bg-primary hover:border-primary hover:text-stone-sand'
                      }`}
                    >
                      RESERVAR MI TURNO
                    </a>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
