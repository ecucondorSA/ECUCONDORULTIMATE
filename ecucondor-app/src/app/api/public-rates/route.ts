import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server'

// Cache en memoria para última tasa conocida (en producción usar Redis/DB)
let lastKnownRates = {
  USDTARS: { price: null as number | null, timestamp: null as number | null },
  USDTBRL: { price: null as number | null, timestamp: null as number | null }
};

// Función para obtener última tasa conocida válida
function getLastKnownRate(symbol: string): number | null {
  const cached = lastKnownRates[symbol as keyof typeof lastKnownRates];
  if (cached?.price && cached?.timestamp) {
    // Usar última tasa si es de las últimas 24 horas
    const hoursOld = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
    if (hoursOld < 24) {
      logger.info(`🔄 Using last known rate for ${symbol}: ${cached.price} (${hoursOld.toFixed(1)}h old)`);
      return cached.price;
    }
  }
  return null;
}

// Función para guardar última tasa exitosa
function saveLastKnownRate(symbol: string, price: number) {
  lastKnownRates[symbol as keyof typeof lastKnownRates] = {
    price,
    timestamp: Date.now()
  };
  logger.info(`💾 Saved last known rate for ${symbol}: ${price}`);
}

// Función para obtener tasas dinámicas - usar Binance directo para máxima precisión
async function getDynamicRates() {
  // SIEMPRE usar Binance directo para garantizar tasas correctas en tiempo real
  try {
    logger.info('🔄 Using direct Binance API for real-time rates');
    
    // Obtener tasas directamente desde Binance - SIN CACHE para tiempo real
    // Obtener tasas individuales de Binance con timeout aumentado a 10 segundos
    const [usdtArsResponse, usdtBrlResponse] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTARS', {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL', {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    ]);
    
    if (usdtArsResponse.ok && usdtBrlResponse.ok) {
      const usdtArsData = await usdtArsResponse.json();
      const usdtBrlData = await usdtBrlResponse.json();
      
      const usdArsPrice = parseFloat(usdtArsData.price);
      const usdBrlPrice = parseFloat(usdtBrlData.price);
      
      // Validar que los precios son válidos
      if (usdArsPrice > 0 && usdBrlPrice > 0) {
        // Guardar tasas exitosas para futuro fallback
        saveLastKnownRate('USDTARS', usdArsPrice);
        saveLastKnownRate('USDTBRL', usdBrlPrice);
        
        logger.info(`✅ Binance rates: USD/ARS=${usdArsPrice}, USD/BRL=${usdBrlPrice}`);
        
        // Aplicar la lógica de negocio de EcuCondor
        const usdArsSellRate = usdArsPrice - 20; // EcuCondor vende USD más barato
        const usdArsBuyRate = usdArsPrice + 50;  // EcuCondor compra USD
        
        const usdBrlSellRate = usdBrlPrice - 0.05;
        const usdBrlBuyRate = usdBrlPrice + 0.10;
        
        // Calcular ARS-BRL basado en las otras tasas
        const arsBrlSellRate = usdBrlSellRate / usdArsSellRate;
        const arsBrlBuyRate = usdBrlBuyRate / usdArsBuyRate;
        
        return [
          {
            pair: 'USD-ARS',
            sell_rate: Math.round(usdArsSellRate * 100) / 100,
            buy_rate: Math.round(usdArsBuyRate * 100) / 100,
            binance_rate: usdArsPrice,
            spread: Math.round((usdArsBuyRate - usdArsSellRate) * 100) / 100,
            last_updated: new Date().toISOString(),
            source: 'binance'
          },
          {
            pair: 'USD-BRL',
            sell_rate: Math.round(usdBrlSellRate * 100) / 100,
            buy_rate: Math.round(usdBrlBuyRate * 100) / 100,
            binance_rate: usdBrlPrice,
            spread: Math.round((usdBrlBuyRate - usdBrlSellRate) * 100) / 100,
            last_updated: new Date().toISOString(),
            source: 'binance'
          },
          {
            pair: 'ARS-BRL',
            sell_rate: Math.round(arsBrlSellRate * 10000) / 10000,
            buy_rate: Math.round(arsBrlBuyRate * 10000) / 10000,
            spread: Math.round((arsBrlBuyRate - arsBrlSellRate) * 10000) / 10000,
            last_updated: new Date().toISOString(),
            source: 'calculated'
          }
        ];
      }
    }
  } catch (error) {
    logger.error('Binance API failed:', error);
  }
  
  // Fallback: usar última tasa conocida exitosa
  logger.warn('⚠️ Binance API failed - attempting to use last known rates');
  
  const lastUsdArs = getLastKnownRate('USDTARS');
  const lastUsdBrl = getLastKnownRate('USDTBRL');
  
  // Si tenemos tasas recientes, usarlas sin fluctuación para estabilidad
  if (lastUsdArs && lastUsdBrl) {
    logger.info(`✅ Using last known rates: USD/ARS=${lastUsdArs}, USD/BRL=${lastUsdBrl}`);
    
    const dynamicUsdArsRate = lastUsdArs;
    const dynamicUsdBrlRate = lastUsdBrl;
    
    // Calcular ARS-BRL basado en las tasas del cache
    const fallbackArsSellRate = dynamicUsdArsRate - 20;
    const fallbackArsBuyRate = dynamicUsdArsRate + 50;
    const fallbackBrlSellRate = dynamicUsdBrlRate - 0.05;
    const fallbackBrlBuyRate = dynamicUsdBrlRate + 0.10;
    
    const arsBrlSellRate = fallbackBrlSellRate / fallbackArsSellRate;
    const arsBrlBuyRate = fallbackBrlBuyRate / fallbackArsBuyRate;

    return [
      {
        pair: 'USD-ARS',
        sell_rate: Math.round((dynamicUsdArsRate - 20) * 100) / 100,
        buy_rate: Math.round((dynamicUsdArsRate + 50) * 100) / 100,
        binance_rate: Math.round(dynamicUsdArsRate * 100) / 100,
        spread: 70,
        last_updated: new Date().toISOString(),
        source: 'cache'
      },
      {
        pair: 'USD-BRL',
        sell_rate: Math.round((dynamicUsdBrlRate - 0.05) * 100) / 100,
        buy_rate: Math.round((dynamicUsdBrlRate + 0.10) * 100) / 100,
        binance_rate: Math.round(dynamicUsdBrlRate * 100) / 100,
        spread: Math.round(((dynamicUsdBrlRate + 0.10) - (dynamicUsdBrlRate - 0.05)) * 100) / 100,
        last_updated: new Date().toISOString(),
        source: 'cache'
      },
      {
        pair: 'ARS-BRL',
        sell_rate: Math.round(arsBrlSellRate * 10000) / 10000,
        buy_rate: Math.round(arsBrlBuyRate * 10000) / 10000,
        spread: Math.round((arsBrlBuyRate - arsBrlSellRate) * 10000) / 10000,
        last_updated: new Date().toISOString(),
        source: 'cache'
      }
    ];
  }
  
  // Fallback final: valores de emergencia solo si no hay cache (primera ejecución)
  logger.error('❌ No last known rates available - using emergency fallback');
  const emergencyUsdArs = 1547.90; // Solo para primera ejecución
  const emergencyUsdBrl = 5.318;
  
  // Calcular ARS-BRL basado en valores de emergencia
  const emergencyArsSellRate = emergencyUsdArs - 20;
  const emergencyArsBuyRate = emergencyUsdArs + 50;
  const emergencyBrlSellRate = emergencyUsdBrl - 0.05;
  const emergencyBrlBuyRate = emergencyUsdBrl + 0.10;
  
  const emergencyArsBrlSellRate = emergencyBrlSellRate / emergencyArsSellRate;
  const emergencyArsBrlBuyRate = emergencyBrlBuyRate / emergencyArsBuyRate;

  return [
    {
      pair: 'USD-ARS',
      sell_rate: Math.round((emergencyUsdArs - 20) * 100) / 100,
      buy_rate: Math.round((emergencyUsdArs + 50) * 100) / 100,
      binance_rate: Math.round(emergencyUsdArs * 100) / 100,
      spread: 70,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    },
    {
      pair: 'USD-BRL',
      sell_rate: Math.round((emergencyUsdBrl - 0.05) * 100) / 100,
      buy_rate: Math.round((emergencyUsdBrl + 0.10) * 100) / 100,
      binance_rate: Math.round(emergencyUsdBrl * 100) / 100,
      spread: 0.15,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    },
    {
      pair: 'ARS-BRL',
      sell_rate: Math.round(emergencyArsBrlSellRate * 10000) / 10000,
      buy_rate: Math.round(emergencyArsBrlBuyRate * 10000) / 10000,
      spread: Math.round((emergencyArsBrlBuyRate - emergencyArsBrlSellRate) * 10000) / 10000,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    // Obtener tasas dinámicas
    const dynamicRates = await getDynamicRates();

    return NextResponse.json({
      success: true,
      data: dynamicRates,
      count: dynamicRates.length,
      timestamp: new Date().toISOString(),
      note: "Real-time dynamic rates with live Binance data + EcuCondor business logic. Fallback uses last known successful rates."
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
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