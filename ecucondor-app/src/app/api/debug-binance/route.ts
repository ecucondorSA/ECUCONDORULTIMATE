import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server'

// Deploy to regions with better Binance API access
export const runtime = 'edge';
export const preferredRegion = ['fra1', 'sin1'];

export async function GET(request: NextRequest) {
  try {
    logger.info('🔬 Starting Binance API debug...')
    
    // Test 1: Direct Binance API call
    const symbol = 'USDTARS'
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    
    logger.info(`📡 Testing API: ${apiUrl}`)
    
    const startTime = Date.now()
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ecucondor-app/1.0'
      }
    })
    const duration = Date.now() - startTime
    
    logger.info(`⏱️ API Response time: ${duration}ms`)
    logger.info(`📊 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`❌ API Error: ${errorText}`)
      
      return NextResponse.json({
        success: false,
        error: 'Binance API failed',
        status: response.status,
        statusText: response.statusText,
        duration,
        body: errorText,
        timestamp: new Date().toISOString()
      })
    }
    
    const data = await response.json()
    logger.info(`✅ API Success:`, data)
    
    // Test 2: Order book API
    const orderBookUrl = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=5`
    logger.info(`📊 Testing Order Book: ${orderBookUrl}`)
    
    const orderBookStart = Date.now()
    const orderBookResponse = await fetch(orderBookUrl, {
      headers: {
        'User-Agent': 'ecucondor-app/1.0'
      }
    })
    const orderBookDuration = Date.now() - orderBookStart
    
    let orderBookData = null
    if (orderBookResponse.ok) {
      orderBookData = await orderBookResponse.json()
      logger.info(`✅ Order Book Success`)
    } else {
      logger.error(`❌ Order Book Failed: ${orderBookResponse.status}`)
    }
    
    return NextResponse.json({
      success: true,
      test_results: {
        price_api: {
          url: apiUrl,
          status: response.status,
          duration,
          data
        },
        order_book_api: {
          url: orderBookUrl,
          status: orderBookResponse.status,
          duration: orderBookDuration,
          data: orderBookData
        }
      },
      environment: {
        vercel_env: process.env.VERCEL_ENV || 'development',
        node_env: process.env.NODE_ENV || 'development',
        runtime: typeof (globalThis as any).EdgeRuntime !== 'undefined' ? 'edge' : 'nodejs',
        user_agent: request.headers.get('user-agent')
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    logger.error('💥 Debug failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}