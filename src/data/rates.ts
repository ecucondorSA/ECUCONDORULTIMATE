export interface ExchangeRate {
  id: string;
  from: string;
  to: string;
  rate: number;
  lastUpdate: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  country: string;
  comment: string;
  initial: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const exchangeRates: ExchangeRate[] = [
  {
    id: 'usd-ars',
    from: 'USD',
    to: 'ARS',
    rate: 1341.72,
    lastUpdate: '31 de agosto a las 22:08'
  },
  {
    id: 'usd-brl',
    from: 'USD',
    to: 'BRL',
    rate: 5.46,
    lastUpdate: '31 de agosto a las 22:08'
  },
  {
    id: 'ars-brl',
    from: 'ARS',
    to: 'BRL',
    rate: 0.0041,
    lastUpdate: '31 de agosto a las 22:08'
  }
];

export const features: Feature[] = [
  {
    id: 'security',
    icon: '🔒',
    title: 'Máxima Seguridad',
    description: 'Protegemos tus transacciones con tecnología de punta.'
  },
  {
    id: 'speed',
    icon: '⚡',
    title: 'Rapidez Inigualable',
    description: 'Procesos optimizados para transacciones instantáneas.'
  },
  {
    id: 'rates',
    icon: '📈',
    title: 'Tasas Competitivas',
    description: 'Las mejores tasas del mercado, siempre actualizadas.'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 'maria',
    name: 'Maria G.',
    location: 'Buenos Aires',
    country: 'Argentina',
    comment: 'ECUCONDOR me ha simplificado la vida. Cambio divisas de forma rápida y segura, ¡y siempre con las mejores tasas!',
    initial: 'M'
  },
  {
    id: 'joao',
    name: 'João S.',
    location: 'São Paulo',
    country: 'Brasil',
    comment: 'Excelente serviço. Rápido, confiável e com um atendimento ao cliente impecável. Recomendo!',
    initial: 'J'
  },
  {
    id: 'carlos',
    name: 'Carlos M.',
    location: 'Cuenca',
    country: 'Ecuador',
    comment: 'Como extranjero, necesito un servicio de cambio de divisas confiable. ECUCONDOR cumple con creces.',
    initial: 'C'
  }
];

// Interfaces para productos financieros
export interface FinancialRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  term?: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  description: string;
  features: string[];
  requirements: string[];
  documents: string[];
}

// Datos de la empresa
export const companyInfo = {
  name: 'ECUCONDOR ULTIMATE',
  slogan: 'Tu Puente Financiero Global',
  description: 'La plataforma más segura para tus transacciones internacionales entre Argentina, Brasil y Ecuador',
  contact: {
    phone: '+54 (911) 6659-9559',
    email: 'Ecucondor@gmail.com',
    address: 'Av. Principal 123, Cuenca, Ecuador',
    hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM'
  },
  socialMedia: {
    facebook: 'https://facebook.com/ecucondor',
    twitter: 'https://twitter.com/ecucondor',
    instagram: 'https://instagram.com/ecucondor'
  }
};

// Tasas de depósito
export const depositRates: FinancialRate[] = [
  {
    id: 'cuenta-ahorro',
    name: 'Cuenta de Ahorro',
    rate: 2.5,
    description: 'Ahorra con seguridad y obtén rendimientos atractivos',
    minAmount: 100,
    maxAmount: 50000,
    term: 'Sin plazo fijo'
  },
  {
    id: 'cd-30-dias',
    name: 'Certificado de Depósito 30 días',
    rate: 3.2,
    description: 'Inversión segura a corto plazo',
    minAmount: 500,
    maxAmount: 100000,
    term: '30 días'
  },
  {
    id: 'cd-90-dias',
    name: 'Certificado de Depósito 90 días',
    rate: 4.1,
    description: 'Mayor rentabilidad con plazo medio',
    minAmount: 1000,
    maxAmount: 200000,
    term: '90 días'
  },
  {
    id: 'cd-180-dias',
    name: 'Certificado de Depósito 180 días',
    rate: 5.3,
    description: 'Excelente opción para inversión a mediano plazo',
    minAmount: 2000,
    maxAmount: 500000,
    term: '180 días'
  },
  {
    id: 'cd-365-dias',
    name: 'Certificado de Depósito 365 días',
    rate: 6.8,
    description: 'Máxima rentabilidad para inversión a largo plazo',
    minAmount: 5000,
    maxAmount: 1000000,
    term: '365 días'
  }
];

// Tasas de crédito
export const creditRates: FinancialRate[] = [
  {
    id: 'credito-personal',
    name: 'Crédito Personal',
    rate: 12.5,
    description: 'Para tus necesidades personales y proyectos',
    minAmount: 1000,
    maxAmount: 25000,
    term: 'Hasta 36 meses'
  },
  {
    id: 'credito-vehiculo',
    name: 'Crédito Vehículo',
    rate: 9.8,
    description: 'Financia tu vehículo nuevo o usado',
    minAmount: 5000,
    maxAmount: 80000,
    term: 'Hasta 60 meses'
  },
  {
    id: 'credito-vivienda',
    name: 'Crédito Vivienda',
    rate: 7.2,
    description: 'Haz realidad el sueño de tu casa propia',
    minAmount: 15000,
    maxAmount: 200000,
    term: 'Hasta 240 meses'
  },
  {
    id: 'credito-empresarial',
    name: 'Crédito Empresarial',
    rate: 10.5,
    description: 'Impulsa el crecimiento de tu empresa',
    minAmount: 10000,
    maxAmount: 500000,
    term: 'Hasta 120 meses'
  },
  {
    id: 'credito-educativo',
    name: 'Crédito Educativo',
    rate: 8.9,
    description: 'Invierte en tu futuro y el de tu familia',
    minAmount: 2000,
    maxAmount: 50000,
    term: 'Hasta 84 meses'
  }
];

// Productos de inversión
export const investmentProducts: InvestmentProduct[] = [
  {
    id: 'fondo-mutuo',
    name: 'Fondo Mutuo Conservador',
    description: 'Inversión de bajo riesgo con rendimientos estables y predecibles',
    features: [
      'Diversificación automática',
      'Liquidez diaria',
      'Gestión profesional',
      'Riesgo controlado'
    ],
    requirements: [
      'Monto mínimo: $1,000',
      'Documento de identidad',
      'Comprobante de ingresos',
      'Firma de contrato'
    ],
    documents: [
      'Cédula de identidad',
      'Comprobante de ingresos',
      'Referencias bancarias',
      'Formulario de solicitud'
    ]
  },
  {
    id: 'fondo-agresivo',
    name: 'Fondo Mutuo Agresivo',
    description: 'Para inversionistas con mayor tolerancia al riesgo y búsqueda de mayores rendimientos',
    features: [
      'Alto potencial de crecimiento',
      'Diversificación internacional',
      'Gestión activa',
      'Acceso a mercados globales'
    ],
    requirements: [
      'Monto mínimo: $5,000',
      'Perfil de riesgo alto',
      'Experiencia en inversiones',
      'Patrimonio mínimo: $50,000'
    ],
    documents: [
      'Cédula de identidad',
      'Comprobante de patrimonio',
      'Declaración de renta',
      'Formulario de perfil de riesgo',
      'Contrato de inversión'
    ]
  }
];
