import { CarouselSlide } from '../types';

interface YogaExplainerSectionProps {
  slides?: CarouselSlide[];
}

export default function YogaExplainerSection(_props: YogaExplainerSectionProps = {}) {
  return (
    <section 
      id="yoga" 
      className="w-full bg-stone-sand scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex items-stretch overflow-hidden relative"
    >
      <div id="yoga-explainer" className="sr-only" />
      {/* 2-Column Layout: Full-bleed photo on the left, Editorial text on the right */}
      <div className="w-full flex-1 flex">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full items-stretch">
          {/* Photo column on the left */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:absolute lg:inset-0 lg:h-full overflow-hidden bg-stone-200/50">
              <img 
                src="/clarayoga-yinyang.jpeg" 
                alt="Clara Yoga - Práctica y presencia" 
                className="w-full h-full object-cover object-[center_25%] scale-[1.35] origin-[center_30%] transition-transform duration-700 hover:scale-[1.38]"
                loading="eager"
              />
            </div>
          </div>

          {/* Text column on the right */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start gap-3 sm:gap-4 px-6 sm:px-10 md:px-14 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20">
            <h3 className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-[42px] font-light tracking-tight text-stone-charcoal leading-[1.15] mb-2 text-left">
              Yoga &amp; Meditación,
              <br />
              medicina para la vida moderna.
            </h3>
            <div className="font-serif italic text-stone-700 font-light text-[18px] leading-[30.8758px] max-w-2xl text-left space-y-4">
              <p>
                Yoga conecta tu cuerpo y tu mente a través de la respiración. Es un camino hacia el interior desde la autoobservación y el autoconocimiento. Más que una serie de posturas, es un viaje personal habitado con presencia para redescubrirnos.
              </p>
              <p>
                La práctica sostenida de la Meditación nos acompaña a cultivar una vida plena. Es una herramienta poderosa para gestionar el estrés y el caos del mundo moderno. Cuando dejamos de identificarnos únicamente con lo físico, comprendemos que la práctica no transforma solo el cuerpo, sino también la mente, las emociones y la energía. Cuanto más nos desapegamos del resultado, más reveladora se vuelve la experiencia.
              </p>
              <p>
                Esta es una invitación a la exploración íntima, donde cada persona avanza a su propio ritmo para integrar cuerpo y mente en una práctica consciente y equilibrada. El Yoga y la Meditación son presencia y conciencia, una bella excusa para desarrollar el estado contemplativo y ser gestores de nuestro bienestar. Todos somos parte de un todo. El trabajo individual cultiva las bases para cocrear un mundo mejor para todos los seres.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
