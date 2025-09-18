import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server'

// Datos públicos simplificados para la calculadora
const PUBLIC_RATES = [
  {
    pair: 'USD-ARS',
    sell_rate: 1524.7,  // Tasa corregida: más cara para vender USD
    buy_rate: 1454.7,   // Tasa corregida: más barata para comprar USD
    binance_rate: 1474.7,
    spread: 70,
    last_updated: new Date().toISOString(),
    source: 'public'
  },
  {
    pair: 'USD-BRL', 
    sell_rate: 5.41,
    buy_rate: 5.26,
    binance_rate: 5.31,
    spread: 0.15,
    last_updated: new Date().toISOString(),
    source: 'public'
  },
  {
    pair: 'ARS-BRL',
    sell_rate: 0.0036,
    buy_rate: 0.0035,
    spread: -0.0001,
    last_updated: new Date().toISOString(),
    source: 'public'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Add small random fluctuation to simulate real-time updates
    const ratesWithFluctuation = PUBLIC_RATES.map(rate => ({
      ...rate,
      sell_rate: rate.sell_rate * (1 + (Math.random() - 0.5) * 0.001), // ±0.05% fluctuation
      buy_rate: rate.buy_rate * (1 + (Math.random() - 0.5) * 0.001),
      last_updated: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: ratesWithFluctuation,
      count: ratesWithFluctuation.length,
      timestamp: new Date().toISOString(),
      note: "Public rates endpoint with corrected business logic"
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=30'
      }
    });

  } catch (error) {
    logger.error('❌ Error in /api/public-rates:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch public exchange rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}