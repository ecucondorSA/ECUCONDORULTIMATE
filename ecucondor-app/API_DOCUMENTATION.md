# 📊 Ecucondor Exchange Rate API Documentation

Complete API documentation for the Ecucondor currency exchange platform.

## 🏗️ Architecture Overview

The API is built using **Next.js 15** with App Router and provides:
- **REST endpoints** for synchronous rate queries
- **Server-Sent Events (SSE)** for real-time updates
- **Binance integration** for live market data
- **Business logic** with spreads and commissions

## 🔄 Business Logic

### Rate Calculation
- **Source**: Binance USDT/ARS and USDT/BRL markets
- **USD-ARS Sell Rate**: `binance_price - 20` (Ecucondor sells USD to client)
- **USD-ARS Buy Rate**: `binance_price + 50` (Ecucondor buys USD from client)
- **Spread**: 70 pesos (buy_rate - sell_rate)

### Commissions
- **USD → ARS**: 3% commission
- **ARS → USD**: 0% commission
- **USD ↔ BRL**: 2% / 0% respectively
- **USD ↔ ECU**: 1% / 0% respectively

---

## 📡 REST API Endpoints

### Base URL
```
Development: http://localhost:3000/api
Production: https://ecucondor.com/api
```

---

## 1. Get All Exchange Rates

**GET** `/api/rates`

Returns all available currency exchange rates.

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `refresh` | boolean | Force refresh from Binance |

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "rate_usd_ars_1693526400000",
      "pair": "USD-ARS",
      "base_currency": "USD",
      "target_currency": "ARS",
      "binance_rate": 1370.4,
      "sell_rate": 1350.4,
      "buy_rate": 1420.4,
      "spread": 70,
      "commission_rate": 0.03,
      "last_updated": "2025-08-31T20:45:00Z",
      "source": "binance"
    }
  ],
  "count": 4,
  "timestamp": "2025-08-31T20:45:00Z"
}
```

### Examples
```bash
# Get all rates
curl https://ecucondor.com/api/rates

# Force refresh from Binance
curl https://ecucondor.com/api/rates?refresh=true
```

---

## 2. Get Specific Currency Pair

**GET** `/api/rates/{pair}`

Returns exchange rate for a specific currency pair.

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `pair` | string | Currency pair (e.g., "USD-ARS") |
| `type` | string | Transaction type: "buy" or "sell" |
| `amount` | number | Amount to calculate |

### Response
```json
{
  "success": true,
  "data": {
    "id": "rate_usd_ars_1693526400000",
    "pair": "USD-ARS",
    "sell_rate": 1350.4,
    "buy_rate": 1420.4,
    "spread": 70,
    "commission_rate": 0.03,
    "last_updated": "2025-08-31T20:45:00Z"
  },
  "timestamp": "2025-08-31T20:45:00Z"
}
```

### With Transaction Calculation
```bash
# Calculate selling 100 USD
curl "https://ecucondor.com/api/rates/USD-ARS?type=sell&amount=100"
```

```json
{
  "success": true,
  "data": {
    "rate": { /* rate object */ },
    "transaction": {
      "base_amount": 100,
      "target_amount": 130988.8,
      "rate_used": 1350.4,
      "commission": 4051.2,
      "total_cost": 135040,
      "type": "sell",
      "pair": "USD-ARS",
      "requested_amount": 100
    }
  }
}
```

---

## 3. Get Sell Rates

**GET** `/api/rates/{pair}/sell`

Get selling rate and calculate commission (when Ecucondor sells to client).

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `amount` | number | Optional: Amount to calculate |

### Response
```json
{
  "success": true,
  "data": {
    "pair": "USD-ARS",
    "type": "sell",
    "rate": 1350.4,
    "commission_rate": 0.03,
    "commission_info": {
      "rate": 0.03,
      "percentage": "3%"
    },
    "transaction": {
      "base_amount": 100,
      "target_amount": 130988.8,
      "commission": 4051.2,
      "description": "Sell 100 USD for 130988.8 ARS (after 3% commission)"
    }
  }
}
```

---

## 4. Get Buy Rates

**GET** `/api/rates/{pair}/buy`

Get buying rate (when Ecucondor buys from client, no commission).

### Response
```json
{
  "success": true,
  "data": {
    "pair": "USD-ARS",
    "type": "buy",
    "rate": 1420.4,
    "commission_rate": 0,
    "transaction": {
      "base_amount": 105.58,
      "target_amount": 150000,
      "commission": 0,
      "description": "Buy 105.58 USD for 150000 ARS"
    }
  }
}
```

---

## 5. Health Check

**GET** `/api/health`

Check API and service health.

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `detailed` | boolean | Include detailed service checks |

### Response
```json
{
  "status": "healthy",
  "timestamp": "2025-08-31T20:45:00Z",
  "uptime": 3600000,
  "checks": [
    {
      "service": "exchange_rates",
      "status": "up",
      "rates_count": 4,
      "last_update": "2025-08-31T20:44:30Z"
    },
    {
      "service": "binance",
      "status": "up",
      "last_price": 1370.4
    }
  ]
}
```

---

## 🎯 Real-Time Updates (SSE)

Server-Sent Events provide real-time rate updates without polling.

### 1. Subscribe to All Rates

**GET** `/api/rates/stream`

### JavaScript Example
```javascript
const eventSource = new EventSource('/api/rates/stream')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'connected':
      console.log('Connected to rates stream')
      break
      
    case 'rates_update':
      console.log('New rates:', data.data)
      updateUI(data.data)
      break
      
    case 'heartbeat':
      console.log('Connection alive')
      break
  }
}
```

### 2. Subscribe to Specific Pair

**GET** `/api/rates/{pair}/stream`

```javascript
const eventSource = new EventSource('/api/rates/USD-ARS/stream')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'rate_update') {
    console.log('USD-ARS updated:', data.data)
  }
}
```

### SSE Message Types

| Type | Description |
|------|-------------|
| `connected` | Connection established |
| `initial_rates` | Initial rates on connect |
| `rates_update` | New rate data available |
| `rate_update` | Single pair update |
| `heartbeat` | Keep-alive message |
| `error` | Error occurred |

---

## 💰 Supported Currency Pairs

| Pair | Source | Description |
|------|--------|-------------|
| `USD-ARS` | Binance USDT/ARS | US Dollar to Argentine Peso |
| `USD-BRL` | Binance USDT/BRL | US Dollar to Brazilian Real |
| `USD-ECU` | Fixed (1.00) | US Dollar to Ecuador Dollar |
| `ARS-BRL` | Calculated | Cross rate ARS to BRL |

---

## 🔧 Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Currency pair not found
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable

### Error Response Format
```json
{
  "success": false,
  "error": "Exchange rate for INVALID-PAIR not found",
  "details": "Supported pairs: USD-ARS, USD-BRL, USD-ECU, ARS-BRL",
  "timestamp": "2025-08-31T20:45:00Z"
}
```

---

## 🚀 Usage Examples

### 1. Simple Rate Check
```bash
curl https://ecucondor.com/api/rates/USD-ARS
```

### 2. Calculate Commission
```bash
curl "https://ecucondor.com/api/rates/USD-ARS/sell?amount=1000"
```

### 3. Real-time Updates
```javascript
// Subscribe to USD-ARS updates
const stream = new EventSource('/api/rates/USD-ARS/stream')
stream.onmessage = e => console.log(JSON.parse(e.data))
```

### 4. Transaction Simulation
```javascript
// Simulate business transactions
async function simulate() {
  // Client sells 100 USD
  const sell = await fetch('/api/rates/USD-ARS/sell?amount=100')
  const sellData = await sell.json()
  
  // Client buys USD with 150k ARS
  const buy = await fetch('/api/rates/USD-ARS/buy?amount=150000')
  const buyData = await buy.json()
  
  console.log('Ecucondor Profit:', {
    sellProfit: sellData.data.transaction.commission,
    buyProfit: buyData.data.transaction.base_amount * sellData.data.rate.binance_rate - buyData.data.transaction.target_amount
  })
}
```

---

## 🔒 Rate Limiting

- **100 requests per minute** per IP
- **Headers included** in responses:
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## 📊 Performance

- **Update Frequency**: Every 30 seconds from Binance
- **Cache TTL**: 30 seconds
- **SSE Heartbeat**: Every 15 seconds
- **Response Time**: < 100ms (cached), < 500ms (live)

---

## 🛠️ Development

### Local Development
```bash
cd ecucondor-app
npm run dev
# API available at http://localhost:3000/api
```

### Testing
```bash
# Test all endpoints
npm run test:api

# Health check
curl http://localhost:3000/api/health?detailed=true
```

---

## 📞 Support

- **Documentation**: This file
- **Health Check**: `/api/health`
- **GitHub Issues**: [Repository issues](https://github.com/ecucondorSA/ECUCONDORULTIMATE/issues)

---

*Last updated: August 2025*
*API Version: 1.0.0*