import { NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';

// Cache en memoria para última tasa conocida
let lastKnownRates = {
  USDTARS: { price: null as number | null, timestamp: null as number | null },
  USDTBRL: { price: null as number | null, timestamp: null as number | null }
};

// Función para obtener última tasa conocida válida
function getLastKnownRate(symbol: string): number | null {
  const cached = lastKnownRates[symbol as keyof typeof lastKnownRates];
  if (cached?.price && cached?.timestamp) {
    const hoursOld = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
    if (hoursOld < 24) {
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
}

// Función para obtener tasas desde Binance
async function fetchBinanceRates() {
  try {
    const [usdtArsResponse, usdtBrlResponse] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTARS', {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'ecucondor-app/1.0'
        }
      }),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL', {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'ecucondor-app/1.0'
        }
      })
    ]);
    
    if (usdtArsResponse.ok && usdtBrlResponse.ok) {
      const usdtArsData = await usdtArsResponse.json();
      const usdtBrlData = await usdtBrlResponse.json();
      
      const usdArsPrice = parseFloat(usdtArsData.price);
      const usdBrlPrice = parseFloat(usdtBrlData.price);
      
      if (usdArsPrice > 0 && usdBrlPrice > 0) {
        saveLastKnownRate('USDTARS', usdArsPrice);
        saveLastKnownRate('USDTBRL', usdBrlPrice);
        
        // Calcular tasas de EcuCondor
        const usdArsSellRate = usdArsPrice - 20;
        const usdArsBuyRate = usdArsPrice + 50;
        const usdBrlSellRate = usdBrlPrice - 0.05;
        const usdBrlBuyRate = usdBrlPrice + 0.10;
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
    logger.error('Binance API failed in SSE:', error);
  }
  
  // Fallback usando cache
  const lastUsdArs = getLastKnownRate('USDTARS');
  const lastUsdBrl = getLastKnownRate('USDTBRL');
  
  if (lastUsdArs && lastUsdBrl) {
    const usdArsSellRate = lastUsdArs - 20;
    const usdArsBuyRate = lastUsdArs + 50;
    const usdBrlSellRate = lastUsdBrl - 0.05;
    const usdBrlBuyRate = lastUsdBrl + 0.10;
    const arsBrlSellRate = usdBrlSellRate / usdArsSellRate;
    const arsBrlBuyRate = usdBrlBuyRate / usdArsBuyRate;

    return [
      {
        pair: 'USD-ARS',
        sell_rate: Math.round(usdArsSellRate * 100) / 100,
        buy_rate: Math.round(usdArsBuyRate * 100) / 100,
        binance_rate: Math.round(lastUsdArs * 100) / 100,
        spread: 70,
        last_updated: new Date().toISOString(),
        source: 'cache'
      },
      {
        pair: 'USD-BRL',
        sell_rate: Math.round(usdBrlSellRate * 100) / 100,
        buy_rate: Math.round(usdBrlBuyRate * 100) / 100,
        binance_rate: Math.round(lastUsdBrl * 100) / 100,
        spread: 0.15,
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

  // Emergency fallback
  return [
    {
      pair: 'USD-ARS',
      sell_rate: 1527.90,
      buy_rate: 1597.90,
      binance_rate: 1547.90,
      spread: 70,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    },
    {
      pair: 'USD-BRL',
      sell_rate: 5.27,
      buy_rate: 5.42,
      binance_rate: 5.318,
      spread: 0.15,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    },
    {
      pair: 'ARS-BRL',
      sell_rate: 0.0034,
      buy_rate: 0.0034,
      spread: -0.0001,
      last_updated: new Date().toISOString(),
      source: 'emergency'
    }
  ];
}

// Conjunto de conexiones activas
const activeConnections = new Set<ReadableStreamDefaultController>();

// Función para limpiar conexiones cerradas
function cleanupConnections() {
  activeConnections.forEach(controller => {
    try {
      // Intentar enviar un ping para verificar si la conexión está activa
      controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
    } catch (error) {
      // Si falla, remover de la lista
      activeConnections.delete(controller);
    }
  });
}

// Función para enviar datos a todas las conexiones
function broadcastToAllConnections(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const closedConnections: ReadableStreamDefaultController[] = [];
  
  activeConnections.forEach(controller => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Marcar para remoción si la conexión está cerrada
      closedConnections.push(controller);
    }
  });
  
  // Limpiar conexiones cerradas
  closedConnections.forEach(controller => {
    activeConnections.delete(controller);
  });
  
  logger.info(`📡 Broadcasted to ${activeConnections.size} active connections`);
}

// Configurar actualizaciones automáticas (solo una vez)
let updateInterval: NodeJS.Timeout | null = null;

function startBroadcastUpdates() {
  if (updateInterval) return; // Ya está configurado
  
  logger.info('🚀 Starting SSE broadcast service...');
  
  const sendUpdates = async () => {
    try {
      const rates = await fetchBinanceRates();
      const data = {
        type: 'rates_update',
        data: rates,
        timestamp: new Date().toISOString(),
        connections: activeConnections.size
      };
      
      if (activeConnections.size > 0) {
        broadcastToAllConnections(data);
      }
    } catch (error) {
      logger.error('❌ Error in SSE broadcast:', error);
    }
  };
  
  // Primera actualización inmediata
  sendUpdates();
  
  // Configurar actualizaciones cada 30 segundos
  updateInterval = setInterval(sendUpdates, 30000);
  
  // Limpiar conexiones cada 5 minutos
  setInterval(cleanupConnections, 300000);
}

export async function GET(request: NextRequest) {
  logger.info('🔗 New SSE connection established');
  
  // Iniciar el servicio de broadcast si no está activo
  startBroadcastUpdates();
  
  // Crear stream para Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Agregar a conexiones activas
      activeConnections.add(controller);
      
      // Enviar mensaje inicial
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'SSE connection established',
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(initialMessage);
      
      // Enviar tasas iniciales inmediatamente
      fetchBinanceRates().then(rates => {
        const initialData = {
          type: 'rates_update',
          data: rates,
          timestamp: new Date().toISOString(),
          connections: activeConnections.size
        };
        
        controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);
      });
      
      logger.info(`📈 SSE connection added - ${activeConnections.size} total connections`);
    },
    
    cancel(controller) {
      // Remover de conexiones activas cuando se cierre
      activeConnections.delete(controller);
      logger.info(`📉 SSE connection removed - ${activeConnections.size} remaining connections`);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}