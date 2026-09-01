/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TEACHERS } from '../data';

export default function TherapeuticTeam() {
  const clara = TEACHERS.find(t => t.id === 'clara') || TEACHERS[0];

  return (
    <section 
      id="therapeutic-team-section" 
      className="bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] flex flex-col justify-start w-full overflow-hidden"
    >
      {/* Full-width Top Banner Image (Bio.jpeg) without cropping */}
      <div className="w-full bg-[#FDFCF8]">
        <img
          src="/Bio.jpeg"
          alt="Clara - Biografía"
          referrerPolicy="no-referrer"
          className="w-full h-auto block object-contain select-none"
        />
      </div>

      {/* Bio Text Content */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 w-full">
        <div id="therapeutic-team" className="flex flex-col items-center">
          
          <h3 
            className="font-serif font-light text-center mb-6"
            style={{
              fontStyle: 'italic',
              fontSize: '36px',
              color: '#232323',
              borderStyle: 'none'
            }}
          >
            Clara
          </h3>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 text-justify italic">
            {/* Columna 1 */}
            <div className="space-y-4">
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                Nací en la ciudad de La Plata, Bs As, Argentina. Soy Diseñadora en Comunicación Visual e <a href="http://www.macatachavalli.com.ar" target="_blank" rel="noopener noreferrer" className="underline decoration-stone-400 hover:text-stone-900 transition-colors">Ilustradora</a>. Desde muy pequeña me acompañan los dibujos. Me siento muy afortunada de poder expresar a través de la ilustración.
              </p>
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                En el arte como en las prácticas hacia el equilibrio psicofísico, me inspiran profundamente el sentido de transformación, la transmutación, la conexión energética. Soy terapeuta Shiatsu Zen y maestra de Reiki.
              </p>
            </div>

            {/* Columna 2 */}
            <div className="space-y-4">
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                Mi camino en el Yoga comenzó en el año 2005 con la práctica regular de diversos estilos como Vinyasa Yoga, Yoga Integral, Ashtanga Vinyasa Yoga y Hatha Yoga. Brindo prácticas en mi ciudad natal desde el año 2018. La práctica que propongo tiene como finalidad la autorregulación y el equilibrio mente cuerpo espíritu; fomentar la escucha interna y el autoconocimiento.
              </p>
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                Realicé el profesorado de Hatha Yoga, y luego la formación de Antropotécnica con Santiago Boumpadre, quien aportó a mis años de práctica un contenido profundo en el estudio mente cuerpo validado por la ciencia.
              </p>
            </div>

            {/* Columna 3 */}
            <div className="space-y-4">
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                Mis prácticas hoy tienen bases sólidas sobre este método. Junto a Santiago también realicé talleres y cursos en simultáneo a la formación: Om y Neurociencia, Respiración y Emociones, Neurociencia de los Chakras y Neurociencia de la Meditación.
              </p>
              <p 
                className="leading-relaxed text-justify italic"
                style={{
                  color: '#232323',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  textWrap: 'pretty'
                }}
              >
                La práctica sostenida, el equilibrio del flujo energético, el movimiento, la respiración y la meditación como medicina para la vida moderna.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

