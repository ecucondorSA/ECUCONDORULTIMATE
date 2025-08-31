import { NextRequest } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'

let exchangeService: ExchangeRateService | null = null
const pairConnections = new Map<string, Set<ReadableStreamDefaultController>>()

function getExchangeService(): ExchangeRateService {
  if (!exchangeService) {
    exchangeService = ExchangeRateService.getInstance()
  }
  return exchangeService
}

// Broadcast to clients watching a specific pair
function broadcastToPairClients(pair: string, data: string) {
  const connections = pairConnections.get(pair)
  if (!connections) return
  
  const disconnectedControllers: ReadableStreamDefaultController[] = []
  
  for (const controller of connections) {
    try {
      controller.enqueue(`data: ${data}\n\n`)
    } catch (_error) {
      console.log(`Client disconnected from ${pair} stream`)
      disconnectedControllers.push(controller)
    }
  }
  
  // Clean up disconnected controllers
  disconnectedControllers.forEach(controller => {
    connections.delete(controller)
  })
  
  // Remove empty connection sets
  if (connections.size === 0) {
    pairConnections.delete(pair)
  }
}

// Update specific pair and broadcast
async function updatePairAndBroadcast(pair: string) {
  try {
    const service = getExchangeService()
    await service.updateRates()
    
    const rate = service.getRate(pair)
    if (!rate) return
    
    const message = JSON.stringify({
      type: 'rate_update',
      pair,
      data: rate,
      timestamp: new Date().toISOString()
    })
    
    broadcastToPairClients(pair, message)
    
    const connectionCount = pairConnections.get(pair)?.size || 0
    console.log(`📡 Broadcasted ${pair} rate to ${connectionCount} clients`)
  } catch (error) {
    console.error(`❌ Error updating ${pair} rate:`, error)
    
    const errorMessage = JSON.stringify({
      type: 'error',
      pair,
      error: `Failed to update ${pair} rate`,
      timestamp: new Date().toISOString()
    })
    
    broadcastToPairClients(pair, errorMessage)
  }
}

// Pair-specific update intervals
const pairIntervals = new Map<string, NodeJS.Timeout>()

function startPairUpdates(pair: string) {
  if (!pairIntervals.has(pair)) {
    console.log(`🚀 Starting updates for ${pair} every 30 seconds`)
    
    // Initial update
    updatePairAndBroadcast(pair)
    
    // Set interval
    const interval = setInterval(() => updatePairAndBroadcast(pair), 30000)
    pairIntervals.set(pair, interval)
  }
}

function stopPairUpdates(pair: string) {
  const connections = pairConnections.get(pair)
  if ((!connections || connections.size === 0) && pairIntervals.has(pair)) {
    console.log(`⏹️  Stopping updates for ${pair} (no active connections)`)
    
    const interval = pairIntervals.get(pair)!
    clearInterval(interval)
    pairIntervals.delete(pair)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair } = await params
  const pairUpper = pair.toUpperCase()
  
  console.log(`🔄 New SSE connection for ${pairUpper}`)
  
  // Validate pair exists
  const service = getExchangeService()
  const rate = service.getRate(pairUpper)
  
  if (!rate) {
    return new Response(
      `data: ${JSON.stringify({
        type: 'error',
        error: `Exchange rate for ${pairUpper} not found`,
        timestamp: new Date().toISOString()
      })}\n\n`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        }
      }
    )
  }
  
  const stream = new ReadableStream({
    start(controller) {
      // Add to pair connections
      if (!pairConnections.has(pairUpper)) {
        pairConnections.set(pairUpper, new Set())
      }
      pairConnections.get(pairUpper)!.add(controller)
      
      // Start updates for this pair
      startPairUpdates(pairUpper)
      
      // Send connection confirmation
      const welcomeMessage = JSON.stringify({
        type: 'connected',
        message: `Connected to ${pairUpper} exchange rate stream`,
        pair: pairUpper,
        timestamp: new Date().toISOString()
      })
      controller.enqueue(`data: ${welcomeMessage}\n\n`)
      
      // Send current rate immediately
      const currentRate = service.getRate(pairUpper)
      if (currentRate) {
        const initialMessage = JSON.stringify({
          type: 'initial_rate',
          pair: pairUpper,
          data: currentRate,
          timestamp: new Date().toISOString()
        })
        controller.enqueue(`data: ${initialMessage}\n\n`)
      }
      
      // Heartbeat for this specific connection
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = JSON.stringify({
            type: 'heartbeat',
            pair: pairUpper,
            timestamp: new Date().toISOString(),
            connections_for_pair: pairConnections.get(pairUpper)?.size || 0
          })
          controller.enqueue(`data: ${heartbeat}\n\n`)
        } catch (_error) {
          clearInterval(heartbeatInterval)
        }
      }, 15000)
      
      // Store cleanup function
      ;(controller as { cleanup?: () => void }).cleanup = () => {
        clearInterval(heartbeatInterval)
        const connections = pairConnections.get(pairUpper)
        if (connections) {
          connections.delete(controller)
        }
        stopPairUpdates(pairUpper)
      }
    },
    
    cancel() {
      console.log(`🔌 SSE connection for ${pairUpper} cancelled`)
      // Cleanup handled by controller cleanup function
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Handle CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    },
  })
}

// Cleanup on process termination
if (typeof process !== 'undefined') {
  const cleanup = () => {
    pairIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    pairIntervals.clear()
  }
  
  process.on('SIGTERM', cleanup)
  process.on('SIGINT', cleanup)
}