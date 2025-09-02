export interface SEOPageData {
  title: string;
  description: string;
  keywords: string[];
  structuredData?: Record<string, unknown>;
}

export const seoData = {
  home: {
    title: 'EcuCondor - Intercambio de Divisas | Tu aliado financiero',
    description: 'Plataforma FinTech líder para intercambio seguro de divisas entre USD, ARS y BRL. Tasas competitivas, transacciones rápidas y confianza garantizada en Ecuador, Argentina y Brasil.',
    keywords: [
      'intercambio divisas',
      'cambio moneda',
      'USD ARS BRL',
      'fintech Ecuador',
      'transferencias internacionales',
      'casa de cambio online',
      'ecucondor',
      'tasas de cambio',
      'divisas tiempo real'
    ]
  },
  calculator: {
    title: 'Calculadora de Divisas - Cotizaciones en Tiempo Real',
    description: 'Calcula el tipo de cambio entre USD, ARS y BRL con tasas actualizadas al instante. Simulador de transacciones con comisiones transparentes.',
    keywords: [
      'calculadora divisas',
      'tipo de cambio',
      'cotización tiempo real',
      'simulador cambio',
      'USD ARS BRL calculadora'
    ]
  },
  login: {
    title: 'Iniciar Sesión - Accede a tu Cuenta EcuCondor',
    description: 'Accede a tu cuenta EcuCondor para gestionar tus transacciones de divisas, ver historial y realizar intercambios seguros.',
    keywords: [
      'login ecucondor',
      'iniciar sesión',
      'cuenta usuario',
      'acceso plataforma'
    ]
  },
  register: {
    title: 'Crear Cuenta - Únete a EcuCondor',
    description: 'Crea tu cuenta gratuita en EcuCondor y comienza a realizar intercambios de divisas seguros entre USD, ARS y BRL.',
    keywords: [
      'crear cuenta ecucondor',
      'registro usuario',
      'nueva cuenta',
      'unirse ecucondor'
    ]
  },
  dashboard: {
    title: 'Panel de Control - Gestiona tus Transacciones',
    description: 'Panel de control personalizado para gestionar tus transacciones, ver historial y monitorear tasas de cambio favoritas.',
    keywords: [
      'panel control',
      'dashboard usuario',
      'gestión transacciones',
      'historial cambios'
    ]
  }
} as const;

// Structured data específico para servicios financieros
export const financialServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'EcuCondor',
  description: 'Plataforma FinTech para intercambio de divisas USD, ARS, BRL',
  url: 'https://ecucondor.com',
  logo: 'https://ecucondor.com/logo.png',
  serviceType: [
    'Currency Exchange',
    'Money Transfer', 
    'Foreign Exchange',
    'Financial Technology'
  ],
  areaServed: [
    {
      '@type': 'Country',
      name: 'Ecuador',
      identifier: 'EC'
    },
    {
      '@type': 'Country', 
      name: 'Argentina',
      identifier: 'AR'
    },
    {
      '@type': 'Country',
      name: 'Brasil', 
      identifier: 'BR'
    }
  ],
  currenciesAccepted: ['USD', 'ARS', 'BRL'],
  paymentAccepted: [
    'Bank Transfer',
    'Wire Transfer',
    'Digital Wallet'
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Cambio de Divisas',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Intercambio USD/ARS',
        description: 'Cambio de dólares americanos a pesos argentinos',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Intercambio USD/BRL',
        description: 'Cambio de dólares americanos a reales brasileños',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Intercambio BRL/ARS',
        description: 'Cambio de reales brasileños a pesos argentinos',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock'
      }
    ]
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '247',
    bestRating: '5',
    worstRating: '1'
  },
  review: [
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'María González'
      },
      reviewBody: 'Excelente servicio, tasas competitivas y transferencias muy rápidas.'
    },
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'Carlos Rodriguez'
      },
      reviewBody: 'La mejor plataforma para cambio de divisas. Muy confiable y segura.'
    }
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+5491166599559',
    email: 'Ecucondor@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'Portuguese'],
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
      ],
      opens: '09:00',
      closes: '18:00'
    }
  }
};

// FAQ Schema para la página principal
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el intercambio de divisas en EcuCondor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EcuCondor permite intercambiar USD, ARS y BRL de forma segura. Simplemente selecciona las monedas, ingresa el monto y confirma la transacción con nuestras tasas en tiempo real.'
      }
    },
    {
      '@type': 'Question', 
      name: '¿Cuáles son las comisiones por transacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nuestras comisiones son transparentes y competitivas. Varían según el monto y tipo de transacción, siempre mostradas antes de confirmar el intercambio.'
      }
    },
    {
      '@type': 'Question',
      name: '¿Es seguro usar EcuCondor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, utilizamos tecnología de encriptación bancaria, cumplimos con regulaciones financieras internacionales y tus fondos están protegidos durante todo el proceso.'
      }
    },
    {
      '@type': 'Question',
      name: '¿En qué países opera EcuCondor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Operamos principalmente en Ecuador, Argentina y Brasil, facilitando el intercambio de sus monedas locales con el dólar americano.'
      }
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo demoran las transferencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las transferencias suelen procesarse en minutos para monederos digitales y de 1-3 días hábiles para transferencias bancarias, dependiendo del destino.'
      }
    }
  ]
};

// Breadcrumb schema para páginas internas
export const generateBreadcrumbSchema = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com';
  
  const breadcrumbItems = [
    { name: 'Inicio', url: baseUrl }
  ];

  if (path === '/calculator') {
    breadcrumbItems.push({ name: 'Calculadora', url: `${baseUrl}/calculator` });
  } else if (path === '/login') {
    breadcrumbItems.push({ name: 'Iniciar Sesión', url: `${baseUrl}/login` });
  } else if (path === '/register') {
    breadcrumbItems.push({ name: 'Crear Cuenta', url: `${baseUrl}/register` });
  } else if (path === '/dashboard') {
    breadcrumbItems.push({ name: 'Panel de Control', url: `${baseUrl}/dashboard` });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};