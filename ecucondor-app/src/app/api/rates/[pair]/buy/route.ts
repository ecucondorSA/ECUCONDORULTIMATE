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

    // Return buy-specific information
    const response: {
      success: boolean
      data: {
        pair: string
        type: string
        rate: number
        commission_rate: number
        spread: number
        last_updated: string
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
        type: 'buy',
        rate: rate.buy_rate,
        commission_rate: 0, // No commission for buy operations
        spread: rate.spread,
        last_updated: rate.last_updated
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

      const transaction = service.calculateTransaction(pairUpper, amountNum, 'buy')
      
      if (transaction) {
        // Calculate the USD equivalent for limits validation
        let amountUSD: number
        if (rate.base_currency === 'USD') {
          amountUSD = transaction.base_amount // USD amount being bought
        } else {
          // For non-USD pairs, estimate USD value
          amountUSD = rate.target_currency === 'USD' ? amountNum : transaction.base_amount * 0.18 // rough estimate
        }

        // Validate transaction limits if user_id provided
        if (userId) {
          const limitsService = getLimitsService()
          const validation = await limitsService.validateTransaction(userId, amountUSD, 'buy')
          
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

        response.data.transaction = {
          ...transaction,
          base_currency: rate.base_currency,
          target_currency: rate.target_currency,
          requested_amount: amountNum,
          amount_usd: amountUSD,
          description: `Buy ${transaction.base_amount} ${rate.base_currency} for ${transaction.target_amount} ${rate.target_currency}`
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
              'buy'
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
    console.error(`❌ Error in /api/rates/${pair}/buy:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get buy rate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}