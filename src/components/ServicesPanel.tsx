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
    <section 
      id="services-section" 
      className="py-8 sm:py-10 md:py-12 bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-center"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 w-full my-auto">
        
        {/* Services Grid Display */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto items-start">
          {displayServices.map((service, index) => {
            const isYoga = service.category === 'yoga' || service.name.toLowerCase().includes('yoga');
            const isCombo = service.category === 'combo';

            const nameLower = (service.name || '').toLowerCase();
            const catLower = (service.category || '').toLowerCase();

            const cardTitle = catLower === 'shiatsu' || nameLower.includes('shiatsu')
              ? 'Shiatsu Zen'
              : catLower === 'reiki' || nameLower.includes('reiki')
              ? 'Reiki Usui'
              : service.name;

            const hasP4 = Boolean(service.priceYoga4 && service.priceYoga4 > 0);
            const hasP8 = Boolean((service.priceYoga8 && service.priceYoga8 > 0) || (service.priceYoga8to12 && service.priceYoga8to12 > 0));
            const hasPLibre = Boolean((service.priceYogaPaseLibre && service.priceYogaPaseLibre > 0) || (service.priceYoga12 && service.priceYoga12 > 0));

            const p4Val = service.priceYoga4;
            const p8Val = service.priceYoga8 || service.priceYoga8to12;
            const pLibreVal = service.priceYogaPaseLibre || service.priceYoga12;

            return (
              <div key={service.id} className="flex flex-col items-center w-full">
                {/* Main title aligned centrally with the card */}
                <h2 className="font-serif text-[32px] sm:text-[36px] italic font-light text-stone-charcoal text-center mb-3">
                  {cardTitle}
                </h2>

                {/* Subtitle / Description paragraph before card */}
                <p className="font-serif font-light text-stone-600 text-[18px] leading-[29.75px] text-center mb-6 max-w-[350px] w-full px-2 italic">
                  {cardTitle === 'Shiatsu Zen' ? (
                    'Masaje para recuperar el equilibrio energético del cuerpo. Un trabajo de digitopresión, rotaciones y estiramientos suaves, para transitar una experiencia profunda y restaurativa.'
                  ) : cardTitle === 'Reiki Usui' ? (
                    <>
                      Canalización de energía vital mediante imposición de manos. Una terapia orientada a disolver tensiones, calmar la mente y restablecer el equilibrio natural. Reiki es amor, luz y transformación.
                    </>
                  ) : (
                    <>
                      Espacio dedicado a la autorregulación y el bienestar consciente. Prácticas y encuentros diseñados para profundizar en la conexión corporal y serenar la mente.
                    </>
                  )}
                </p>

                <motion.div
                  id={`service-card-${service.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`relative flex flex-col justify-between p-5 sm:p-6 shadow-none transition-all duration-300 rounded-[12px] border-0 w-full min-h-[370px] sm:min-h-[385px] overflow-hidden ${
                    isCombo 
                      ? 'bg-stone-sand/40' 
                      : service.backgroundImage ? 'bg-transparent' : 'bg-white'
                  }`}
                >
                {/* Optional Background Image */}
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
                  <div className="flex-1">
                    {/* Duration & Price */}
                    {isYoga ? (
                      Number(service.duration) > 0 && (
                        <div className="mt-1 mb-3.5 flex items-center gap-1.5 text-xs font-mono text-stone-500 pb-1">
                          <Clock className="h-3.5 w-3.5 text-stone-400" />
                          <span className="font-sans text-stone-500">{service.duration} minutos por clase</span>
                        </div>
                      )
                    ) : (
                      Number(service.duration) > 0 && (
                        <div className="mt-1 mb-3.5 flex items-center gap-4 text-xs font-mono text-stone-500 pb-1">
                          <span 
                            className="flex items-center gap-1 font-sans"
                            style={service.id === 'shiatsu-hot-stones' || service.id === 'shiatsu-tradicional' ? { color: '#efefef' } : { color: '#78716c' }}
                          >
                            <Clock 
                              className="h-3.5 w-3.5" 
                              style={service.id === 'shiatsu-tradicional' || service.id === 'shiatsu-hot-stones' ? { color: '#efefef' } : { color: '#a8a29e' }} 
                            />
                            {service.duration} minutos
                          </span>
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
                    <p className="text-xs text-[#867768] leading-relaxed font-normal mb-3.5 whitespace-pre-line">
                      {service.description}
                    </p>

                    {/* Price for non-yoga therapies/sessions (only if > 0, otherwise completely hidden) */}
                    {!isYoga && Number(service.price) > 0 && (
                      <div className="my-3 flex items-center justify-between bg-stone-sand/45 px-3.5 py-2 text-xs font-mono border border-stone-borders/40">
                        <span className="font-sans text-stone-600 font-medium text-[11px]">Valor de la sesión</span>
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
                              <span className="font-sans text-stone-600 font-medium">Abono 4 clases (mensual)</span>
                              <span className="font-semibold text-primary">
                                ${p4Val?.toLocaleString('es-AR')} ARS
                              </span>
                            </div>
                          )}

                          {hasP8 && (
                            <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2">
                              <span className="font-sans text-stone-600 font-medium">Abono 8 clases (mensual)</span>
                              <span className="font-semibold text-primary">
                                ${p8Val?.toLocaleString('es-AR')} ARS
                              </span>
                            </div>
                          )}

                          {hasPLibre && (
                            <div className="flex items-center justify-between bg-stone-sand/40 px-3 py-2">
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
                      <div className="mt-3 pt-2 text-xs font-bold text-stone-charcoal leading-relaxed whitespace-pre-line">
                        {service.highlightNote}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Button trigger */}
                  <div className="mt-8 pt-3">
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

      </div>
    </section>
  );
}
