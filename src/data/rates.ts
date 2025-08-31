export interface FinancialRate {
  id: string;
  name: string;
  rate: number;
  type: 'deposit' | 'credit' | 'investment';
  minAmount?: number;
  maxAmount?: number;
  term?: string;
  description?: string;
}

export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  features: string[];
  requirements: string[];
  documents: string[];
}

export const depositRates: FinancialRate[] = [
  {
    id: 'cuenta-ahorro',
    name: 'Cuenta de Ahorro',
    rate: 4.50,
    type: 'deposit',
    minAmount: 100,
    description: 'Cuenta de ahorro con acceso inmediato a tu dinero'
  },
  {
    id: 'cdt-30-dias',
    name: 'CDT 30 días',
    rate: 6.25,
    type: 'deposit',
    minAmount: 1000,
    term: '30 días',
    description: 'Certificado de Depósito a Término por 30 días'
  },
  {
    id: 'cdt-90-dias',
    name: 'CDT 90 días',
    rate: 7.50,
    type: 'deposit',
    minAmount: 1000,
    term: '90 días',
    description: 'Certificado de Depósito a Término por 90 días'
  },
  {
    id: 'cdt-180-dias',
    name: 'CDT 180 días',
    rate: 8.75,
    type: 'deposit',
    minAmount: 1000,
    term: '180 días',
    description: 'Certificado de Depósito a Término por 180 días'
  },
  {
    id: 'cdt-365-dias',
    name: 'CDT 365 días',
    rate: 9.50,
    type: 'deposit',
    minAmount: 1000,
    term: '365 días',
    description: 'Certificado de Depósito a Término por 365 días'
  }
];

export const creditRates: FinancialRate[] = [
  {
    id: 'credito-consumo',
    name: 'Crédito de Consumo',
    rate: 18.50,
    type: 'credit',
    minAmount: 5000,
    maxAmount: 50000,
    term: 'Hasta 60 meses',
    description: 'Préstamo personal para necesidades inmediatas'
  },
  {
    id: 'credito-hipotecario',
    name: 'Crédito Hipotecario',
    rate: 12.75,
    type: 'credit',
    minAmount: 25000,
    maxAmount: 200000,
    term: 'Hasta 20 años',
    description: 'Financiamiento para la compra de vivienda'
  },
  {
    id: 'credito-vehicular',
    name: 'Crédito Vehicular',
    rate: 15.25,
    type: 'credit',
    minAmount: 10000,
    maxAmount: 100000,
    term: 'Hasta 84 meses',
    description: 'Financiamiento para la compra de vehículos'
  },
  {
    id: 'credito-empresarial',
    name: 'Crédito Empresarial',
    rate: 16.80,
    type: 'credit',
    minAmount: 50000,
    maxAmount: 500000,
    term: 'Hasta 10 años',
    description: 'Financiamiento para empresas y emprendimientos'
  }
];

export const investmentProducts: FinancialProduct[] = [
  {
    id: 'fondo-inversion',
    name: 'Fondo de Inversión Colectiva',
    description: 'Invierte en una cartera diversificada de instrumentos financieros',
    features: [
      'Diversificación automática',
      'Gestión profesional',
      'Liquidez diaria',
      'Rendimientos históricos superiores al mercado'
    ],
    requirements: [
      'Monto mínimo: $5,000',
      'Edad mínima: 18 años',
      'Documentos de identidad vigentes'
    ],
    documents: [
      'Cédula de identidad',
      'Comprobante de ingresos',
      'Declaración de renta (si aplica)'
    ]
  },
  {
    id: 'seguro-vida',
    name: 'Seguro de Vida',
    description: 'Protege el futuro financiero de tu familia',
    features: [
      'Cobertura por muerte natural y accidental',
      'Indemnización por invalidez total',
      'Beneficios adicionales por hospitalización',
      'Flexibilidad en el pago de primas'
    ],
    requirements: [
      'Edad: 18-65 años',
      'Estado de salud favorable',
      'Sin antecedentes médicos graves'
    ],
    documents: [
      'Cédula de identidad',
      'Examen médico completo',
      'Historial médico'
    ]
  }
];

export const companyInfo = {
  name: 'EcuCondor',
  slogan: 'Tu aliado financiero de confianza',
  description: 'Somos una institución financiera comprometida con el desarrollo económico de Ecuador, ofreciendo productos y servicios de calidad que se adaptan a las necesidades de nuestros clientes.',
  contact: {
    phone: '+593 2 234 5678',
    email: 'info@ecucondor.com',
    address: 'Av. Amazonas N45-123, Quito, Ecuador',
    hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM'
  },
  socialMedia: {
    facebook: 'https://facebook.com/ecucondor',
    twitter: 'https://twitter.com/ecucondor',
    instagram: 'https://instagram.com/ecucondor',
    linkedin: 'https://linkedin.com/company/ecucondor'
  }
};
