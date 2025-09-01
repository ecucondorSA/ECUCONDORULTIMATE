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

    interface BuyTransaction {
      base_amount: number
      target_amount: number
      rate_used: number
      commission: number
      total_cost: number
      requested_amount: number
      description: string
    }

    interface BuyRateData {
      pair: string
      type: 'buy'
      rate: number
      commission_rate: number
      spread: number
      last_updated: string
      transaction?: BuyTransaction
    }

    const data: BuyRateData = {
      pair: pairUpper,
      type: 'buy',
      rate: rate.buy_rate,
      commission_rate: 0,
      spread: rate.spread,
      last_updated: rate.last_updated
    }

    // If amount provided, calculate transaction
    if (amount) {
      const amountNum = parseFloat(amount)
      
        if (isNaN(amountNum) || amountNum <= 0) {
          return createErrorResponse('Invalid amount provided', 400)
        }

      const transaction = service.calculateTransaction(pairUpper, amountNum, 'buy')

      if (transaction) {
        data.transaction = {
          ...transaction,
          requested_amount: amountNum,
          description: `Buy ${transaction.base_amount} ${rate.base_currency} for ${transaction.target_amount} ${rate.target_currency}`
        }
      }
    }

    return createSuccessResponse(data)

  } catch (error) {
    console.error(`❌ Error in /api/rates/${params.pair}/buy:`, error)
    
    return createErrorResponse(
      'Failed to get buy rate',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}