/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Review, TeacherInfo, CarouselSlide, QuickAccessButton } from './types';

export const SERVICES: Service[] = [
  {
    id: 'shiatsu-tradicional',
    name: 'Sesión de Masaje Shiatsu Zen',
    description: 'Terapia japonesa que utiliza la presión precisa de los pulgares, manos y codos sobre los puntos de acupuntura. Estimula los mecanismos de autocuración innatos del organismo para liberar bloqueos físicos y de tensión acumulada.',
    category: 'shiatsu',
    duration: 60,
    price: 40000,
    intensity: 'Restaurativa',
    benefits: [
      'Fortalece el sistema inmunológico y equilibra el sistema nervioso',
      'Estimula la circulación energética de todo el cuerpo',
      'Ayuda a corregir contracturas posturales y alivia dolores de cabeza'
    ]
  },
  {
    id: 'shiatsu-hot-stones',
    name: 'Sesión de Reiki',
    description: 'Reiki es una terapia energética japonesa que utiliza la imposición de manos para canalizar la energía vital universal con el fin de promover bienestar y equilibrar cuerpo, mente y espíritu.',
    category: 'reiki',
    duration: 60,
    price: 40000,
    intensity: 'Suave',
    benefits: [
      'Reduce notablemente el insomnio y promueve el descanso continuo',
      'Proporciona una experiencia energética integral',
      'Equilibrio y relajación profunda'
    ]
  },
  {
    id: 'service-1785349638895-99',
    name: 'Yoga - Presencial',
    description: 'Trabajamos el equilibrio entre la pausa y el movimiento. Exploramos la permanencia y la observación a través de la energía Yin. También damos lugar a la naturaleza de la energía Yang, con diferentes estilos dinámicos, método Antropotécnica y elementos de Vinyasa.',
    category: 'yoga',
    duration: 60,
    price: 0,
    priceYoga4: 30000,
    priceYoga8: 45000,
    priceYoga8to12: 45000,
    priceYoga12: 55000,
    priceYogaPaseLibre: 55000,
    intensity: 'Equilibrio',
    highlightNote: 'Práctica presencial • Cupos reducidos',
    benefits: [
      'Reduce notablemente el estrés y la tensión mental',
      'Mejora la flexibilidad corporal y el balance general',
      'Fomenta la autorregulación física y mental'
    ]
  },
  {
    id: 'service-1785431664739-34',
    name: 'Yoga - Online',
    description: 'Secuencias cortas para aquellas personas que necesitan poder sostener un período mas corto de práctica, desde la comodidad del lugar donde estén. Ponemos el foco en la movilidad y estiramientos activos/pasivos.',
    category: 'yoga',
    duration: 30,
    price: 0,
    priceYoga4: 22000,
    priceYoga8: 35000,
    priceYoga8to12: 35000,
    intensity: 'Equilibrio',
    highlightNote: 'Práctica online • Vía Zoom',
    benefits: [
      'Reduce notablemente el estrés y la tensión mental',
      'Mejora la flexibilidad corporal y el balance general',
      'Fomenta la autorregulación física y mental'
    ]
  }
];

export const TEACHERS: TeacherInfo[] = [
  {
    id: 'clara',
    name: 'María Clara Chiaravalli',
    role: 'Profesora de Yoga • Terapeuta Shiatsu • Maestra de Reiki',
    bio: `Nací en la ciudad de La Plata, Bs As, Argentina. Soy Diseñadora en Comunicación Visual e Ilustradora. Desde muy pequeña me acompañan los dibujos. Me siento muy afortunada de poder expresar a través de la ilustración.
En el arte como en las prácticas hacia el equilibrio psicofísico, me inspiran profundamente el sentido de transformación, la transmutación, la conexión energética. Soy terapeuta Shiatsu Zen y maestra de Reiki.

Mi camino en el Yoga comenzó en el año 2005 con la práctica regular de diversos estilos como Vinyasa Yoga, Yoga Integral, Ashtanga Vinyasa Yoga y Hatha Yoga. Brindo prácticas en mi ciudad natal desde el año 2018. La práctica que propongo tiene como finalidad la autorregulación y el equilibrio mente cuerpo espíritu; fomentar la escucha interna y el autoconocimiento.

Realicé el profesorado de Hatha Yoga, y luego la formación de Antropotécnica con Santiago Boumpadre, quien aportó a mis años de práctica un contenido profundo en el estudio mente cuerpo validado por la ciencia. Mis prácticas hoy tienen bases sólidas sobre este método. Junto a Santiago también realicé talleres y cursos en simultáneo a la formación: Om y Neuronciencia, Respiración y Emociones, Neurociencia de los Chakras y Neurociencia de la Meditación.

La práctica sostenida, el equilibrio del flujo energético, el movimiento, la respiración y la meditación como medicina para la vida moderna.`,
    specialty: 'Hatha Yoga, Vinyasa Flow, Yoga Integral, Terapia Shiatsu y Reiki',
    image: ''
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Sofía Martínez',
    text: 'La sesión de Shiatsu con María Clara fue reveladora. Llegué con contracturas crónicas en el cuello debido al estrés laboral y salí sintiéndome liviana, con una sensación de equilibrio y paz absoluta.',
    rating: 5,
    serviceName: 'Shiatsu Tradicional (Acupresión Japonesa)'
  },
  {
    id: 'r2',
    userName: 'Alejandro Rossi',
    text: 'He practicado Yoga en muchos lugares, pero la propuesta de María Clara es diferente. Logra un equilibrio increíble entre lo dinámico y la quietud física, y su respiración y meditación guiadas son medicina real.',
    rating: 5,
    serviceName: 'Vinyasa Flow & Estiramiento Zen'
  },
  {
    id: 'r3',
    userName: 'Mariela Fernández',
    text: 'El Ritual Zen guiado por María Clara es un viaje de autorregulación maravilloso. Combina estiramientos suaves y una profunda relajación que disuelve cualquier tensión del cuerpo. Increíble.',
    rating: 5,
    serviceName: 'Ritual Zen (Yin Yoga + Shiatsu Express)'
  }
];

export const FAQS = [
  {
    q: '¿Es necesario tener experiencia previa para participar en las clases de Yoga?',
    a: 'En absoluto. Las clases de Yoga están pensadas para dar la bienvenida tanto a personas que realizan su primer contacto con la práctica, como a practicantes que ya tienen un recorrido realizado. Todos los niveles son bienvenidos.'
  },
  {
    q: '¿Qué es el Shiatsu y en qué se diferencia de otros masajes?',
    a: 'El Shiatsu es una técnica de masaje japonesa basada en la medicina oriental. A diferencia de otros masajes, no usa aceites ni frotación. Utiliza la presión estática de los dedos y palmas sobre canales energéticos específicos para regular las funciones orgánicas y balancear los flujos del organismo.'
  },
  {
    q: '¿Qué indumentaria debo llevar para una sesión de Shiatsu?',
    a: 'Para un masaje Shiatsu se recomienda ropa cómoda y preferentemente de algodón; la digitopresión se realiza sobre las prendas de vestir. No se utilizan aceites.'
  },
  {
    q: '¿Puedo reprogramar mi turno?',
    a: 'Si. Podés reprogramar tu turno hasta 24 horas antes directamente a través de whatsapp, donde se te asignará un nuevo horario según disponibilidad.'
  }
];

export const HOLES_CALENDAR = [
  '14:30', '16:00', '17:30', '19:00'
];

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1200',
    title: 'Espacio de Práctica & Calidez',
    description: 'Un entorno sereno preparado especialmente para acompañar tu proceso de relajación y conexión corporal.'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1200',
    title: 'Shiatsu Zen & Masaje Japonés',
    description: 'Digitopresión sutil y estiramientos suaves destinados a restaurar el equilibrio de tu energía vital.'
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    title: 'Movimiento, Respiración & Quietud',
    description: 'Explorá herramientas de autorregulación física y mental para tu bienestar en la vida cotidiana.'
  }
];

export const DEFAULT_CAROUSEL_SLIDES_2: CarouselSlide[] = [
  {
    id: 'slide-2-1',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    title: 'Yoga, Armonía & Bienestar',
    description: 'Momentos compartidos en nuestras clases y talleres de autorregulación.'
  },
  {
    id: 'slide-2-2',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    title: 'Posturas & Respiración Guiada',
    description: 'Prácticas orientadas a profundizar en la flexibilidad, calma y conciencia corporal.'
  },
  {
    id: 'slide-2-3',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=1200',
    title: 'Encuentros Terapéuticos',
    description: 'Espacios de aprendizaje y profundización en el cuidado consciente.'
  }
];

export const DEFAULT_QUICK_ACCESS_BUTTONS: QuickAccessButton[] = [
  {
    id: 'btn-yoga',
    title: 'YOGA',
    subtitle: 'Prácticas & Horarios',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
    targetSection: '#yoga-explainer'
  },
  {
    id: 'btn-shiatsu',
    title: 'SHIATSU ZEN',
    subtitle: 'Masaje Japonés',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    targetSection: '#services-section'
  },
  {
    id: 'btn-reiki',
    title: 'REIKI',
    subtitle: 'Armonización Usui',
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e6005721?auto=format&fit=crop&q=80&w=800',
    targetSection: '#services-section'
  },
  {
    id: 'btn-talleres',
    title: 'TALLERES',
    subtitle: 'Encuentros & Retiros',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
    targetSection: '#horarios-section'
  },
  {
    id: 'btn-arte',
    title: 'ARTE',
    subtitle: 'Expresión Consciente',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    targetSection: '#contact-section'
  }
];

