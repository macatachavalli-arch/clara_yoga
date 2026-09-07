/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  MapPin, MessageCircle, Mail, Clock, ShieldCheck, Instagram, Lock
} from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-[#FDFCF8] text-stone-charcoal h-[116px] flex flex-col justify-center overflow-hidden border-none">
      
      {/* Extreme bottom copyright and small icons */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© 2026 Maria Clara . Yoga</p>
        <div className="flex items-center gap-4.5">
          {onAdminClick && (
            <button 
              onClick={onAdminClick}
              title="Panel de administración"
              aria-label="Panel de administración"
              className="inline-flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1.5"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}
          <a 
            href="https://www.instagram.com/mariaclara.yoga/" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram @mariaclara.yoga"
            className="text-stone-500 hover:text-stone-charcoal transition-colors inline-flex items-center p-1"
          >
            <Instagram className="h-4.5 w-4.5" />
          </a>
        </div>
      </div>

    </footer>
  );
}
