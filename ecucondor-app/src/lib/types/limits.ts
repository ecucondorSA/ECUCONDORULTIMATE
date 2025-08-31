// Transaction limits and validation types

export interface TransactionLimits {
  min_transaction_usd: number
  max_transaction_usd: number
  max_monthly_usd: number
  max_daily_transactions: number
}

export interface UserTransactionSummary {
  user_id: string
  current_month_volume_usd: number
  current_day_volume_usd: number
  current_day_transaction_count: number
  last_transaction_date?: string
}

export interface PriceLock {
  id: string
  user_id: string
  pair: string
  rate: number
  amount_usd: number
  locked_at: string
  expires_at: string
  used: boolean
  transaction_type: 'buy' | 'sell'
}

export interface TransactionValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
  limits_info: {
    remaining_monthly_usd: number
    remaining_daily_usd: number
    remaining_daily_transactions: number
  }
}

// Default limits configuration
export const DEFAULT_LIMITS: TransactionLimits = {
  min_transaction_usd: 5,
  max_transaction_usd: 2000,
  max_monthly_usd: 10000,
  max_daily_transactions: 20 // Reasonable daily limit
}

export const PRICE_LOCK_DURATION_MINUTES = 15 // Price locked for 15 minutes