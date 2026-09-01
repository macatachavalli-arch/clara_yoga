/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'yoga' | 'shiatsu' | 'combo' | 'reiki';
  duration: number; // in minutes
  price?: number | null;
  priceYoga4?: number | null; // Abono por 4 clases (mensual)
  priceYoga8?: number | null; // Abono por 8 clases (mensual)
  priceYoga8to12?: number | null; // Legacy / Fallback
  priceYoga12?: number | null; // Abono por 12 clases (mensual)
  priceYogaPaseLibre?: number | null; // Pase Libre (mensual)
  intensity?: 'Suave' | 'Moderada' | 'Intensa' | 'Restaurativa' | 'Equilibrio' | 'Sintonización Energética';
  benefits: string[];
  highlightNote?: string;
  backgroundImage?: string; // URL or base64 data for card background
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: 'yoga' | 'shiatsu' | 'combo' | 'reiki';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  userName: string;
  userEmail: string;
  userPhone: string;
  comments?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  userName: string;
  text: string;
  rating: number;
  serviceName: string;
}

export interface TeacherInfo {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialty: string;
  image: string;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or "all"
  reason?: string; // e.g., "Ocupado manual" or client name
}

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  description: string;
}

export interface QuickAccessButton {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  targetSection?: string;
}
