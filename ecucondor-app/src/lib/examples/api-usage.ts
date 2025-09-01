// Examples of how to use the Exchange Rate APIs

/**
 * Example 1: Get all current exchange rates
 */
export async function getAllRates() {
  try {
    const response = await fetch('/api/rates')
    const data = await response.json()
    
    if (data.success) {
      console.log('All rates:', data.data)
      return data.data
    } else {
      console.error('Error:', data.error)
    }
  } catch (error) {
    console.error('Failed to fetch rates:', error)
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
      console.log(`${pair} rate:`, data.data)
      return data.data
    } else {
      console.error('Error:', data.error)
    }
  } catch (error) {
    console.error(`Failed to fetch ${pair} rate:`, error)
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
      
      console.log(`Selling ${amount} ${pair.split('-')[0]}:`)
      console.log(`Rate: ${rate.sell_rate}`)
      console.log(`You'll receive: ${transaction.target_amount} ${pair.split('-')[1]}`)
      console.log(`Commission: ${transaction.commission}`)
      console.log(`Total cost: ${transaction.total_cost}`)
      
      return data.data
    } else {
      console.error('Error:', data.error)
    }
  } catch (error) {
    console.error('Failed to calculate sell transaction:', error)
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
      
      console.log(`Buying ${transaction.base_amount} ${pair.split('-')[0]}:`)
      console.log(`Rate: ${rate.buy_rate}`)
      console.log(`You need: ${amount} ${pair.split('-')[1]}`)
      console.log(`Commission: ${transaction.commission}`)
      
      return data.data
    } else {
      console.error('Error:', data.error)
    }
  } catch (error) {
    console.error('Failed to calculate buy transaction:', error)
  }
}

/**
 * Example 5: Real-time rates using Server-Sent Events (SSE)
 */
export function subscribeToAllRates(callback: (rates: unknown[]) => void) {
  const eventSource = new EventSource('/api/rates/stream')
  
  eventSource.onopen = () => {
    console.log('📡 Connected to rates stream')
  }
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'connected':
          console.log('✅ Stream connected:', data.message)
          break
          
        case 'rates_update':
          console.log('📊 Rates updated:', data.data)
          callback(data.data)
          break
          
        case 'heartbeat':
          console.log('💓 Heartbeat:', data.timestamp)
          break
          
        case 'error':
          console.error('❌ Stream error:', data.error)
          break
      }
    } catch (error) {
      console.error('Failed to parse SSE data:', error)
    }
  }
  
  eventSource.onerror = (error) => {
    console.error('❌ SSE connection error:', error)
  }
  
  // Return cleanup function
  return () => {
    eventSource.close()
    console.log('🔌 Disconnected from rates stream')
  }
}

/**
 * Example 6: Subscribe to specific currency pair
 */
export function subscribeToSpecificRate(
  pair: string,
  callback: (rate: unknown) => void
) {
  const eventSource = new EventSource(`/api/rates/${pair}/stream`)
  
  eventSource.onopen = () => {
    console.log(`📡 Connected to ${pair} stream`)
  }
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'connected':
          console.log(`✅ Connected to ${pair}:`, data.message)
          break
          
        case 'initial_rate':
        case 'rate_update':
          console.log(`📊 ${pair} updated:`, data.data)
          callback(data.data)
          break
          
        case 'heartbeat':
          console.log(`💓 ${pair} heartbeat:`, data.timestamp)
          break
          
        case 'error':
          console.error(`❌ ${pair} error:`, data.error)
          break
      }
    } catch (error) {
      console.error('Failed to parse SSE data:', error)
    }
  }
  
  eventSource.onerror = (error) => {
    console.error(`❌ ${pair} SSE error:`, error)
  }
  
  // Return cleanup function
  return () => {
    eventSource.close()
    console.log(`🔌 Disconnected from ${pair} stream`)
  }
}

/**
 * Example 7: Health check
 */
export async function checkApiHealth() {
  try {
    const response = await fetch('/api/health?detailed=true')
    const data = await response.json()
    
    console.log('API Health:', data.status)
    console.log('Services:', data.checks)
    
    return data
  } catch (error) {
    console.error('Health check failed:', error)
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
  console.log('🎯 Running business logic simulation...')
  
  // Simulation 1: Client with 100 USD needs pesos
  console.log('\n💰 Simulation 1: Client sells 100 USD')
  const sell100USD = await calculateSellTransaction('USD-ARS', 100)
  
  // Simulation 2: Client with 150,000 ARS needs dollars  
  console.log('\n💰 Simulation 2: Client buys USD with 150,000 ARS')
  const buy150kARS = await calculateBuyTransaction('USD-ARS', 150000)

  return { sell100USD, buy150kARS }
}