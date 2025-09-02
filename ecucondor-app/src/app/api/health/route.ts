import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'
import { BinanceService } from '@/lib/services/binance'
import { getHealthStatus } from '@/lib/utils/api'

export async function GET(request: NextRequest) {
  try {
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'
    
    // Basic health status
    const healthStatus = getHealthStatus()
    
    if (!detailed) {
      return NextResponse.json({
        status: healthStatus.status,
        timestamp: healthStatus.timestamp,
        uptime: healthStatus.uptime
      })
    }
    
    // Detailed health check
    const exchangeService = ExchangeRateService.getInstance()
    const binanceService = BinanceService.getInstance()
    
    // Test services
    const checks = await Promise.allSettled([
      // Test exchange service
      (async () => {
        const rates = exchangeService.getAllRates()
        const isHealthy = exchangeService.isHealthy()
        return { 
          service: 'exchange_rates',
          status: isHealthy ? 'up' : 'degraded',
          rates_count: rates.length,
          last_update: rates[0]?.last_updated || 'never'
        }
      })(),
      
      // Test Binance service
      (async () => {
        try {
          const price = await binanceService.getBinancePrice('USDTARS')
          return {
            service: 'binance',
            status: price ? 'up' : 'degraded',
            last_price: price?.price || null,
            timestamp: price?.timestamp || null
          }
        } catch (error) {
          return {
            service: 'binance',
            status: 'down',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })()
    ])
    
    // Process results
    const serviceChecks = checks.map((check, index) => {
      if (check.status === 'fulfilled') {
        return check.value
      } else {
        return {
          service: ['exchange_rates', 'binance'][index],
          status: 'down',
          error: check.reason?.message || 'Check failed'
        }
      }
    })
    
    // Determine overall status
    const hasDown = serviceChecks.some(check => check.status === 'down')
    const hasDegraded = serviceChecks.some(check => check.status === 'degraded')
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (hasDown) {
      overallStatus = 'unhealthy'
    } else if (hasDegraded) {
      overallStatus = 'degraded'
    }
    
    return NextResponse.json({
      ...healthStatus,
      status: overallStatus,
      checks: serviceChecks,
      environment: process.env.NODE_ENV || 'development',
      api_version: '1.0.0'
    })
    
  } catch (error) {
    logger.error('❌ Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

// Simple liveness probe
export async function HEAD() {
  return new Response(null, { status: 200 })
}