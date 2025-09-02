/**
 * Financial rates and company information for EcuCondor
 */

export interface FinancialRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  term?: string;
}

export const companyInfo = {
  name: "EcuCondor",
  slogan: "Tu aliado en cambio de divisas",
  description: "Confianza y velocidad en cada transacción",
  contact: {
    phone: "+593 99 123 4567",
    email: "info@ecucondor.com",
    address: "Quito, Ecuador",
    hours: "Lunes a Viernes: 9:00 AM - 6:00 PM"
  },
  socialMedia: {
    facebook: "https://facebook.com/ecucondor",
    twitter: "https://twitter.com/ecucondor",
    instagram: "https://instagram.com/ecucondor"
  }
};

export const depositRates: FinancialRate[] = [
  {
    id: "ahorro-basico",
    name: "Cuenta de Ahorro Básica",
    rate: 2.5,
    description: "Cuenta de ahorro con rentabilidad competitiva",
    minAmount: 100,
    maxAmount: 50000,
    term: "Sin plazo fijo"
  },
  {
    id: "ahorro-premium",
    name: "Cuenta de Ahorro Premium",
    rate: 3.2,
    description: "Mayor rentabilidad para montos altos",
    minAmount: 5000,
    maxAmount: 200000,
    term: "Sin plazo fijo"
  },
  {
    id: "deposito-30",
    name: "Depósito a Plazo 30 días",
    rate: 4.1,
    description: "Inversión segura a corto plazo",
    minAmount: 1000,
    maxAmount: 100000,
    term: "30 días"
  },
  {
    id: "deposito-90",
    name: "Depósito a Plazo 90 días",
    rate: 5.5,
    description: "Mayor rentabilidad para inversión trimestral",
    minAmount: 2000,
    maxAmount: 150000,
    term: "90 días"
  },
  {
    id: "deposito-180",
    name: "Depósito a Plazo 180 días",
    rate: 6.8,
    description: "Excelente rendimiento semestral",
    minAmount: 5000,
    maxAmount: 250000,
    term: "180 días"
  },
  {
    id: "deposito-360",
    name: "Depósito a Plazo 360 días",
    rate: 8.2,
    description: "Máxima rentabilidad anual garantizada",
    minAmount: 10000,
    maxAmount: 500000,
    term: "360 días"
  }
];

export const creditRates: FinancialRate[] = [
  {
    id: "credito-personal",
    name: "Crédito Personal",
    rate: 12.5,
    description: "Para gastos personales y emergencias",
    minAmount: 500,
    maxAmount: 25000,
    term: "12-60 meses"
  },
  {
    id: "credito-vehiculo",
    name: "Crédito Vehicular",
    rate: 10.8,
    description: "Financia tu auto nuevo o usado",
    minAmount: 5000,
    maxAmount: 80000,
    term: "12-72 meses"
  },
  {
    id: "credito-hipotecario",
    name: "Crédito Hipotecario",
    rate: 8.9,
    description: "Compra tu casa propia",
    minAmount: 20000,
    maxAmount: 300000,
    term: "5-25 años"
  },
  {
    id: "credito-comercial",
    name: "Crédito Comercial",
    rate: 14.2,
    description: "Para tu negocio y emprendimiento",
    minAmount: 1000,
    maxAmount: 100000,
    term: "6-48 meses"
  },
  {
    id: "microCredito",
    name: "Microcrédito",
    rate: 18.5,
    description: "Impulsa tu pequeño negocio",
    minAmount: 200,
    maxAmount: 5000,
    term: "3-24 meses"
  }
];

export const investmentProducts = [
  {
    id: "fondo-conservador",
    name: "Fondo de Inversión Conservador",
    description: "Inversión segura con riesgo bajo y rentabilidad estable para inversionistas conservadores.",
    features: [
      "Riesgo bajo",
      "Rentabilidad promedio 6-8% anual",
      "Liquidez en 48 horas",
      "Diversificación automática",
      "Sin comisiones de entrada"
    ],
    requirements: [
      "Inversión mínima: USD 1,000",
      "Perfil de riesgo conservador",
      "Documentos de identidad",
      "Comprobante de ingresos"
    ],
    documents: [
      "Cédula de identidad vigente",
      "Comprobante de ingresos último mes",
      "Referencias comerciales",
      "Autorización de débito automático"
    ]
  },
  {
    id: "fondo-moderado",
    name: "Fondo de Inversión Moderado",
    description: "Balance entre riesgo y rentabilidad para inversionistas con perfil moderado que buscan crecimiento.",
    features: [
      "Riesgo moderado",
      "Rentabilidad promedio 8-12% anual",
      "Liquidez en 72 horas",
      "Gestión profesional",
      "Rebalanceo automático"
    ],
    requirements: [
      "Inversión mínima: USD 2,500",
      "Perfil de riesgo moderado",
      "Experiencia en inversiones",
      "Capacidad financiera comprobada"
    ],
    documents: [
      "Documentos de identidad completos",
      "Estados financieros personales",
      "Declaración juramentada de ingresos",
      "Test de perfil de riesgo"
    ]
  },
  {
    id: "fondo-agresivo",
    name: "Fondo de Inversión Agresivo",
    description: "Para inversionistas experimentados que buscan máxima rentabilidad y pueden asumir mayor riesgo.",
    features: [
      "Riesgo alto",
      "Rentabilidad potencial 12-20% anual",
      "Liquidez en 5 días hábiles",
      "Inversión en mercados emergentes",
      "Gestión activa especializada"
    ],
    requirements: [
      "Inversión mínima: USD 5,000",
      "Perfil de riesgo agresivo",
      "Experiencia mínima 2 años",
      "Patrimonio líquido mínimo USD 50,000"
    ],
    documents: [
      "Documentación legal completa",
      "Estados financieros auditados",
      "Certificado de experiencia financiera",
      "Póliza de seguro recomendada"
    ]
  }
];