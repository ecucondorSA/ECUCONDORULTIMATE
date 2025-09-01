import { NextResponse } from 'next/server'

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: string
  timestamp: string
  count?: number
  last_update?: string
}

// Create success response
export function createSuccessResponse<T>(
  data: T,
  options?: {
    count?: number
    last_update?: string
    message?: string
  }
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...options
  }

  return NextResponse.json(response)
}

// Create error response
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: string
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, { status })
}

// Validate currency pair format
export function validateCurrencyPair(pair: string): boolean {
  const validPairs = [
    'USD-ARS', 'USD-BRL',
    'ARS-BRL',
    'ARS-USD', 'BRL-USD'
  ]
  
  return validPairs.includes(pair.toUpperCase())
}

// Parse and validate amount parameter
export function parseAmount(amountStr: string | null): { 
  amount: number | null, 
  error: string | null 
} {
  if (!amountStr) {
    return { amount: null, error: null }
  }

  const amount = parseFloat(amountStr)
  
  if (isNaN(amount)) {
    return { amount: null, error: 'Invalid amount format' }
  }
  
  if (amount <= 0) {
    return { amount: null, error: 'Amount must be greater than 0' }
  }
  
  if (amount > 1000000) {
    return { amount: null, error: 'Amount too large (max: 1,000,000)' }
  }

  return { amount, error: null }
}

// Format currency for display
export function formatCurrency(
  amount: number, 
  currency: string
): string {
  const formatters: { [key: string]: Intl.NumberFormat } = {
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }),
    ARS: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }),
    BRL: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
  }

  const formatter = formatters[currency.toUpperCase()]
  return formatter ? formatter.format(amount) : `${amount} ${currency}`
}

// Rate limit helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }
  
  if (record.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  // Increment count
  record.count++
  return { 
    allowed: true, 
    remaining: limit - record.count, 
    resetTime: record.resetTime 
  }
}

// Clean up old rate limit records
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 300000) // Clean up every 5 minutes

// CORS headers
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
}

// Health check utilities
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: 'up' | 'down' | 'unknown'
    binance: 'up' | 'down' | 'unknown'
    cache: 'up' | 'down' | 'unknown'
  }
  uptime: number
  version: string
}

const startTime = Date.now()

export function getHealthStatus(): HealthStatus {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'up', // Would check Supabase connection
      binance: 'up',   // Would check Binance API
      cache: 'up'      // Would check Redis/memory cache
    },
    uptime: Date.now() - startTime,
    version: '1.0.0'
  }
}