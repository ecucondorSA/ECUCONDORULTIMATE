import { NextRequest, NextResponse } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'

// Global service instance
let exchangeService: ExchangeRateService | null = null
let lastUpdate = 0
const UPDATE_INTERVAL = 30000 // 30 seconds

function getExchangeService(): ExchangeRateService {
  if (!exchangeService) {
    exchangeService = ExchangeRateService.getInstance()
  }
  return exchangeService
}

async function ensureRatesUpdated(): Promise<void> {
  const now = Date.now()
  
  if (now - lastUpdate > UPDATE_INTERVAL) {
    console.log('⏰ Updating rates for specific pair...')
    const service = getExchangeService()
    await service.updateRates()
    lastUpdate = now
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair } = await params
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as 'buy' | 'sell' | null
    const amount = searchParams.get('amount')
    const refresh = searchParams.get('refresh') === 'true'

    if (!pair) {
      return NextResponse.json(
        { error: 'Currency pair is required' },
        { status: 400 }
      )
    }

    const service = getExchangeService()

    // Force refresh if requested
    if (refresh) {
      await service.updateRates()
      lastUpdate = Date.now()
    } else {
      await ensureRatesUpdated()
    }

    const pairUpper = pair.toUpperCase()
    const rate = service.getRate(pairUpper)

    if (!rate) {
      return NextResponse.json(
        { error: `Exchange rate for ${pairUpper} not found` },
        { status: 404 }
      )
    }

    // If amount and type provided, calculate transaction
    if (amount && type) {
      const amountNum = parseFloat(amount)
      
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount provided' },
          { status: 400 }
        )
      }

      const transaction = service.calculateTransaction(pairUpper, amountNum, type)
      
      if (!transaction) {
        return NextResponse.json(
          { error: 'Failed to calculate transaction' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          rate,
          transaction: {
            ...transaction,
            type,
            pair: pairUpper,
            requested_amount: amountNum
          }
        },
        timestamp: new Date().toISOString()
      })
    }

    // Return just the rate
    return NextResponse.json({
      success: true,
      data: rate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`❌ Error in /api/rates/${pair}:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch exchange rate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}