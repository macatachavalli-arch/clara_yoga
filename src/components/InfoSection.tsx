/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock } from 'lucide-react';
import { SERVICES } from '../data';
import { Service } from '../types';
// @ts-expect-error - Vite handles asset bundling for png seamlessly at build time
import shiatsuTherapyImg from '../assets/images/shiatsu_therapy_1780004600309.png';

interface Meridian {
  name: string;
  focus: string;
  symptoms: string;
}

interface ElementGroup {
  name: string;
  organs: string;
  concept: string;
  meridians: Meridian[];
}

const SHIATSU_ELEMENTS: ElementGroup[] = [
  {
    name: 'Elemento Metal',
    organs: 'Pulmones / Intestino Grueso',
    concept: 'Controla la frontera entre lo interior y lo exterior.',
    meridians: [
      {
        name: 'Meridiano del Pulmón (P)',
        focus: 'Empieza en el plexo solar, pasa por los pulmones, sube a la garganta y recorre la parte anterior del brazo hasta la esquina de la uña del pulgar.',
        symptoms: 'Cansancio, respiración irregular, complexión pálida, pecho cargado, tos, asma, molestias de garganta y pérdida de la voz.'
      },
      {
        name: 'Meridiano del Intestino Grueso (IG)',
        focus: 'Comienza en el dedo índice, sube por el borde externo del brazo hasta el hombro, cruza el cuello y termina junto a la nariz.',
        symptoms: 'Estreñimiento (especialmente con fiebre), congestión nasal, sinusitis, dolor de muelas, y dolor o rigidez en el hombro.'
      }
    ]
  },
  {
    name: 'Elemento Tierra',
    organs: 'Estómago / Bazo',
    concept: 'Representa los órganos de la digestión y está vinculado con la seguridad y la comodidad.',
    meridians: [
      {
        name: 'Meridiano del Estómago (E)',
        focus: 'Empieza debajo del ojo, rodea la boca, sube a la frente, baja por la garganta, pecho y abdomen, recorre la cara anterior del muslo y termina en el segundo y tercer dedo del pie.',
        symptoms: 'Náuseas, vómitos, indigestión, dolor de estómago, encías irritadas, dolores en la frente y problemas de visión.'
      },
      {
        name: 'Meridiano del Bazo (B)',
        focus: 'Inicia en el dedo gordo del pie, sube por la cara interna de la pierna, atraviesa el abdomen y pecho hasta terminar debajo de la lengua.',
        symptoms: 'Poco apetito, digestión débil, cansancio, debilidad muscular, extremidades pesadas, diarrea, mala memoria e hinchazón abdominal.'
      }
    ]
  },
  {
    name: 'Elemento Fuego',
    organs: 'Corazón / Intestino Delgado / Pericardio / Triple Calentador',
    concept: 'Relacionado con la conciencia, la circulación de la sangre y la respuesta emocional.',
    meridians: [
      {
        name: 'Meridiano del Corazón (C)',
        focus: 'Sale del corazón, emerge en la axila y desciende por la parte interna del brazo hasta el dedo meñique.',
        symptoms: 'Intranquilidad, insomnio, palpitaciones, nerviosismo, ansiedad, manos frías o calientes y tartamudeo.'
      },
      {
        name: 'Meridiano del Intestino Delgado (ID)',
        focus: 'Inicia en el dedo meñique, sigue por el borde externo de la mano y el brazo, cruza el omóplato, sube por el cuello hasta la oreja y el pómulo.',
        symptoms: 'Pensamiento confuso, rigidez y dolor en cuello y hombros, otalgia (dolor de oídos) y ojos irritados.'
      },
      {
        name: 'Meridiano del Pericardio (PE)',
        focus: 'Comienza en el pecho, baja por el centro de la cara interna del brazo y termina en el dedo corazón.',
        symptoms: 'Ansiedad, depresión, opresión en el pecho, náuseas por indigestión y problemas emocionales vinculados a las relaciones.'
      },
      {
        name: 'Meridiano del Triple Calentador (TC)',
        focus: 'Empieza en el dedo anular, sube por la parte posterior del brazo hasta el hombro, rodea la oreja y termina en el extremo de la ceja.',
        symptoms: 'Ojos irritados, afecciones del oído, dolor detrás de la oreja, garganta inflamada, fiebre y susceptibilidad a infecciones.'
      }
    ]
  },
  {
    name: 'Elemento Madera',
    organs: 'Vesícula Biliar / Hígado',
    concept: 'Asociado con la planificación, la toma de decisiones y el flujo libre del Ki.',
    meridians: [
      {
        name: 'Meridiano de la Vesícula Biliar (VB)',
        focus: 'Inicia en la comisura externa del ojo, rodea la cabeza, baja por el costado del cuerpo y la parte lateral de la pierna hasta el cuarto dedo del pie.',
        symptoms: 'Mala digestión de grasas, sabor amargo en la boca, náuseas, migrañas, rigidez en la mandíbula y dolor en caderas o rodillas.'
      },
      {
        name: 'Meridiano del Hígado (H)',
        focus: 'Empieza en el dedo gordo del pie, sube por la cara interna de la pierna, recorre los genitales, costillas y termina en la parte superior de la cabeza.',
        symptoms: 'Irritabilidad, frustración, depresión, dolores de cabeza agudos, vértigos, problemas menstruales y visión deficiente.'
      }
    ]
  },
  {
    name: 'Elemento Agua',
    organs: 'Vejiga / Riñón',
    concept: 'Relacionado con la supervivencia, la purificación y los fundamentos vitales.',
    meridians: [
      {
        name: 'Meridiano de la Vejiga (V)',
        focus: 'Comienza en el ojo, sube por la frente, baja por la nuca y desciende en dos líneas paralelas a la columna hasta las piernas, terminando en el dedo meñique del pie.',
        symptoms: 'Dolores de espalda y cuello, ciática, obsesiones, nervios tensos, insomnio y problemas urinarios.'
      },
      {
        name: 'Meridiano del Riñón (R)',
        focus: 'Inicia en la planta del pie, gira tras el tobillo interno, sube por la cara interna de la pierna y el abdomen hasta la clavícula.',
        symptoms: 'Fatiga, dolor en la parte baja de la espalda, mala memoria, zumbido en los oídos, problemas sexuales e irritación crónica de garganta.'
      }
    ]
  }
];

interface YogaCategory {
  name: string;
  focusArea: string;
  concept: string;
  link?: {
    text: string;
    url: string;
  };
}

const YOGA_PRACTICES: YogaCategory[] = [
  {
    name: 'Yoga Yin & Yang',
    focusArea: 'Equilibrio / Pausa & Movimiento',
    concept: 'En estas prácticas trabajamos el equilibrio entre la pausa y el movimiento, integrando las dos energías que nos habitan. Vamos a explorar los opuestos complementarios Yin Yang buscando variables entre la acción, el movimiento, la fuerza; y habitar la permanencia permitiendo que el cuerpo se relaje en la quietud, en la calma, en la pausa.'
  },
  {
    name: 'Antropotécnica',
    focusArea: 'Evidencia Científica & Bienestar',
    concept: 'Estilo de práctica con fundamentos teóricos basados en la evidencia científica mas actual. Abordamos técnicas de Yoga y Meditación con efectos terapéuticos validados por la ciencia. El objetivo es siempre lograr un mayor bienestar y salud mente cuerpo como producto de una práctica inteligente. Integramos fuerza, movilidad articular y flexibilidad activa, dedicándole además un momento importante a la práctica de la meditación.',
    link: {
      text: 'más acerca del método Antropotécnica',
      url: 'https://antropotecnica.com/page/metodo'
    }
  },
  {
    name: 'Vinyasa Yoga',
    focusArea: 'Sincronización & Fluidez Dinámica',
    concept: 'En las prácticas de Vinyasa Yoga, cada postura se une fluidamente a través de un enlace (vinyasa), generando secuencias enfocadas en sincronización del movimiento y la respiración. Las prácticas son guiadas para todo el grupo practicante, aunque está presente la mirada activa a nivel individual, con ajustes específicos según anatomía, energía e historia de cada cuerpo. Cada practicante evoluciona a su ritmo. La energía se centra en el fluir entre una postura y otra, y crear un movimiento dinámico.'
  }
];

interface InfoSectionProps {
  services?: Service[];
}

export default function InfoSection({ services: propServices }: InfoSectionProps = {}) {
  const activeServices = propServices && propServices.length > 0 ? propServices : SERVICES;
  return (
    <section id="info-section" className="pt-0 pb-0 bg-stone-sand scroll-mt-20 border-b border-stone-borders">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pb-16">
        
        <div className="grid grid-cols-1 gap-8 items-start mt-[60px]">
          {/* Dynamic Section: Yoga Style Explainer (always open) */}
          <div id="yoga-explainer" className="w-full font-sans">
            <div className="pb-2">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                {/* Text content */}
                <div className="flex-1 text-center w-full">
                  <h3 className="font-serif text-3xl font-light text-stone-charcoal sm:text-4xl italic">
                    Yoga
                  </h3>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {YOGA_PRACTICES.map((style, idx) => {
                return (
                  <div key={idx} className="flex flex-col border border-stone-borders bg-[#FDFCF8] p-5 sm:p-6 transition-all hover:border-stone-charcoal/30 rounded-xl h-full justify-between">
                    <div className="w-full">
                      <span className="text-[9px] tracking-widest uppercase opacity-75 block font-sans text-[#867768]">
                        {style.focusArea}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-semibold text-stone-charcoal mt-1">{style.name}</h4>
                      
                      <p className="text-[14px] leading-relaxed text-stone-600 font-serif mt-3">
                        {style.concept}
                      </p>
                    </div>
                    {style.link && (
                      <div className="pt-4 mt-2">
                        <a
                          href={style.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#867768] hover:text-[#5e5348] underline underline-offset-4 font-semibold"
                        >
                          {style.link.text} →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Two-column split section going edge to edge */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: #232323 background with text */}
        <div className="bg-[#232323] text-stone-200 py-12 px-6 sm:px-12 md:py-16 md:pl-12 lg:pl-24 lg:pr-16 flex flex-col justify-center gap-6 font-serif text-[20px] leading-relaxed">
          <p className="italic">
            Las clases están pensadas para todas las personas. No necesitás experiencia previa. Propongo un trabajo progresivo y cuidado, donde cada practicante puede explorar y avanzar a su propio ritmo.
          </p>
          <p className="italic">
            Con una mirada integral, se ajusta cada herramienta del yoga a las posibilidades reales de quien practica, priorizando el bienestar, la conexión personal y la salud.
          </p>
        </div>

        {/* Right Side: #867768 background with image */}
        <div className="bg-[#867768] py-12 px-6 sm:px-12 flex items-center justify-center min-h-[300px] md:min-h-[400px] relative overflow-hidden">
          <img 
            src="https://i.imgur.com/cwyJxcP.png" 
            alt="Yoga pose" 
            referrerPolicy="no-referrer"
            className="max-h-[133px] sm:max-h-[156px] w-auto object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* Horarios Section with Yoga Cards */}
      <div id="horarios-section" className="mx-auto max-w-7xl px-6 sm:px-8 py-16">
        <div className="text-center mb-10">
          <h3 className="font-serif text-3xl font-light text-stone-charcoal sm:text-4xl italic">
            Horarios
          </h3>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {activeServices.filter(s => s.category === 'yoga' || s.name.toLowerCase().includes('yoga')).map((service) => {
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
                className="relative flex flex-col justify-between bg-white p-6 shadow-none transition-all hover:border-stone-charcoal duration-300 rounded-[12px] border border-[#e5e1d8]"
              >
                <div>
                  {/* 1. Título */}
                  <h4 className="font-serif text-xl font-light text-stone-charcoal leading-snug">
                    {service.name}
                  </h4>

                  {/* 2. Duración */}
                  {Number(service.duration) > 0 && (
                    <div className="mt-2.5 mb-3.5 flex items-center gap-1.5 text-xs font-mono text-stone-500 border-b border-stone-sand pb-2.5">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      <span className="font-sans text-stone-500">{service.duration} minutos por clase</span>
                    </div>
                  )}

                  {/* 3. Días y horarios en negrita */}
                  {service.highlightNote && (
                    <div className="mb-3.5 text-xs font-bold text-stone-charcoal leading-relaxed whitespace-pre-line">
                      {service.highlightNote}
                    </div>
                  )}

                  {/* 4. Texto explicativo */}
                  <p className="text-xs text-[#867768] leading-relaxed font-normal mb-4 whitespace-pre-line">
                    {service.description}
                  </p>

                  {/* 5. Valores (solo se muestran los que tienen precio) */}
                  {(hasP4 || hasP8 || hasPLibre) && (
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
                </div>

                {/* Botón de reserva */}
                <div className="mt-8 border-t border-stone-borders pt-5">
                  <a
                    id={`book-btn-yoga-horarios-${service.id}`}
                    href={`https://wa.me/5492215232417?text=${encodeURIComponent(`¡Hola Clara! Quisiera consultar horarios y reservar mi lugar para la clase de Yoga: ${service.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 cursor-pointer bg-stone-charcoal border border-stone-charcoal text-stone-sand hover:bg-primary hover:border-primary hover:text-stone-sand"
                  >
                    Reservar mi lugar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
