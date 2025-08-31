import { NextRequest, NextResponse } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'

// Global instance to maintain state across requests
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
    console.log('⏰ Time to update rates...')
    const service = getExchangeService()
    await service.updateRates()
    lastUpdate = now
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pair = searchParams.get('pair')
    const refresh = searchParams.get('refresh') === 'true'

    const service = getExchangeService()

    // Force refresh if requested
    if (refresh) {
      console.log('🔄 Forcing rate refresh...')
      await service.updateRates()
      lastUpdate = Date.now()
    } else {
      await ensureRatesUpdated()
    }

    // Return specific pair or all rates
    if (pair) {
      const rate = service.getRate(pair.toUpperCase())
      if (!rate) {
        return NextResponse.json(
          { error: `Exchange rate for ${pair} not found` },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: rate,
        timestamp: new Date().toISOString()
      })
    }

    // Return all rates
    const allRates = service.getAllRates()
    
    return NextResponse.json({
      success: true,
      data: allRates,
      count: allRates.length,
      last_update: new Date(lastUpdate).toISOString(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in /api/rates:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch exchange rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    const service = getExchangeService()
    const isHealthy = service.isHealthy()
    
    return new Response(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  } catch {
    return new Response(null, { status: 503 })
  }
}