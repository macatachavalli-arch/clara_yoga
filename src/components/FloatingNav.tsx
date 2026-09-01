/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type SVGProps } from 'react';
import { Clock, User, Mail } from 'lucide-react';

export function LotusIcon({ className = "h-4 w-4", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* 1. Pétalo central vertical */}
      <path d="M12 4.2C9.4 10.5 9.4 14.8 12 19C14.6 14.8 14.6 10.5 12 4.2Z" />
      
      {/* 2. Pétalo intermedio izquierdo */}
      <path d="M12 19C8.2 15.5 5.5 11.2 6.5 6.8C8.8 9.5 10.6 13.8 12 19Z" />
      
      {/* 3. Pétalo intermedio derecho */}
      <path d="M12 19C15.8 15.5 18.5 11.2 17.5 6.8C15.2 9.5 13.4 13.8 12 19Z" />
      
      {/* 4. Pétalo lateral extendido izquierdo */}
      <path d="M12 19C6.2 19 3.2 16.2 2.2 12.2C5.5 10.8 9.2 14.2 12 19Z" />
      
      {/* 5. Pétalo lateral extendido derecho */}
      <path d="M12 19C17.8 19 20.8 16.2 21.8 12.2C18.5 10.8 14.8 14.2 12 19Z" />
    </svg>
  );
}

export function YogaWarriorIcon({ className = "h-4 w-4", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cabeza circular */}
      <circle cx="12" cy="4" r="2" />
      
      {/* Brazos extendidos horizontales */}
      <path d="M4 8.5H20" />
      
      {/* Torso */}
      <path d="M12 8.5V14" />
      
      {/* Pierna trasera estirada diagonal hacia la izquierda */}
      <path d="M12 14L5 19.5" />
      
      {/* Pierna delantera flexionada en ángulo recto (rodilla y pantorrilla) */}
      <path d="M12 14H18.5V20" />
    </svg>
  );
}

export function SimpleSpiralIcon({ className = "h-4 w-4", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Espiral simple suave y armónica */}
      <path d="M12 12a1.8 1.8 0 0 1 1.8 1.8c0 1.9-1.6 3.4-3.6 3.4-2.8 0-5-2.2-5-5 0-3.8 3.1-6.8 6.8-6.8 4.6 0 8.4 3.8 8.4 8.4 0 5.5-4.5 10-10 10" />
    </svg>
  );
}

interface FloatingNavProps {
  onNavigateHomeAndScroll?: (sectionId: string) => void;
  activeTab: 'home' | 'book' | 'my-bookings';
  setActiveTab: (tab: 'home' | 'book' | 'my-bookings') => void;
}

export const SECTIONS = [
  { id: 'yoga-explainer', label: 'Yoga', shortLabel: 'Yoga', icon: LotusIcon },
  { id: 'estilos-practica', label: 'Estilos', shortLabel: 'Estilos', icon: YogaWarriorIcon },
  { id: 'horarios-section', label: 'Horarios', shortLabel: 'Horarios', icon: Clock },
  { id: 'services-section', label: 'Terapias', shortLabel: 'Terapias', icon: SimpleSpiralIcon },
  { id: 'therapeutic-team-section', label: 'Bío', shortLabel: 'Bío', icon: User },
  { id: 'contact-section', label: 'Contacto', shortLabel: 'Contacto', icon: Mail },
];

export default function FloatingNav({ onNavigateHomeAndScroll, activeTab, setActiveTab }: FloatingNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolledPastHero, setIsScrolledPastHero] = useState<boolean>(false);

  // Track scroll position to:
  // 1. Highlight currently active section
  // 2. Transition desktop bar from Hero bottom position to top floating pill
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroEl = document.getElementById('hero-section');
      const heroBottom = heroEl ? (heroEl.offsetTop + heroEl.offsetHeight - 120) : (window.innerHeight - 150);
      setIsScrolledPastHero(scrollY > heroBottom);

      if (activeTab !== 'home') return;

      if (scrollY < 200) {
        setActiveSection('');
        return;
      }

      const scrollPosition = scrollY + 120; // offset for sticky top navbar

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const scrollToTop = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectionClick = (sectionId: string) => {
    const scrollToTarget = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeader = document.getElementById('desktop-floating-nav');
        const navHeight = (navHeader && window.innerWidth >= 768) ? navHeader.getBoundingClientRect().height : 0;
        const elementRect = element.getBoundingClientRect();
        const targetScrollTop = elementRect.top + window.scrollY - navHeight;

        window.scrollTo({ 
          top: Math.max(0, targetScrollTop), 
          behavior: 'smooth' 
        });
      }
    };

    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(scrollToTarget, 100);
    } else {
      scrollToTarget();
    }
  };

  return (
    <>
      {/* 🖥️ DESKTOP & TABLET: 
          - Full width of the screen
          - Without rounded borders
          - Located at the top, physically ABOVE the hero (not covering it)
      */}
      <header 
        id="desktop-floating-nav"
        className="hidden md:block sticky top-0 z-50 w-full bg-[#232323] border-b border-white/10 shadow-sm"
      >
        <nav
          aria-label="Botonera principal de navegación"
          className="w-full max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 px-4 py-2 sm:py-2.5 rounded-none"
        >
          {/* ✶ Símbolo para ir al inicio */}
          <button
            type="button"
            onClick={scrollToTop}
            title="Inicio de página"
            aria-label="Ir al inicio"
            className="group relative p-2 px-3 rounded-none text-[#dcdcdc] hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-200 cursor-pointer focus:outline-none shrink-0 flex items-center justify-center"
          >
            <span className="text-base sm:text-lg leading-none text-[#dcdcdc] group-hover:text-white group-hover:rotate-45 group-hover:scale-125 transition-all duration-300 select-none">
              ✶
            </span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 my-auto" />

          {/* Secciones */}
          {SECTIONS.map((sec) => {
            const isCurrent = activeTab === 'home' && activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSectionClick(sec.id)}
                className={`relative px-4 sm:px-6 py-2 rounded-none text-xs sm:text-[13px] font-serif tracking-wider uppercase transition-all duration-200 cursor-pointer focus:outline-none ${
                  isCurrent
                    ? 'text-white bg-white/20 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <span className="drop-shadow-xs whitespace-nowrap font-serif tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
                  {sec.label}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* 📱 MOBILE: Bottom App-Style Translucent Navigation Bar with Solcito at start + subtle allegorical icons only */}
      <div 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[70] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="bg-stone-950/90 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-2 py-2">
          <nav
            aria-label="Navegación inferior móvil"
            className="flex items-center justify-between gap-1 max-w-md mx-auto"
          >
            {/* ✶ Símbolo para ir al inicio en Móvil */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Inicio"
              aria-label="Inicio"
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'home' && !activeSection
                  ? 'bg-white/20 text-white'
                  : 'text-stone-300/75 hover:text-white active:bg-white/10'
              }`}
            >
              <span className={`text-xl leading-none select-none transition-transform duration-200 ${
                activeTab === 'home' && !activeSection
                  ? 'text-white scale-110'
                  : 'text-stone-300/80'
              }`}>
                ✶
              </span>
              {activeTab === 'home' && !activeSection && (
                <span className="w-1 h-1 rounded-full bg-white mt-1 shrink-0" />
              )}
            </button>

            {/* Secciones con sólo iconos alusivos */}
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isCurrent = activeTab === 'home' && activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionClick(sec.id)}
                  title={sec.label}
                  aria-label={sec.label}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : 'text-stone-300/75 hover:text-white active:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${
                    isCurrent ? 'text-white scale-110' : 'text-stone-300/80'
                  }`} />
                  {isCurrent && (
                    <span className="w-1 h-1 rounded-full bg-white mt-1 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
