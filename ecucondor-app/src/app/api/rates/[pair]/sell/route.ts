import { NextRequest } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api'

let exchangeService: ExchangeRateService | null = null

function getExchangeService(): ExchangeRateService {
  if (!exchangeService) {
    exchangeService = ExchangeRateService.getInstance()
  }
  return exchangeService
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pair: string } }
) {
  try {
    const { pair } = params
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')

    if (!pair) {
      return createErrorResponse('Currency pair is required', 400)
    }

    const service = getExchangeService()
    await service.updateRates()

    const pairUpper = pair.toUpperCase()
    const rate = service.getRate(pairUpper)

    if (!rate) {
      return createErrorResponse(
        `Exchange rate for ${pairUpper} not found`,
        404
      )
    }

    interface SellTransaction {
      base_amount: number
      target_amount: number
      rate_used: number
      commission: number
      total_cost: number
      requested_amount: number
      description: string
    }

    interface SellRateData {
      pair: string
      type: 'sell'
      rate: number
      commission_rate: number
      spread: number
      last_updated: string
      commission_info: { rate: number; percentage: string }
      transaction?: SellTransaction
    }

    const data: SellRateData = {
      pair: pairUpper,
      type: 'sell',
      rate: rate.sell_rate,
      commission_rate: rate.commission_rate,
      spread: rate.spread,
      last_updated: rate.last_updated,
      commission_info: {
        rate: rate.commission_rate,
        percentage: `${rate.commission_rate * 100}%`
      }
    }

    // If amount provided, calculate transaction
    if (amount) {
      const amountNum = parseFloat(amount)
      
        if (isNaN(amountNum) || amountNum <= 0) {
          return createErrorResponse('Invalid amount provided', 400)
        }

      const transaction = service.calculateTransaction(pairUpper, amountNum, 'sell')

      if (transaction) {
        data.transaction = {
          ...transaction,
          requested_amount: amountNum,
          description: `Sell ${transaction.base_amount} ${rate.base_currency} for ${transaction.target_amount} ${rate.target_currency} (after ${rate.commission_rate * 100}% commission)`
        }
      }
    }

    return createSuccessResponse(data)

  } catch (error) {
    console.error(`❌ Error in /api/rates/${params.pair}/sell:`, error)
    
    return createErrorResponse(
      'Failed to get sell rate',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}