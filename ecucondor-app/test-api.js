// Test script for Ecucondor Exchange Rate APIs

const BASE_URL = 'http://localhost:3000/api'

async function testApi() {
  console.log('🧪 Testing Ecucondor Exchange Rate APIs\n')

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...')
  try {
    const response = await fetch(`${BASE_URL}/health?detailed=true`)
    const health = await response.json()
    console.log('✅ Health Status:', health.status)
    console.log('📊 Services:', health.checks?.map(c => `${c.service}: ${c.status}`).join(', '))
  } catch (error) {
    console.log('❌ Health check failed:', error.message)
  }

  // Test 2: Get All Rates
  console.log('\n2️⃣ Testing Get All Rates...')
  try {
    const response = await fetch(`${BASE_URL}/rates?refresh=true`)
    const rates = await response.json()
    
    if (rates.success) {
      console.log('✅ Fetched', rates.count, 'exchange rates')
      rates.data.forEach(rate => {
        console.log(`   ${rate.pair}: sell=${rate.sell_rate}, buy=${rate.buy_rate} (spread: ${rate.spread})`)
      })
    } else {
      console.log('❌ Failed to get rates:', rates.error)
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message)
  }

  // Test 3: Get Specific Pair
  console.log('\n3️⃣ Testing USD-ARS Rate...')
  try {
    const response = await fetch(`${BASE_URL}/rates/USD-ARS`)
    const rate = await response.json()
    
    if (rate.success) {
      console.log('✅ USD-ARS Rate:')
      console.log(`   Binance: ${rate.data.binance_rate}`)
      console.log(`   Sell: ${rate.data.sell_rate} (Ecucondor sells USD)`)
      console.log(`   Buy: ${rate.data.buy_rate} (Ecucondor buys USD)`)
      console.log(`   Spread: ${rate.data.spread} ARS`)
    }
  } catch (error) {
    console.log('❌ Pair test failed:', error.message)
  }

  // Test 4: Transaction Simulation (Sell 100 USD)
  console.log('\n4️⃣ Testing Transaction: Sell 100 USD...')
  try {
    const response = await fetch(`${BASE_URL}/rates/USD-ARS/sell?amount=100`)
    const transaction = await response.json()
    
    if (transaction.success) {
      const t = transaction.data.transaction
      console.log('✅ Client sells 100 USD:')
      console.log(`   Receives: ${t.target_amount} ARS`)
      console.log(`   Commission: ${t.commission} ARS (${transaction.data.commission_info.percentage})`)
      console.log(`   Net after commission: ${t.target_amount} ARS`)
      console.log(`   Ecucondor profit: ${t.commission} ARS`)
    }
  } catch (error) {
    console.log('❌ Sell transaction test failed:', error.message)
  }

  // Test 5: Transaction Simulation (Buy USD with 150k ARS)
  console.log('\n5️⃣ Testing Transaction: Buy USD with 150,000 ARS...')
  try {
    const response = await fetch(`${BASE_URL}/rates/USD-ARS/buy?amount=150000`)
    const transaction = await response.json()
    
    if (transaction.success) {
      const t = transaction.data.transaction
      console.log('✅ Client buys USD with 150,000 ARS:')
      console.log(`   Receives: ${t.base_amount} USD`)
      console.log(`   Commission: ${t.commission} (${transaction.data.commission_rate * 100}%)`)
      console.log(`   Rate used: ${t.rate_used}`)
      
      // Calculate Ecucondor profit
      const binanceResponse = await fetch(`${BASE_URL}/rates/USD-ARS`)
      const binanceData = await binanceResponse.json()
      if (binanceData.success) {
        const binanceRate = binanceData.data.binance_rate
        const ecucondorCost = t.base_amount * binanceRate
        const ecucondorReceived = 150000
        const profit = ecucondorReceived - ecucondorCost
        console.log(`   Ecucondor profit: ${profit.toFixed(2)} ARS`)
      }
    }
  } catch (error) {
    console.log('❌ Buy transaction test failed:', error.message)
  }

  // Test 6: Cross Rate (ARS-BRL)
  console.log('\n6️⃣ Testing Cross Rate ARS-BRL...')
  try {
    const response = await fetch(`${BASE_URL}/rates/ARS-BRL`)
    const rate = await response.json()
    
    if (rate.success) {
      console.log('✅ ARS-BRL Cross Rate:')
      console.log(`   Sell: ${rate.data.sell_rate} BRL per ARS`)
      console.log(`   Buy: ${rate.data.buy_rate} BRL per ARS`)
      console.log(`   Source: ${rate.data.source}`)
    }
  } catch (error) {
    console.log('❌ Cross rate test failed:', error.message)
  }

  console.log('\n✅ API Testing Complete!')
  console.log('\n📡 To test real-time updates:')
  console.log('   Open browser dev tools and run:')
  console.log('   const stream = new EventSource("/api/rates/stream")')
  console.log('   stream.onmessage = e => console.log(JSON.parse(e.data))')
}

// Run tests
testApi().catch(console.error)
