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
  // Filter out yoga cards so only non-yoga session cards appear in Sesiones, and honor visible flag
  const displayServices = services.filter(
    (s) => s.category !== 'yoga' && !s.name.toLowerCase().includes('yoga') && s.visible !== false
  );

  return (
    <section 
      id="terapias" 
      className="py-8 sm:py-10 md:py-12 bg-stone-sand bg-[url('/ff.jpeg')] bg-cover bg-center bg-no-repeat scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-center relative"
    >
      <div id="services-section" className="sr-only" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 w-full my-auto">
        
        {/* Services Grid Display */}
        {displayServices.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 bg-white/90 backdrop-blur-xs rounded-xl border border-stone-200 shadow-xs">
            <p className="font-serif italic text-stone-600 text-sm">
              Actualmente no hay sesiones individuales publicadas. Puedes consultar directamente por WhatsApp.
            </p>
            <a
              href={`https://wa.me/5492215232417?text=${encodeURIComponent('¡Hola Clara! Quisiera consultar por sesiones y turnos disponibles.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all bg-stone-charcoal text-stone-sand hover:bg-primary hover:text-white"
            >
              Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <div className={`grid gap-6 md:gap-5 lg:gap-7 ${
            displayServices.length === 1
              ? 'grid-cols-1 max-w-[260px]'
              : displayServices.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-[576px]'
              : 'grid-cols-1 md:grid-cols-3 max-w-[864px]'
          } mx-auto items-stretch auto-rows-fr`}>
            {displayServices.map((service, index) => {
            const isYoga = service.category === 'yoga' || service.name.toLowerCase().includes('yoga');
            const isCombo = service.category === 'combo';

            const allDurations = Array.from(
              new Set(
                [
                  Number(service.duration),
                  ...(Array.isArray(service.durationOptions) ? service.durationOptions.map(Number) : [])
                ].filter((d) => !isNaN(d) && d > 0)
              )
            ).sort((a, b) => a - b);

            const hasP4 = Boolean(service.priceYoga4 && service.priceYoga4 > 0);
            const hasP8 = Boolean((service.priceYoga8 && service.priceYoga8 > 0) || (service.priceYoga8to12 && service.priceYoga8to12 > 0));
            const hasPLibre = Boolean((service.priceYogaPaseLibre && service.priceYogaPaseLibre > 0) || (service.priceYoga12 && service.priceYoga12 > 0));

            const p4Val = service.priceYoga4;
            const p8Val = service.priceYoga8 || service.priceYoga8to12;
            const pLibreVal = service.priceYogaPaseLibre || service.priceYoga12;

            return (
              <div key={service.id} className="flex flex-col items-center w-full h-full">
                <motion.div
                  id={`service-card-${service.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`relative flex flex-col justify-between p-4 sm:p-5 shadow-none transition-all duration-300 rounded-[12px] border-0 w-full max-w-[260px] h-full min-h-[315px] sm:min-h-[327px] overflow-hidden ${
                    isCombo 
                      ? 'bg-stone-sand/40' 
                      : service.backgroundImage ? 'bg-transparent' : 'bg-white'
                  }`}
                >
                {/* Optional Background Image (original color and opacity preserved) */}
                {service.backgroundImage && (
                  <div className="absolute inset-0 overflow-hidden rounded-[12px] pointer-events-none z-0">
                    <img
                      src={service.backgroundImage}
                      alt=""
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Card Content with relative z-10 */}
                <div className="relative z-10 flex flex-col justify-between flex-1 h-full">
                  {/* Card Top Section info */}
                  <div className="flex-1 flex flex-col">
                    <div
                      className={
                        service.backgroundImage
                          ? 'flex-1 bg-white/75 rounded-[8px] p-3.5 sm:p-4 text-[#000000]'
                          : 'flex-1 text-[#000000]'
                      }
                    >
                      {/* Título visible dentro de la tarjeta */}
                      <h3 
                        className="font-serif italic text-2xl sm:text-[26px] font-normal mb-2.5 leading-snug tracking-tight"
                        style={{
                          color: '#000000',
                          fontStyle: 'italic'
                        }}
                      >
                        {service.name}
                      </h3>

                      {/* Duration & Price */}
                      {isYoga ? (
                        allDurations.length > 0 && (
                          <div className="mt-1 mb-3.5 flex items-center gap-1.5 text-xs font-mono text-[#000000] pb-1">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-[#000000]" />
                            <span className="font-sans text-[#000000]">
                              {allDurations.join(' / ')} minutos por clase
                            </span>
                          </div>
                        )
                      ) : (
                        allDurations.length > 0 && (
                          <div className="mt-1 mb-3.5 flex items-center gap-4 text-xs font-mono text-[#000000] pb-1">
                            <span 
                              className="flex items-center gap-1.5 font-sans"
                              style={{ color: '#000000' }}
                            >
                              <Clock 
                                className="h-3.5 w-3.5 shrink-0" 
                                style={{ color: '#000000' }} 
                              />
                              {allDurations.join(' / ')} minutos
                            </span>
                          </div>
                        )
                      )}

                      {/* 3. Días y horarios en negrita (Yoga) */}
                      {isYoga && service.highlightNote && (
                        <div className="mb-3.5 text-xs font-bold text-[#000000] leading-relaxed whitespace-pre-line">
                          {service.highlightNote}
                        </div>
                      )}

                      {/* 4. Description */}
                      <p 
                        className="text-xs leading-relaxed font-normal whitespace-pre-line text-[#000000] mb-0"
                        style={{ color: '#000000' }}
                      >
                        {service.description}
                      </p>

                      {/* Price for non-yoga therapies/sessions (only if > 0, otherwise completely hidden) */}
                      {!isYoga && Number(service.price) > 0 && (
                        <div className="my-3 flex items-center justify-between bg-stone-sand/45 px-3.5 py-2 text-xs font-mono border border-stone-borders/40">
                          <span className="font-sans text-[#000000] font-medium text-[11px]">Valor de la sesión</span>
                          <span className="font-semibold text-primary text-[12px]">
                            ${Number(service.price).toLocaleString('es-AR')} ARS
                          </span>
                        </div>
                      )}

                      {/* 5. Values for Yoga (only those > 0) */}
                      {isYoga && (hasP4 || hasP8 || hasPLibre) && (
                        <div className="my-4 pt-2 space-y-2">
                          <div className="flex flex-col gap-1.5 text-xs font-mono">
                            {hasP4 && (
                              <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2">
                                <span className="font-sans text-[#000000] font-medium">Abono 4 clases (mensual)</span>
                                <span className="font-semibold text-primary">
                                  ${p4Val?.toLocaleString('es-AR')} ARS
                                </span>
                              </div>
                            )}

                            {hasP8 && (
                              <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2">
                                <span className="font-sans text-[#000000] font-medium">Abono 8 clases (mensual)</span>
                                <span className="font-semibold text-primary">
                                  ${p8Val?.toLocaleString('es-AR')} ARS
                                </span>
                              </div>
                            )}

                            {hasPLibre && (
                              <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2">
                                <span className="font-sans text-[#000000] font-medium">Abono 12 clases (mensual)</span>
                                <span className="font-semibold text-primary">
                                  ${pLibreVal?.toLocaleString('es-AR')} ARS
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!isYoga && service.highlightNote && (
                        <div
                          className="mt-3 pt-2 text-xs font-bold leading-relaxed whitespace-pre-line"
                          style={{ color: '#000000' }}
                        >
                          {service.highlightNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Button trigger */}
                  <div className="mt-4 pt-2">
                    {isYoga ? (
                      <a
                        id={`book-btn-${service.id}`}
                        href={`https://wa.me/5492215232417?text=${encodeURIComponent(`¡Hola Clara! Quisiera consultar por las clases de Yoga: ${service.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 cursor-pointer bg-stone-charcoal text-stone-sand hover:bg-primary hover:text-stone-sand"
                      >
                        Reservar mi lugar
                      </a>
                    ) : (
                      <a
                        id={`book-btn-${service.id}`}
                        href={`https://wa.me/5492215232417?text=${encodeURIComponent(`¡Hola Clara! Quisiera consultar por una sesión de ${service.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 cursor-pointer ${
                          isCombo
                            ? 'bg-stone-gold text-stone-sand hover:bg-stone-charcoal shadow-none'
                            : 'bg-stone-charcoal text-stone-sand hover:bg-primary hover:text-stone-sand'
                        }`}
                      >
                        RESERVAR MI TURNO
                      </a>
                    )}
                  </div>
                </div>
                </motion.div>
            </div>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
}
