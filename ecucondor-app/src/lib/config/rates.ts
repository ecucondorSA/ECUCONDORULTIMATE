// Exchange rate configuration
export const RATE_CONFIG = {
  // Update intervals (milliseconds)
  UPDATE_INTERVAL: 30000,        // 30 seconds
  HEARTBEAT_INTERVAL: 15000,     // 15 seconds  
  CACHE_TTL: 30000,             // 30 seconds
  
  // Rate limits
  RATE_LIMIT_REQUESTS: 100,      // requests per window
  RATE_LIMIT_WINDOW: 60000,      // 1 minute
  
  // Business logic
  ADJUSTMENTS: {
    'USD-ARS': {
      sell: -20,      // Ecucondor sells USD: binance - 20
      buy: 50,        // Ecucondor buys USD: binance + 50
      commission_sell: 0.03,  // 3% commission on USD->ARS
      commission_buy: 0       // 0% commission on ARS->USD
    },
    'USD-BRL': {
      sell: -0.05,
      buy: 0.10,
      commission_sell: 0.02,  // 2% commission
      commission_buy: 0
    },
    'USD-ECU': {
      sell: 0,        // Ecuador uses USD officially
      buy: 0,
      commission_sell: 0.01,  // 1% commission
      commission_buy: 0
    }
  },
  
  // Binance symbols mapping
  BINANCE_SYMBOLS: {
    'USD-ARS': 'USDTARS',
    'USD-BRL': 'USDTBRL'
    // USD-ECU is fixed at 1.00
  },
  
  // Supported currency pairs
  SUPPORTED_PAIRS: [
    'USD-ARS', 'USD-BRL', 'USD-ECU',
    'ARS-BRL', // Calculated cross rate
    // Add more as needed
  ],
  
  // Default values
  DEFAULTS: {
    USD_ECU_RATE: 1.00,  // Ecuador uses USD
    MAX_TRANSACTION_AMOUNT: 1000000,
    MIN_TRANSACTION_AMOUNT: 1
  }
} as const

// API endpoints configuration
export const API_ENDPOINTS = {
  RATES: '/api/rates',
  RATES_PAIR: (pair: string) => `/api/rates/${pair}`,
  RATES_BUY: (pair: string) => `/api/rates/${pair}/buy`,
  RATES_SELL: (pair: string) => `/api/rates/${pair}/sell`,
  RATES_STREAM: '/api/rates/stream',
  RATES_PAIR_STREAM: (pair: string) => `/api/rates/${pair}/stream`,
  HEALTH: '/api/health'
} as const

// Error messages
export const ERROR_MESSAGES = {
  PAIR_NOT_FOUND: 'Exchange rate pair not found',
  INVALID_AMOUNT: 'Invalid amount provided',
  AMOUNT_TOO_LARGE: 'Amount exceeds maximum limit',
  AMOUNT_TOO_SMALL: 'Amount below minimum limit',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  SERVICE_UNAVAILABLE: 'Exchange rate service temporarily unavailable',
  BINANCE_ERROR: 'Unable to fetch rates from data source',
  CALCULATION_ERROR: 'Error calculating exchange rate'
} as const

// Currency information
export const CURRENCY_INFO = {
  USD: {
    name: 'US Dollar',
    symbol: '$',
    code: 'USD',
    decimal_places: 2,
    countries: ['United States', 'Ecuador']
  },
  ARS: {
    name: 'Argentine Peso',
    symbol: '$',
    code: 'ARS',
    decimal_places: 2,
    countries: ['Argentina']
  },
  BRL: {
    name: 'Brazilian Real',
    symbol: 'R$',
    code: 'BRL',
    decimal_places: 2,
    countries: ['Brazil']
  },
  ECU: {
    name: 'Ecuadorian Dollar',
    symbol: '$',
    code: 'ECU',
    decimal_places: 2,
    countries: ['Ecuador'],
    note: 'Ecuador officially uses USD'
  }
} as const