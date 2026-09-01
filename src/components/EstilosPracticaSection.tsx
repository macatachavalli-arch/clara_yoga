interface StyleItem {
  id: string;
  title: string;
  energy: string;
  description: string;
}

const ESTILOS_DATA: StyleItem[] = [
  {
    id: 'yin-yang-yoga',
    title: 'Yin & Yang Yoga',
    energy: 'EQUILIBRIO',
    description: 'En estas prácticas trabajamos el equilibrio entre la pausa y el movimiento, integrando las dos energías que nos habitan. Vamos a explorar los opuestos complementarios Yin Yang buscando variables entre la acción y la quietud, el movimiento y la pausa.'
  },
  {
    id: 'vinyasa-yoga',
    title: 'Vinyasa Yoga',
    energy: 'DINÁMICO • YANG',
    description: 'Secuencias dinámicas que enlazan el movimiento continuo con el ritmo de la respiración. Práctica grupal con una mirada activa a nivel individual, con ajustes específicos según anatomía, energía e historia de cada cuerpo. Cada practicante evoluciona a su ritmo.'
  },
  {
    id: 'yin-yoga',
    title: 'Yin Yoga',
    energy: 'CALMA • YIN',
    description: 'Posturas pasivas sostenidas en el tiempo para relajar tejidos conectivos profundos (fascias, tendones y ligamentos). Invita al descanso del sistema nervioso y a la introspección serena.'
  },
  {
    id: 'antropotecnica',
    title: 'Antropotécnica',
    energy: 'MOVILIDAD Y FUERZA',
    description: 'Práctica con fundamentos teóricos basados en la evidencia científica mas actual. Integramos fuerza, movilidad articular y flexibilidad activa, dedicándole además un momento importante a la práctica de la Meditación.'
  }
];

export default function EstilosPracticaSection() {
  return (
    <section 
      id="estilos-practica" 
      className="w-full bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-center py-8 sm:py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 w-full my-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto">
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-charcoal tracking-tight">
            Estilos de práctica
          </h3>
        </div>

        {/* Estilos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {ESTILOS_DATA.map((estilo) => {
            return (
              <div
                key={estilo.id}
                id={`estilo-card-${estilo.id}`}
                className="bg-white p-7 sm:p-8 rounded-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                style={{ borderWidth: '1px', borderColor: '#474747', borderStyle: 'solid' }}
              >
                <div>
                  {/* Category / Energy Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-stone-gold bg-stone-sand/60 px-2.5 py-1 rounded-sm">
                      {estilo.energy}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-2xl font-light text-stone-charcoal mb-3">
                    {estilo.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#867768] leading-relaxed font-normal">
                    {estilo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
