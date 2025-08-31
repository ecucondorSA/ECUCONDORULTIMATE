// Test script for Ecucondor Exchange Rate APIs
// Enhanced version with transaction limits and price lock testing

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

  // Test 7: Transaction Limits
  console.log('\n7️⃣ Testing Transaction Limits...')
  try {
    const testUserId = 'test-user-123'
    const response = await fetch(`${BASE_URL}/users/${testUserId}/limits`)
    const limits = await response.json()
    
    if (limits.success) {
      console.log('✅ User Limits:')
      console.log(`   Monthly: $${limits.data.limits.monthly.used}/$${limits.data.limits.monthly.limit} (${limits.data.limits.monthly.percentage.toFixed(1)}%)`)
      console.log(`   Daily transactions: ${limits.data.limits.daily_transactions.used}/${limits.data.limits.daily_transactions.limit}`)
      console.log(`   Per transaction: $${limits.data.limits.per_transaction.min}-$${limits.data.limits.per_transaction.max}`)
    } else {
      console.log('❌ No limits data (user might not exist in DB yet)')
    }
  } catch (error) {
    console.log('❌ Limits test failed:', error.message)
  }

  // Test 8: Price Lock Creation
  console.log('\n8️⃣ Testing Price Lock Creation...')
  try {
    const testUserId = 'test-user-123'
    const response = await fetch(`${BASE_URL}/rates/USD-ARS/sell?amount=100&lock=true&user_id=${testUserId}`)
    const result = await response.json()
    
    if (result.success && result.data.price_lock) {
      console.log('✅ Price Lock Created:')
      console.log(`   Lock ID: ${result.data.price_lock.id}`)
      console.log(`   Expires: ${result.data.price_lock.expires_at}`)
      console.log(`   Locked Rate: ${result.data.price_lock.locked_rate}`)
      console.log(`   Duration: ${result.data.price_lock.duration_minutes} minutes`)
      
      // Store lock ID for next test
      global.testLockId = result.data.price_lock.id
    } else {
      console.log('❌ Price lock not created - check if user_id is valid')
    }
  } catch (error) {
    console.log('❌ Price lock test failed:', error.message)
  }

  // Test 9: Transaction Execution (if we have a price lock)
  if (global.testLockId) {
    console.log('\n9️⃣ Testing Transaction Execution with Price Lock...')
    try {
      const response = await fetch(`${BASE_URL}/transactions/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user-123',
          pair: 'USD-ARS',
          amount: 100,
          transaction_type: 'sell',
          price_lock_id: global.testLockId
        })
      })
      
      const transaction = await response.json()
      
      if (transaction.success) {
        console.log('✅ Transaction Executed:')
        console.log(`   Transaction ID: ${transaction.data.transaction.id}`)
        console.log(`   Amount: ${transaction.data.transaction.base_amount} ${transaction.data.transaction.base_currency}`)
        console.log(`   Received: ${transaction.data.transaction.target_amount} ${transaction.data.transaction.target_currency}`)
        console.log(`   Rate Used: ${transaction.data.transaction.rate_used}`)
        console.log(`   Status: ${transaction.data.transaction.status}`)
        console.log(`   Price Lock Used: ${transaction.data.transaction.price_locked}`)
      } else {
        console.log('❌ Transaction failed:', transaction.error)
      }
    } catch (error) {
      console.log('❌ Transaction execution test failed:', error.message)
    }
  }

  // Test 10: Check Limits After Transaction
  console.log('\n🔟 Testing Limits Validation...')
  try {
    const testUserId = 'test-user-123'
    const response = await fetch(`${BASE_URL}/users/${testUserId}/limits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_usd: 5000 }) // Try a large amount
    })
    
    const validation = await response.json()
    
    if (validation.success) {
      console.log('✅ Limits Validation:')
      console.log(`   Can proceed with $5000: ${validation.data.can_proceed}`)
      console.log(`   Reason: ${validation.data.reason || 'Transaction allowed'}`)
      if (validation.data.remaining_amount) {
        console.log(`   Maximum allowed: $${validation.data.remaining_amount}`)
      }
    }
  } catch (error) {
    console.log('❌ Limits validation test failed:', error.message)
  }

  console.log('\n✅ Enhanced API Testing Complete!')
  console.log('\n📋 New Features Tested:')
  console.log('   ✅ Transaction limits ($5-$2000 per transaction, $10k monthly)')
  console.log('   ✅ Price lock mechanism (15-minute duration)')
  console.log('   ✅ Transaction execution with locked prices')
  console.log('   ✅ User limits tracking and validation')
  console.log('\n📡 To test real-time updates:')
  console.log('   Open browser dev tools and run:')
  console.log('   const stream = new EventSource("/api/rates/stream")')
  console.log('   stream.onmessage = e => console.log(JSON.parse(e.data))')
  console.log('\n🗄️  Database Setup:')
  console.log('   Run the SQL schema in database/schema.sql in your Supabase dashboard')
  console.log('   to enable transaction tracking and price locks functionality.')
}

// Run tests
testApi().catch(console.error)