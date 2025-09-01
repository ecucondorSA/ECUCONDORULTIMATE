import { NextRequest } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'

// Global service and connection management
let exchangeService: ExchangeRateService | null = null
const activeConnections = new Set<ReadableStreamDefaultController>()

interface ControllerWithCleanup extends ReadableStreamDefaultController {
  cleanup?: () => void
}

function getExchangeService(): ExchangeRateService {
  if (!exchangeService) {
    exchangeService = ExchangeRateService.getInstance()
  }
  return exchangeService
}

// Broadcast to all connected clients
function broadcastToClients(data: string) {
  const disconnectedControllers: ReadableStreamDefaultController[] = []

  for (const controller of activeConnections) {
    try {
      controller.enqueue(`data: ${data}\n\n`)
    } catch {
      console.log('Client disconnected, removing from active connections')
      disconnectedControllers.push(controller)
    }
  }
  
  // Clean up disconnected controllers
  disconnectedControllers.forEach(controller => {
    activeConnections.delete(controller)
  })
}

// Update rates and broadcast to all clients
async function updateAndBroadcast() {
  try {
    const service = getExchangeService()
    const rates = await service.updateRates()
    
    const ratesArray = Array.from(rates.values())
    const message = JSON.stringify({
      type: 'rates_update',
      data: ratesArray,
      timestamp: new Date().toISOString(),
      count: ratesArray.length
    })
    
    broadcastToClients(message)
    console.log(`📡 Broadcasted rates to ${activeConnections.size} clients`)
  } catch (error) {
    console.error('❌ Error updating rates for broadcast:', error)

    const errorMessage = JSON.stringify({
      type: 'error',
      error: 'Failed to update rates',
      timestamp: new Date().toISOString()
    })
    broadcastToClients(errorMessage)
  }
}

// Global update interval
let updateInterval: NodeJS.Timeout | null = null
const UPDATE_INTERVAL = 30000 // 30 seconds

function startGlobalUpdates() {
  if (!updateInterval) {
    console.log('🚀 Starting global rate updates every 30 seconds')
    
    // Initial update
    updateAndBroadcast()
    
    // Set interval for regular updates
    updateInterval = setInterval(updateAndBroadcast, UPDATE_INTERVAL)
  }
}

function stopGlobalUpdates() {
  if (updateInterval && activeConnections.size === 0) {
    console.log('⏹️  Stopping global rate updates (no active connections)')
    clearInterval(updateInterval)
    updateInterval = null
  }
}

export async function GET(request: NextRequest) {
  console.log('🔄 New SSE connection established')
  
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams
  const pair = searchParams.get('pair')?.toUpperCase()
  
  const stream = new ReadableStream({
    start(controller) {
      activeConnections.add(controller)
      
      // Start global updates if this is the first connection
      startGlobalUpdates()
      
      // Send initial connection confirmation
      const welcomeMessage = JSON.stringify({
        type: 'connected',
        message: 'Connected to Ecucondor exchange rates stream',
        pair_filter: pair || 'all',
        timestamp: new Date().toISOString()
      })
      controller.enqueue(`data: ${welcomeMessage}\n\n`)
      
      // Send current rates immediately
      const service = getExchangeService()
      const currentRates = service.getAllRates()
      
      const filteredRates = pair 
        ? currentRates.filter(rate => rate.pair === pair)
        : currentRates
      
      if (filteredRates.length > 0) {
        const initialMessage = JSON.stringify({
          type: 'initial_rates',
          data: filteredRates,
          timestamp: new Date().toISOString(),
          count: filteredRates.length
        })
        controller.enqueue(`data: ${initialMessage}\n\n`)
      }
      
      // Send heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
      const heartbeat = JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        active_connections: activeConnections.size
      })
      controller.enqueue(`data: ${heartbeat}\n\n`)
    } catch {
      clearInterval(heartbeatInterval)
    }
  }, 15000)
      
      // Store cleanup function
      const ctrl = controller as ControllerWithCleanup
      ctrl.cleanup = () => {
        clearInterval(heartbeatInterval)
        activeConnections.delete(controller)
        stopGlobalUpdates()
      }
    },
    
    cancel() {
      console.log('🔌 SSE connection cancelled')
      // Cleanup will be handled by the controller cleanup function
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

// Handle CORS preflight
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
  process.on('SIGTERM', () => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
  })
  
  process.on('SIGINT', () => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
  })
}