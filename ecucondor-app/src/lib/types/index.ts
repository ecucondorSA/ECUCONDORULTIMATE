// Currency types
export type Currency = 'USD' | 'ARS' | 'BRL' | 'ECU'

// Exchange rate types
export interface ExchangeRate {
  id: string
  base_currency: Currency
  target_currency: Currency
  rate: number
  buy_rate: number
  sell_rate: number
  last_updated: string
  created_at: string
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