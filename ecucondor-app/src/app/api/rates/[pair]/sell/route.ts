import { NextRequest, NextResponse } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'
import { TransactionLimitsService } from '@/lib/services/transaction-limits'
import { PriceLockService } from '@/lib/services/price-lock'

let exchangeService: ExchangeRateService | null = null
let limitsService: TransactionLimitsService | null = null
let priceLockService: PriceLockService | null = null

function getExchangeService(): ExchangeRateService {
  if (!exchangeService) {
    exchangeService = ExchangeRateService.getInstance()
  }
  return exchangeService
}

function getLimitsService(): TransactionLimitsService {
  if (!limitsService) {
    limitsService = TransactionLimitsService.getInstance()
  }
  return limitsService
}

function getPriceLockService(): PriceLockService {
  if (!priceLockService) {
    priceLockService = PriceLockService.getInstance()
  }
  return priceLockService
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair } = await params
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')
    const createLock = searchParams.get('lock') === 'true'
    const userId = searchParams.get('user_id') // In production, get from JWT token

    if (!pair) {
      return NextResponse.json(
        { error: 'Currency pair is required' },
        { status: 400 }
      )
    }

    const service = getExchangeService()
    await service.updateRates()

    const pairUpper = pair.toUpperCase()
    const rate = service.getRate(pairUpper)

    if (!rate) {
      return NextResponse.json(
        { error: `Exchange rate for ${pairUpper} not found` },
        { status: 404 }
      )
    }

    // Return sell-specific information
    const response: {
      success: boolean
      data: {
        pair: string
        type: string
        rate: number
        commission_rate: number
        spread: number
        last_updated: string
        commission_info: {
          rate: number
          percentage: string
        }
        validation?: {
          valid: boolean
          warnings: string[]
          limits_info: {
            remaining_monthly_usd: number
            remaining_daily_usd: number
            remaining_daily_transactions: number
          }
        }
        transaction?: {
          base_amount: number
          target_amount: number
          base_currency: string
          target_currency: string
          rate_used: number
          commission: number
          requested_amount: number
          amount_usd: number
          description: string
        }
        price_lock?: {
          id: string
          expires_at: string
          locked_rate: number
          duration_minutes: number
        }
        price_lock_error?: string
      }
      timestamp: string
    } = {
      success: true,
      data: {
        pair: pairUpper,
        type: 'sell',
        rate: rate.sell_rate,
        commission_rate: rate.commission_rate,
        spread: rate.spread,
        last_updated: rate.last_updated,
        commission_info: {
          rate: rate.commission_rate,
          percentage: `${(rate.commission_rate * 100)}%`
        }
      },
      timestamp: new Date().toISOString()
    }

    // If amount provided, calculate transaction with limits validation
    if (amount) {
      const amountNum = parseFloat(amount)
      
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount provided' },
          { status: 400 }
        )
      }

      // Calculate the USD equivalent for limits validation
      let amountUSD: number
      if (rate.base_currency === 'USD') {
        amountUSD = amountNum
      } else {
        // Convert to USD using the rate (simplified - in production use current USD rates)
        amountUSD = rate.base_currency === 'ARS' ? amountNum / (rate.binance_rate || 1000) : amountNum * 0.18 // rough estimate
      }

      // Validate transaction limits if user_id provided
      if (userId) {
        const limitsService = getLimitsService()
        const validation = await limitsService.validateTransaction(userId, amountUSD, 'sell')
        
        if (!validation.valid) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Transaction limits exceeded',
              validation_errors: validation.errors,
              warnings: validation.warnings,
              limits_info: validation.limits_info
            },
            { status: 400 }
          )
        }
        
        response.data.validation = {
          valid: true,
          warnings: validation.warnings,
          limits_info: validation.limits_info
        }
      }

      const transaction = service.calculateTransaction(pairUpper, amountNum, 'sell')
      
      if (transaction) {
        response.data.transaction = {
          ...transaction,
          base_currency: rate.base_currency,
          target_currency: rate.target_currency,
          requested_amount: amountNum,
          amount_usd: amountUSD,
          description: `Sell ${transaction.base_amount} ${rate.base_currency} for ${transaction.target_amount} ${rate.target_currency} (after ${(rate.commission_rate * 100)}% commission)`
        }

        // Create price lock if requested and user provided
        if (createLock && userId) {
          try {
            const priceLockService = getPriceLockService()
            const priceLock = await priceLockService.createPriceLock(
              userId,
              pairUpper,
              rate,
              amountUSD,
              'sell'
            )
            
            response.data.price_lock = {
              id: priceLock.id,
              expires_at: priceLock.expires_at,
              locked_rate: priceLock.rate,
              duration_minutes: 15
            }
            
          } catch (lockError) {
            console.error('Failed to create price lock:', lockError)
            response.data.price_lock_error = 'Failed to create price lock'
          }
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error(`❌ Error in /api/rates/${pair}/sell:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get sell rate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}