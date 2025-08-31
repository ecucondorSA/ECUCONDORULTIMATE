import { createClient } from '@/lib/supabase/server'
import { 
  TransactionLimits, 
  UserTransactionSummary, 
  TransactionValidation,
  DEFAULT_LIMITS 
} from '@/lib/types/limits'

export class TransactionLimitsService {
  private static instance: TransactionLimitsService
  private limits: TransactionLimits = DEFAULT_LIMITS

  static getInstance(): TransactionLimitsService {
    if (!TransactionLimitsService.instance) {
      TransactionLimitsService.instance = new TransactionLimitsService()
    }
    return TransactionLimitsService.instance
  }

  /**
   * Get user's current transaction summary
   */
  async getUserTransactionSummary(userId: string): Promise<UserTransactionSummary> {
    const supabase = await createClient()
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    try {
      // Get monthly volume
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('transactions')
        .select('base_amount, target_amount, base_currency')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString())
      
      if (monthlyError) throw monthlyError

      // Get daily volume and count
      const { data: dailyData, error: dailyError } = await supabase
        .from('transactions')
        .select('base_amount, target_amount, base_currency, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startOfDay.toISOString())
      
      if (dailyError) throw dailyError

      // Calculate volumes in USD
      const monthlyVolumeUSD = this.calculateUSDVolume(monthlyData || [])
      const dailyVolumeUSD = this.calculateUSDVolume(dailyData || [])
      
      return {
        user_id: userId,
        current_month_volume_usd: monthlyVolumeUSD,
        current_day_volume_usd: dailyVolumeUSD,
        current_day_transaction_count: dailyData?.length || 0,
        last_transaction_date: dailyData?.[0]?.created_at || undefined
      }
    } catch (error) {
      console.error('Error getting user transaction summary:', error)
      // Return safe defaults on error
      return {
        user_id: userId,
        current_month_volume_usd: 0,
        current_day_volume_usd: 0,
        current_day_transaction_count: 0
      }
    }
  }

  /**
   * Validate if transaction is within limits
   */
  async validateTransaction(
    userId: string,
    amountUSD: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactionType: 'buy' | 'sell'
  ): Promise<TransactionValidation> {
    const summary = await this.getUserTransactionSummary(userId)
    const errors: string[] = []
    const warnings: string[] = []

    // Check minimum amount
    if (amountUSD < this.limits.min_transaction_usd) {
      errors.push(`Monto mínimo: $${this.limits.min_transaction_usd} USD`)
    }

    // Check maximum per transaction
    if (amountUSD > this.limits.max_transaction_usd) {
      errors.push(`Monto máximo por transacción: $${this.limits.max_transaction_usd} USD`)
    }

    // Check monthly limit
    const newMonthlyTotal = summary.current_month_volume_usd + amountUSD
    if (newMonthlyTotal > this.limits.max_monthly_usd) {
      const remaining = this.limits.max_monthly_usd - summary.current_month_volume_usd
      errors.push(`Límite mensual excedido. Disponible: $${remaining.toFixed(2)} USD`)
    }

    // Check daily transaction count
    if (summary.current_day_transaction_count >= this.limits.max_daily_transactions) {
      errors.push(`Límite diario de transacciones alcanzado (${this.limits.max_daily_transactions})`)
    }

    // Warnings
    const monthlyUsagePercent = (summary.current_month_volume_usd / this.limits.max_monthly_usd) * 100
    if (monthlyUsagePercent > 80) {
      warnings.push(`Has usado ${monthlyUsagePercent.toFixed(1)}% de tu límite mensual`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      limits_info: {
        remaining_monthly_usd: Math.max(0, this.limits.max_monthly_usd - summary.current_month_volume_usd),
        remaining_daily_usd: Math.max(0, this.limits.max_transaction_usd), // Per transaction limit
        remaining_daily_transactions: Math.max(0, this.limits.max_daily_transactions - summary.current_day_transaction_count)
      }
    }
  }

  /**
   * Calculate total USD volume from transactions
   */
  private calculateUSDVolume(transactions: {
    base_amount: number
    target_amount: number
    base_currency: string
    target_currency?: string
  }[]): number {
    return transactions.reduce((total, transaction) => {
      if (transaction.base_currency === 'USD') {
        return total + transaction.base_amount
      } else if (transaction.target_currency === 'USD') {
        return total + transaction.target_amount
      } else {
        // For non-USD pairs, estimate based on current rates
        // This is a simplified approach - in production you'd want more precision
        if (transaction.base_currency === 'ARS') {
          return total + (transaction.base_amount / 1400) // Rough ARS to USD
        } else if (transaction.base_currency === 'BRL') {
          return total + (transaction.base_amount / 5.5) // Rough BRL to USD
        }
        return total
      }
    }, 0)
  }

  /**
   * Get current limits configuration
   */
  getLimits(): TransactionLimits {
    return { ...this.limits }
  }

  /**
   * Update limits (for admin use)
   */
  updateLimits(newLimits: Partial<TransactionLimits>): void {
    this.limits = { ...this.limits, ...newLimits }
  }

  /**
   * Check if user can make a transaction of specific amount
   */
  async canMakeTransaction(
    userId: string, 
    amountUSD: number
  ): Promise<{ canProceed: boolean; reason?: string; remainingAmount?: number }> {
    const validation = await this.validateTransaction(userId, amountUSD, 'sell')
    
    if (validation.valid) {
      return { canProceed: true }
    }

    const firstError = validation.errors[0]
    
    // If it's a monthly limit issue, calculate remaining
    if (firstError.includes('mensual')) {
      return {
        canProceed: false,
        reason: firstError,
        remainingAmount: validation.limits_info.remaining_monthly_usd
      }
    }

    return {
      canProceed: false,
      reason: firstError
    }
  }

  /**
   * Get user limits status for UI display
   */
  async getUserLimitsStatus(userId: string) {
    const summary = await this.getUserTransactionSummary(userId)
    const limits = this.getLimits()

    return {
      monthly: {
        used: summary.current_month_volume_usd,
        limit: limits.max_monthly_usd,
        remaining: Math.max(0, limits.max_monthly_usd - summary.current_month_volume_usd),
        percentage: (summary.current_month_volume_usd / limits.max_monthly_usd) * 100
      },
      daily_transactions: {
        used: summary.current_day_transaction_count,
        limit: limits.max_daily_transactions,
        remaining: Math.max(0, limits.max_daily_transactions - summary.current_day_transaction_count)
      },
      per_transaction: {
        min: limits.min_transaction_usd,
        max: limits.max_transaction_usd
      }
    }
  }
}