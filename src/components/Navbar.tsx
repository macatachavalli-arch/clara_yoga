/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Home, CalendarDays, UserCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'book' | 'my-bookings';
  setActiveTab: (tab: 'home' | 'book' | 'my-bookings') => void;
  bookingCount: number;
}

export default function Navbar({ activeTab, setActiveTab, bookingCount }: NavbarProps) {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home, badge: undefined },
    { id: 'book', label: 'Reservar Turno', icon: CalendarDays, badge: undefined },
    { id: 'my-bookings', label: 'Mis Turnos', icon: UserCheck, badge: bookingCount > 0 ? bookingCount : undefined },
  ] as const;

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full border-b border-stone-borders bg-stone-sand/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 sm:h-20 md:h-24 max-w-7xl items-center justify-center px-3 xs:px-6 sm:px-8 transition-all duration-300">
        
        {/* Navigation Items */}
        <nav id="desktop-nav" className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-stone-400'}`} />
                <span className="inline">{item.label}</span>
                
                {/* Visual indicator of active tab */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/5 border border-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Badge indicator */}
                {item.badge !== undefined && (
                  <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-charcoal px-1.5 text-[10px] font-bold text-stone-sand animate-pulse leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
