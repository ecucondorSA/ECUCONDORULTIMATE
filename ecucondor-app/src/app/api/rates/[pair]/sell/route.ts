import { NextRequest, NextResponse } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'

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
    const response: any = {
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

    // If amount provided, calculate transaction
    if (amount) {
      const amountNum = parseFloat(amount)
      
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount provided' },
          { status: 400 }
        )
      }

      const transaction = service.calculateTransaction(pairUpper, amountNum, 'sell')
      
      if (transaction) {
        response.data.transaction = {
          ...transaction,
          requested_amount: amountNum,
          description: `Sell ${transaction.base_amount} ${rate.base_currency} for ${transaction.target_amount} ${rate.target_currency} (after ${(rate.commission_rate * 100)}% commission)`
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error(`❌ Error in /api/rates/${params.pair}/sell:`, error)
    
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