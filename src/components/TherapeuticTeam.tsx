/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TEACHERS } from '../data';

export default function TherapeuticTeam() {
  const clara = TEACHERS.find(t => t.id === 'clara') || TEACHERS[0];

  return (
    <section 
      id="bio" 
      className="bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] flex flex-col justify-start w-full overflow-hidden relative"
    >
      <div id="therapeutic-team-section" className="sr-only" />
      {/* Full-width Top Banner Image (Bio.jpeg) - responsive cover on mobile, full panoramic on md+ */}
      <div className="w-full overflow-hidden bg-[#FDFCF8]">
        <img
          src="/Bio.jpeg"
          alt="Clara - Biografía"
          referrerPolicy="no-referrer"
          className="w-full h-[270px] sm:h-[340px] md:h-auto block object-cover object-center md:object-contain select-none"
        />
      </div>

      {/* Bio Text Content */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 w-full">
        <div id="therapeutic-team" className="flex flex-col items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start text-justify italic">
            {/* Columna izquierda (50%): Presentación + Mi recorrido */}
            <div>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Me llamo Clara, nací en la ciudad de La Plata, Buenos Aires, Argentina. Soy profesora y practicante de Yoga, diseñadora, ilustradora, terapeuta Shiatsu Zen, maestra de Reiki y eterna aprendiz.
              </p>

              <h4
                className="not-italic font-semibold mb-2 mt-2 text-left"
                style={{
                  color: '#867768',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'normal',
                  fontSize: '20px',
                  lineHeight: '28px'
                }}
              >
                ꩜
              </h4>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Mi camino en el Yoga comenzó en el año 2005 como una búsqueda de bienestar psicofísico, explorando distintos estilos como Yoga Integral, Terapéutico, Hatha, Vinyasa y Ashtanga Vinyasa. Llevo más de 20 años de práctica sostenida, en los que esta disciplina se volvió un pilar de salud y transformación personal. En 2018 empecé a compartir clases en mi ciudad natal, acompañando a otras personas en sus propios procesos.
              </p>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Me formé en Hatha Yoga y luego realicé la formación de Antropotécnica junto a Santiago Boumpadre, un abordaje con respaldo científico que integra ejercicios de movilidad articular activa y elementos de Yoga postural moderno, meditación y psiconeuroinmunoendocrinología. En paralelo, profundicé en cursos de Om y Neurociencia, Respiración y Emociones, Neurociencia de los Chakras y Neurociencia de la Meditación.
              </p>
              <p 
                className="leading-relaxed text-justify italic mb-0"
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
                Dentro de este viaje personal, la integración de terapias energéticas resulta clave para armonizar mente, cuerpo y espíritu: me formé como terapeuta Shiatsu Zen y alcancé la maestría en Reiki y VP.
              </p>
            </div>

            {/* Columna derecha (50%): Mi enfoque + Mi mirada */}
            <div>
              <h4
                className="not-italic font-semibold mb-2 mt-0 text-left"
                style={{
                  color: '#867768',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'normal',
                  fontSize: '21px',
                  lineHeight: '28px'
                }}
              >
                ꩜
              </h4>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Las prácticas que propongo tienen como finalidad la autorregulación y el equilibrio integral, fomentando la escucha interna y el autoconocimiento.
              </p>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Integro el movimiento consciente, la respiración, la meditación y la sensibilidad energética. Habitamos un espacio para explorar tu propio potencial y regalarte un momento de conciencia plena; regresar a tu verdadera esencia, unificando cuerpo, mente, emociones y espíritu.
              </p>

              <h4
                className="not-italic font-semibold mb-2 mt-2 text-left"
                style={{
                  color: '#867768',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'normal',
                  fontSize: '21px',
                  lineHeight: '28px'
                }}
              >
                ꩜
              </h4>
              <p 
                className="leading-relaxed text-justify italic mb-4"
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
                Con el tiempo comprendí el Yoga como un sendero que se camina con humildad y gratitud; una invitación a contemplar lo simple y conectar con la plenitud de estar vivos. Creo profundamente que el trabajo individual cultiva las bases para cocrear un mundo mejor para todos los seres, porque todos somos parte de un todo.
              </p>
              <p 
                className="leading-relaxed text-justify italic mb-0"
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
                Cada encuentro es una pausa necesaria: una medicina cotidiana para habitar la vida moderna con mayor presencia y equilibrio.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

