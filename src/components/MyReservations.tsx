/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, User, Trash2, Heart, 
  MapPin, AlertCircle, ShoppingBag, Send, ChevronLeft 
} from 'lucide-react';
import { Booking, Service } from '../types';

interface MyReservationsProps {
  services: Service[];
  onStartBooking: () => void;
  onGoHome?: () => void;
  refreshFlag: number;
}

export default function MyReservations({ services, onStartBooking, onGoHome, refreshFlag }: MyReservationsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load bookings from localStorage with matching statuses from server database
  const loadBookings = async () => {
    try {
      const stored = localStorage.getItem('yoga_shiatsu_bookings');
      let baseBookings: Booking[] = stored ? JSON.parse(stored) : [];

      try {
        const resp = await fetch('/api/bookings');
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.bookings)) {
            const serverBookings: Booking[] = data.bookings;
            // Update local storage bookings with live backend database attributes (e.g. status updates from Clara)
            baseBookings = baseBookings.map(b => {
              const matched = serverBookings.find(sb => sb.id === b.id);
              if (matched) {
                return { ...b, ...matched };
              }
              return b;
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync with live booking database, falling back to local representation only.', err);
      }

      // Sort bookings by date and time (most recent first)
      const sorted = baseBookings.sort((a, b) => {
        return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
      });
      setBookings(sorted);
    } catch (err) {
      console.error('Error loading bookings', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [refreshFlag]);

  // Delete a booking completely
  const handleDeleteBooking = async (id: string) => {
    try {
      const stored = localStorage.getItem('yoga_shiatsu_bookings');
      if (stored) {
        const parsed: Booking[] = JSON.parse(stored);
        const updated = parsed.filter((item) => item.id !== id);
        localStorage.setItem('yoga_shiatsu_bookings', JSON.stringify(updated));
        
        // Notify server database to release slot
        try {
          await fetch('/api/bookings/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
        } catch (serverErr) {
          console.error('Error notifying server about deleted booking:', serverErr);
        }

        setDeleteConfirmId(null);
        await loadBookings(); // refresh UI
      }
    } catch (err) {
      console.error('Error al eliminar la reserva.', err);
    }
  };

  const getServicePrice = (serviceId: string) => {
    const s = services.find(srv => srv.id === serviceId);
    return s ? s.price : 0;
  };

  // Helper date text formatter
  const formatDateLabel = (isoString: string) => {
    if (!isoString) return '';
    const parts = isoString.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div id="my-reservations-panel" className="mx-auto max-w-4xl px-4 py-12 scroll-mt-20">
      
      {onGoHome && (
        <div className="mb-6">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </button>
        </div>
      )}
      

      <AnimatePresence mode="popLayout">
        {bookings.length === 0 ? (
          
          /* EMPTY STATE CARD */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-none border border-stone-borders bg-white p-8 sm:p-12 text-center space-y-6 max-w-md mx-auto"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-stone-sand text-primary border border-stone-borders">
              <Heart className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-stone-charcoal">Aún no posees turnos programados</h4>
            </div>

            <button
              onClick={onStartBooking}
              className="inline-flex items-center gap-2 rounded-none bg-stone-charcoal border border-stone-charcoal px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-sand hover:bg-primary hover:border-primary transition-all duration-300 cursor-pointer shadow-none"
            >
              <Calendar className="h-4 w-4" />
              Ver horarios y Reservar
            </button>
          </motion.div>

        ) : (
          
          /* BOOKINGS LIST GRID */
          <motion.div 
            key="bookings-grid"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {bookings.map((booking) => {
              const price = getServicePrice(booking.serviceId);
              const isCancelled = booking.status === 'cancelled';
              
              return (
                <div
                  key={booking.id}
                  id={`reservation-card-${booking.id}`}
                  className={`rounded-none border bg-white p-5 sm:p-6 shadow-none flex flex-col md:flex-row justify-between gap-6 transition-all ${
                    isCancelled 
                      ? 'border-stone-borders bg-stone-sand select-none opacity-60' 
                      : 'border-stone-borders hover:border-stone-charcoal'
                  }`}
                >
                  {/* Left info column */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`border rounded-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
                        isCancelled
                          ? 'bg-stone-sand text-stone-400 border-stone-borders'
                          : 'bg-[#FDFCF8] text-[#867768] border-primary'
                      }`}>
                        {isCancelled ? 'Cancelado' : 'Confirmado'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-semibold text-stone-charcoal">
                        {booking.serviceName}
                      </h4>
                      <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5 flex-wrap font-light">
                        <span className="font-medium text-stone-700">{booking.userName}</span>
                        <span>•</span>
                        <span>{booking.userEmail}</span>
                        <span>•</span>
                        <span>{booking.userPhone}</span>
                      </p>
                    </div>

                    {/* Comments block */}
                    {booking.comments && (
                      <div className="rounded-none bg-stone-sand p-2.5 border border-stone-borders text-xs text-stone-500 max-w-xl">
                        <strong className="text-[9px] font-bold text-stone-600 block uppercase tracking-wider mb-1">Notas del paciente:</strong>
                        <span className="italic font-light">"{booking.comments}"</span>
                      </div>
                    )}
                  </div>

                  {/* Right schedule column */}
                  <div className="flex flex-col justify-between items-start md:items-end gap-4 shrink-0 border-t md:border-t-0 md:border-l border-stone-borders pt-4 md:pt-0 md:pl-6 min-w-[210px]">
                    <div className="space-y-1.5 text-left md:text-right">
                      <span className="text-[9px] text-[#867768] uppercase tracking-widest block font-bold">FECHA ASIGNADA</span>
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium md:justify-end">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDateLabel(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#867768] font-bold font-mono md:justify-end">
                        <Clock className="h-4 w-4 text-[#867768]" />
                        <span>{booking.time} hs</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-stone-charcoal md:text-right pt-2 border-t border-stone-borders/60 mt-1.5">
                        Valor: {price && price > 0 ? `$${price.toLocaleString('es-AR')} ARS` : 'A consultar'}
                      </div>
                    </div>

                    {/* Actions button */}
                    {deleteConfirmId === booking.id ? (
                      <div className="flex flex-col gap-2 w-full max-w-[210px]">
                        <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider text-left md:text-right">
                          ¿Confirmas eliminar?
                        </span>
                        <div className="flex gap-2 w-full justify-start md:justify-end">
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="flex-1 md:flex-none rounded-none border border-[#e5e1d8] bg-white hover:bg-red-50 text-black hover:text-red-700 hover:border-red-300 font-bold text-[9px] uppercase tracking-wider px-3.5 py-2 cursor-pointer transition-colors"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 md:flex-none rounded-none border border-stone-borders bg-white hover:bg-stone-sand text-stone-600 font-bold text-[9px] uppercase tracking-wider px-3.5 py-2 cursor-pointer transition-colors"
                          >
                            Volver
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(booking.id)}
                        className="flex items-center gap-1.5 rounded-none border border-stone-250 bg-stone-100/60 hover:bg-red-50 hover:border-red-300 hover:text-red-700 px-3.5 py-2 text-[10px] uppercase font-bold tracking-wider text-stone-600 transition-colors cursor-pointer self-stretch md:self-auto text-center justify-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar Turno
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
}
