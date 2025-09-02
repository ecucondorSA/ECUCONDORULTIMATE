import { logger } from '@/lib/utils/logger';
// Examples of how to use the Exchange Rate APIs
import { ExchangeRate } from '@/lib/types'

/**
 * Example 1: Get all current exchange rates
 */
export async function getAllRates() {
  try {
    const response = await fetch('/api/rates')
    const data = await response.json()
    
    if (data.success) {
      logger.info('All rates:', data.data)
      return data.data
    } else {
      logger.error('Error:', data.error)
    }
  } catch (error) {
    logger.error('Failed to fetch rates:', error)
  }
}

/**
 * Example 2: Get specific currency pair rate
 */
export async function getSpecificRate(pair: string) {
  try {
    const response = await fetch(`/api/rates/${pair}`)
    const data = await response.json()
    
    if (data.success) {
      logger.info(`${pair} rate:`, data.data)
      return data.data
    } else {
      logger.error('Error:', data.error)
    }
  } catch (error) {
    logger.error(`Failed to fetch ${pair} rate:`, error)
  }
}

/**
 * Example 3: Calculate sell transaction (client sells USD to Ecucondor)
 */
export async function calculateSellTransaction(pair: string, amount: number) {
  try {
    const response = await fetch(`/api/rates/${pair}/sell?amount=${amount}`)
    const data = await response.json()
    
    if (data.success) {
      const { rate, transaction } = data.data
      
      logger.info(`Selling ${amount} ${pair.split('-')[0]}:`)
      logger.info(`Rate: ${rate.sell_rate}`)
      logger.info(`You'll receive: ${transaction.target_amount} ${pair.split('-')[1]}`)
      logger.info(`Commission: ${transaction.commission}`)
      logger.info(`Total cost: ${transaction.total_cost}`)
      
      return data.data
    } else {
      logger.error('Error:', data.error)
    }
  } catch (error) {
    logger.error('Failed to calculate sell transaction:', error)
  }
}

/**
 * Example 4: Calculate buy transaction (client buys USD from Ecucondor)
 */
export async function calculateBuyTransaction(pair: string, amount: number) {
  try {
    const response = await fetch(`/api/rates/${pair}/buy?amount=${amount}`)
    const data = await response.json()
    
    if (data.success) {
      const { rate, transaction } = data.data
      
      logger.info(`Buying ${transaction.base_amount} ${pair.split('-')[0]}:`)
      logger.info(`Rate: ${rate.buy_rate}`)
      logger.info(`You need: ${amount} ${pair.split('-')[1]}`)
      logger.info(`Commission: ${transaction.commission}`)
      
      return data.data
    } else {
      logger.error('Error:', data.error)
    }
  } catch (error) {
    logger.error('Failed to calculate buy transaction:', error)
  }
}

/**
 * Example 5: Real-time rates using Server-Sent Events (SSE)
 */
export function subscribeToAllRates(callback: (rates: ExchangeRate[]) => void) {
  const eventSource = new EventSource('/api/rates/stream')
  
  eventSource.onopen = () => {
    logger.info('📡 Connected to rates stream')
  }
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'connected':
          logger.info('✅ Stream connected:', data.message)
          break
          
        case 'rates_update':
          logger.info('📊 Rates updated:', data.data)
          callback(data.data)
          break
          
        case 'heartbeat':
          logger.info('💓 Heartbeat:', data.timestamp)
          break
          
        case 'error':
          logger.error('❌ Stream error:', data.error)
          break
      }
    } catch (error) {
      logger.error('Failed to parse SSE data:', error)
    }
  }
  
  eventSource.onerror = (error) => {
    logger.error('❌ SSE connection error:', error)
  }
  
  // Return cleanup function
  return () => {
    eventSource.close()
    logger.info('🔌 Disconnected from rates stream')
  }
}

/**
 * Example 6: Subscribe to specific currency pair
 */
export function subscribeToSpecificRate(
  pair: string,
  callback: (rate: ExchangeRate) => void
) {
  const eventSource = new EventSource(`/api/rates/${pair}/stream`)
  
  eventSource.onopen = () => {
    logger.info(`📡 Connected to ${pair} stream`)
  }
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'connected':
          logger.info(`✅ Connected to ${pair}:`, data.message)
          break
          
        case 'initial_rate':
        case 'rate_update':
          logger.info(`📊 ${pair} updated:`, data.data)
          callback(data.data)
          break
          
        case 'heartbeat':
          logger.info(`💓 ${pair} heartbeat:`, data.timestamp)
          break
          
        case 'error':
          logger.error(`❌ ${pair} error:`, data.error)
          break
      }
    } catch (error) {
      logger.error('Failed to parse SSE data:', error)
    }
  }
  
  eventSource.onerror = (error) => {
    logger.error(`❌ ${pair} SSE error:`, error)
  }
  
  // Return cleanup function
  return () => {
    eventSource.close()
    logger.info(`🔌 Disconnected from ${pair} stream`)
  }
}

/**
 * Example 7: Health check
 */
export async function checkApiHealth() {
  try {
    const response = await fetch('/api/health?detailed=true')
    const data = await response.json()
    
    logger.info('API Health:', data.status)
    logger.info('Services:', data.checks)
    
    return data
  } catch (error) {
    logger.error('Health check failed:', error)
  }
}

/**
 * Example 8: Complete usage example in a React component
 */
export const ExampleUsage = `
import React, { useState, useEffect } from 'react'
import { 
  getAllRates, 
  calculateSellTransaction, 
  subscribeToSpecificRate 
} from '@/lib/examples/api-usage'

export default function ExchangeCalculator() {
  const [rates, setRates] = useState([])
  const [selectedPair, setSelectedPair] = useState('USD-ARS')
  const [amount, setAmount] = useState(100)
  const [transaction, setTransaction] = useState(null)
  
  // Load initial rates
  useEffect(() => {
    getAllRates().then(rates => {
      if (rates) setRates(rates)
    })
  }, [])
  
  // Subscribe to real-time updates for selected pair
  useEffect(() => {
    const unsubscribe = subscribeToSpecificRate(selectedPair, (updatedRate) => {
      setRates(prev => prev.map(rate => 
        rate.pair === selectedPair ? updatedRate : rate
      ))
    })
    
    return unsubscribe
  }, [selectedPair])
  
  // Calculate transaction when amount changes
  useEffect(() => {
    if (amount > 0) {
      calculateSellTransaction(selectedPair, amount).then(setTransaction)
    }
  }, [selectedPair, amount])
  
  return (
    <div>
      <h2>Exchange Calculator</h2>
      
      <select 
        value={selectedPair} 
        onChange={e => setSelectedPair(e.target.value)}
      >
        {rates.map(rate => (
          <option key={rate.pair} value={rate.pair}>
            {rate.pair}
          </option>
        ))}
      </select>
      
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
        placeholder="Amount"
      />
      
      {transaction && (
        <div>
          <p>You'll receive: {transaction.transaction.target_amount}</p>
          <p>Commission: {transaction.transaction.commission}</p>
          <p>Rate: {transaction.rate.sell_rate}</p>
        </div>
      )}
    </div>
  )
}
`

/**
 * Example 9: Business logic simulation (matching user requirements)
 */
export async function simulateTransactions() {
  logger.info('🎯 Running business logic simulation...')
  
  // Simulation 1: Client with 100 USD needs pesos
  logger.info('\n💰 Simulation 1: Client sells 100 USD')
  const sell100USD = await calculateSellTransaction('USD-ARS', 100)
  
  // Simulation 2: Client with 150,000 ARS needs dollars  
  logger.info('\n💰 Simulation 2: Client buys USD with 150,000 ARS')
  const buy150kARS = await calculateBuyTransaction('USD-ARS', 150000)
  
  return { sell100USD, buy150kARS }
}