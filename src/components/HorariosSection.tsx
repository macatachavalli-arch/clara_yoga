/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock } from 'lucide-react';
import { Service } from '../types';
import { SERVICES } from '../data';

interface HorariosSectionProps {
  services?: Service[];
}

export default function HorariosSection({ services: propServices }: HorariosSectionProps = {}) {
  const activeServices = propServices && propServices.length > 0 ? propServices : SERVICES;
  const visibleYogaServices = activeServices.filter(
    (s) => (s.category === 'yoga' || s.name.toLowerCase().includes('yoga')) && s.visible !== false
  );

  return (
    <section 
      id="horarios" 
      className="relative w-full bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-center py-10 sm:py-12 md:py-14 overflow-hidden"
    >
      <div id="horarios-section" className="sr-only" />
      <div id="clases" className="sr-only" />
      {/* Background Image (100% tonalidad original sin atenuar) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/horarios.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 w-full my-auto">
        {visibleYogaServices.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 bg-white/90 backdrop-blur-xs rounded-xl border border-stone-200 shadow-xs">
            <p className="font-serif italic text-stone-600 text-sm">
              Actualmente no hay horarios de yoga publicados. Consulta directamente por WhatsApp para coordinar clases personalizadas.
            </p>
            <a
              href={`https://wa.me/5492215232417?text=${encodeURIComponent('¡Hola Clara! Quisiera consultar por disponibilidad de horarios para clases de Yoga.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all bg-stone-charcoal text-stone-sand hover:bg-primary hover:text-white"
            >
              Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <div className={`grid gap-5 sm:gap-6 ${visibleYogaServices.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2 max-w-4xl'} mx-auto items-stretch`}>
            {visibleYogaServices.map((service) => {
            const hasP4 = Boolean(service.priceYoga4 && service.priceYoga4 > 0);
            const hasP8 = Boolean((service.priceYoga8 && service.priceYoga8 > 0) || (service.priceYoga8to12 && service.priceYoga8to12 > 0));
            const hasPLibre = Boolean((service.priceYogaPaseLibre && service.priceYogaPaseLibre > 0) || (service.priceYoga12 && service.priceYoga12 > 0));

            const p4Val = service.priceYoga4;
            const p8Val = service.priceYoga8 || service.priceYoga8to12;
            const pLibreVal = service.priceYogaPaseLibre || service.priceYoga12;

            return (
              <div
                key={service.id}
                id={`yoga-horarios-card-${service.id}`}
                className={`relative flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 rounded-xl border-0 shadow-xs overflow-hidden ${
                  service.backgroundImage ? 'bg-transparent' : 'bg-white'
                }`}
              >
                {/* Optional Background Image */}
                {service.backgroundImage && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-0">
                    <img
                      src={service.backgroundImage}
                      alt=""
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* 1. Título */}
                    <h4 className="font-serif text-xl sm:text-2xl font-light text-stone-charcoal leading-snug">
                      {service.name}
                    </h4>

                    {/* 2. Duración */}
                    {Number(service.duration) > 0 && (
                      <div className="mt-1.5 mb-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-stone-500 pb-1">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        <span className="font-sans text-stone-500">{service.duration} minutos por clase</span>
                      </div>
                    )}

                    {/* 3. Días y horarios en negrita */}
                    {service.highlightNote && (
                      <div className="mb-2.5 text-xs font-bold text-stone-charcoal leading-relaxed whitespace-pre-line bg-stone-sand/40 px-3 py-2 rounded-sm">
                        {service.highlightNote}
                      </div>
                    )}

                    {/* 4. Texto explicativo */}
                    <p className="text-xs text-[#867768] leading-relaxed font-normal mb-3 whitespace-pre-line">
                      {service.description}
                    </p>

                    {/* 5. Valores (solo se muestran los que tienen precio) */}
                    {(hasP4 || hasP8 || hasPLibre) && (
                      <div className="my-3 pt-1 space-y-1.5">
                        <div className="flex flex-col gap-1.5 text-xs font-mono">
                          {hasP4 && (
                            <div className="flex items-center justify-between bg-stone-sand/50 px-3 py-1.5 rounded-sm">
                              <span className="font-sans text-stone-600 font-medium text-[11px] sm:text-xs">Abono 4 clases (mensual)</span>
                              <span className="font-semibold text-primary text-xs">
                                ${p4Val?.toLocaleString('es-AR')} ARS
                              </span>
                            </div>
                          )}

                          {hasP8 && (
                            <div className="flex items-center justify-between bg-stone-sand/50 px-3 py-1.5 rounded-sm">
                              <span className="font-sans text-stone-600 font-medium text-[11px] sm:text-xs">Abono 8 clases (mensual)</span>
                              <span className="font-semibold text-primary text-xs">
                                ${p8Val?.toLocaleString('es-AR')} ARS
                              </span>
                            </div>
                          )}

                          {hasPLibre && (
                            <div className="flex items-center justify-between bg-stone-sand/50 px-3 py-1.5 rounded-sm">
                              <span className="font-sans text-stone-600 font-medium text-[11px] sm:text-xs">Abono 12 clases (mensual)</span>
                              <span className="font-semibold text-primary text-xs">
                                ${pLibreVal?.toLocaleString('es-AR')} ARS
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón de reserva */}
                  <div className="mt-4 pt-2">
                    <a
                      id={`book-btn-yoga-horarios-${service.id}`}
                      href={`https://wa.me/5492215232417?text=${encodeURIComponent(`¡Hola Clara! Quisiera consultar por las clases de Yoga: ${service.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 sm:py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer bg-[#867768] text-white hover:bg-[#3c3129]"
                    >
                      Reservar mi lugar
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
