/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TEACHERS } from '../data';

export default function TherapeuticTeam() {
  return (
    <section id="therapeutic-team-section" className="pt-[30px] pb-20 bg-stone-sand border-b border-stone-borders scroll-mt-20 h-[690px] flex flex-col justify-center">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Our Teachers profile grid */}
        <div id="therapeutic-team" className="flex justify-center">
          <div className="max-w-5xl w-full">
            {TEACHERS.map((teacher) => (
              <div 
                key={teacher.id} 
                id={`teacher-card-${teacher.id}`}
                className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12 rounded-none border-0 bg-[#FDFCF8] p-6 md:p-12 shadow-none transition-all overflow-hidden"
              >
                {/* Teacher Avatar */}
                {teacher.image ? (
                  <div className="h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] md:h-[480px] md:w-[360px] shrink-0 overflow-hidden rounded-none">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain rounded-none bg-[#FDFCF8]"
                    />
                  </div>
                ) : null}

                {/* Teacher Details */}
                <div className={`text-center flex-1 md:py-6 flex flex-col justify-center items-center text-[#232323] ${teacher.image ? 'md:text-left md:items-baseline md:max-w-xl md:pr-10' : 'w-full text-center max-w-3xl mx-auto'}`}>
                  <div className={`flex flex-col items-center justify-center gap-1 ${teacher.image ? 'md:items-baseline md:justify-start' : 'items-center justify-center'}`}>
                    <h3 
                      className="font-serif font-light text-center"
                      style={{
                        fontStyle: 'italic',
                        fontSize: '36px',
                        color: '#232323',
                        borderStyle: 'none'
                      }}
                    >
                      Sobre mí
                    </h3>
                  </div>

                  {teacher.bio.split('\n').filter(p => p.trim() !== '').map((para, idx) => (
                    <p 
                      key={idx}
                      className={`mt-2 first:mt-4 leading-relaxed ${teacher.image ? 'text-center md:text-left' : 'text-center'}`}
                      style={{
                        color: '#232323',
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontStyle: 'normal',
                        fontSize: '16px',
                        lineHeight: '29.375px',
                        textWrap: 'pretty'
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
