import { createClient } from '@/lib/supabase/server'
import { PriceLock, PRICE_LOCK_DURATION_MINUTES } from '@/lib/types/limits'
import { ExchangeRate } from '@/lib/types'

export class PriceLockService {
  private static instance: PriceLockService

  static getInstance(): PriceLockService {
    if (!PriceLockService.instance) {
      PriceLockService.instance = new PriceLockService()
    }
    return PriceLockService.instance
  }

  /**
   * Create a price lock for a user's transaction
   */
  async createPriceLock(
    userId: string,
    pair: string,
    rate: ExchangeRate,
    amountUSD: number,
    transactionType: 'buy' | 'sell'
  ): Promise<PriceLock> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + PRICE_LOCK_DURATION_MINUTES * 60 * 1000)
    
    const priceLock: PriceLock = {
      id: `lock_${userId}_${Date.now()}`,
      user_id: userId,
      pair,
      rate: transactionType === 'sell' ? rate.sell_rate : rate.buy_rate,
      amount_usd: amountUSD,
      locked_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      used: false,
      transaction_type: transactionType
    }

    // Store in Supabase
    const supabase = await createClient()
    const { error } = await supabase
      .from('price_locks')
      .insert([{
        id: priceLock.id,
        user_id: priceLock.user_id,
        pair: priceLock.pair,
        rate: priceLock.rate,
        amount_usd: priceLock.amount_usd,
        locked_at: priceLock.locked_at,
        expires_at: priceLock.expires_at,
        used: priceLock.used,
        transaction_type: priceLock.transaction_type
      }])

    if (error) {
      console.error('Error creating price lock:', error)
      throw new Error('Failed to create price lock')
    }

    return priceLock
  }

  /**
   * Get a valid price lock by ID
   */
  async getPriceLock(lockId: string): Promise<PriceLock | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('price_locks')
      .select('*')
      .eq('id', lockId)
      .eq('used', false)
      .single()

    if (error) {
      console.error('Error getting price lock:', error)
      return null
    }

    const priceLock = data as PriceLock
    
    // Check if expired
    if (new Date(priceLock.expires_at) < new Date()) {
      console.log(`Price lock ${lockId} has expired`)
      return null
    }

    return priceLock
  }

  /**
   * Use a price lock (mark as used)
   */
  async usePriceLock(lockId: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('price_locks')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', lockId)
      .eq('used', false)

    if (error) {
      console.error('Error using price lock:', error)
      return false
    }

    return true
  }

  /**
   * Get user's active price locks
   */
  async getUserActivePriceLocks(userId: string): Promise<PriceLock[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('price_locks')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('locked_at', { ascending: false })

    if (error) {
      console.error('Error getting user price locks:', error)
      return []
    }

    return data as PriceLock[]
  }

  /**
   * Clean expired price locks (cleanup job)
   */
  async cleanExpiredPriceLocks(): Promise<number> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('price_locks')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning expired price locks:', error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Validate price lock for transaction
   */
  async validatePriceLock(
    lockId: string, 
    userId: string, 
    pair: string, 
    amountUSD: number,
    transactionType: 'buy' | 'sell'
  ): Promise<{
    valid: boolean
    priceLock?: PriceLock
    error?: string
  }> {
    const priceLock = await this.getPriceLock(lockId)
    
    if (!priceLock) {
      return {
        valid: false,
        error: 'Price lock not found or expired'
      }
    }

    // Validate ownership
    if (priceLock.user_id !== userId) {
      return {
        valid: false,
        error: 'Price lock belongs to different user'
      }
    }

    // Validate pair
    if (priceLock.pair !== pair) {
      return {
        valid: false,
        error: 'Price lock is for different currency pair'
      }
    }

    // Validate transaction type
    if (priceLock.transaction_type !== transactionType) {
      return {
        valid: false,
        error: 'Price lock is for different transaction type'
      }
    }

    // Validate amount (allow 1% tolerance for rounding)
    const tolerance = 0.01
    const amountDiff = Math.abs(priceLock.amount_usd - amountUSD)
    const maxDiff = Math.max(priceLock.amount_usd, amountUSD) * tolerance
    
    if (amountDiff > maxDiff) {
      return {
        valid: false,
        error: 'Amount differs from price lock'
      }
    }

    return {
      valid: true,
      priceLock
    }
  }

  /**
   * Get price lock status for UI
   */
  async getPriceLockStatus(lockId: string): Promise<{
    valid: boolean
    expires_in_minutes?: number
    rate?: number
    expired?: boolean
  }> {
    const priceLock = await this.getPriceLock(lockId)
    
    if (!priceLock) {
      return { valid: false, expired: true }
    }

    const now = new Date()
    const expiresAt = new Date(priceLock.expires_at)
    const expiresInMs = expiresAt.getTime() - now.getTime()
    const expiresInMinutes = Math.max(0, Math.floor(expiresInMs / (1000 * 60)))

    return {
      valid: expiresInMinutes > 0,
      expires_in_minutes: expiresInMinutes,
      rate: priceLock.rate,
      expired: expiresInMinutes <= 0
    }
  }
}