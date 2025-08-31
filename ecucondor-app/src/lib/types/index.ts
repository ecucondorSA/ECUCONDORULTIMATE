// Currency types
export type Currency = 'USD' | 'ARS' | 'BRL' | 'ECU'

// Exchange rate types
export interface ExchangeRate {
  id: string
  pair: string // 'USD-ARS', 'USD-BRL', etc.
  base_currency: Currency
  target_currency: Currency
  binance_rate?: number // Rate from Binance (null for ECU)
  sell_rate: number // Ecucondor sells base currency to client
  buy_rate: number // Ecucondor buys base currency from client
  spread: number // buy_rate - sell_rate
  commission_rate: number // Commission percentage (0.03 for USD->ARS, 0 for ARS->USD)
  last_updated: string
  source: 'binance' | 'fixed' | 'calculated'
}

// Binance scraping types
export interface BinancePrice {
  symbol: string // 'USDTARS', 'USDTBRL'
  price: number // Average price
  timestamp: string
}

// Rate calculation config
export interface RateConfig {
  pair: string
  source_symbol?: string // Binance symbol
  sell_adjustment: number // -20 for USD-ARS
  buy_adjustment: number // +50 for USD-ARS
  commission_sell: number // 0.03 for USD->ARS
  commission_buy: number // 0 for ARS->USD
}

// Transaction types
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed'

export interface Transaction {
  id: string
  user_id: string
  type: 'buy' | 'sell'
  base_currency: Currency
  target_currency: Currency
  base_amount: number
  target_amount: number
  exchange_rate: number
  fee: number
  status: TransactionStatus
  created_at: string
  updated_at: string
  completed_at?: string
}

// User profile types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  country?: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

// Dashboard types
export interface DashboardData {
  user: UserProfile
  recentTransactions: Transaction[]
  favoriteRates: ExchangeRate[]
  totalTransactions: number
  totalVolume: number
}