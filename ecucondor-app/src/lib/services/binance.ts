import { logger } from '@/lib/utils/logger';
import { BinancePrice } from '@/lib/types'

// Removed unused BinanceApiResponse interface

interface BinanceOrderBook {
  symbol: string
  bids: [string, string][] // [price, quantity]
  asks: [string, string][] // [price, quantity]
}

export class BinanceService {
  private static instance: BinanceService
  private cache: Map<string, { price: BinancePrice; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds

  static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService()
    }
    return BinanceService.instance
  }

  /**
   * Get average price from Binance API
   */
  async getBinancePrice(symbol: string): Promise<BinancePrice | null> {
    // Check cache first
    const cached = this.cache.get(symbol)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.price
    }

    try {
      // Try Binance API first
      const price = await this.fetchFromApi(symbol)
      if (price) {
        this.cache.set(symbol, { price, timestamp: Date.now() })
        return price
      }

      // Fallback to web scraping
      const scrapedPrice = await this.scrapeFromWeb(symbol)
      if (scrapedPrice) {
        this.cache.set(symbol, { price: scrapedPrice, timestamp: Date.now() })
        return scrapedPrice
      }

      throw new Error('Both API and scraping failed')
    } catch (_error) {
      logger.error(`Failed to get price for ${symbol}:`, _error)
      return null
    }
  }

  /**
   * Try to get price from Binance API, with CoinGecko fallback
   */
  private async fetchFromApi(symbol: string): Promise<BinancePrice | null> {
    try {
      // Try Binance first
      const orderBookResponse = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=5`,
        { signal: AbortSignal.timeout(5000) }
      )
      
      if (!orderBookResponse.ok) {
        throw new Error(`Binance API failed: ${orderBookResponse.status}`)
      }

      const orderBook: BinanceOrderBook = await orderBookResponse.json()
      
      // Calculate average price from best bid and ask
      const bestBid = parseFloat(orderBook.bids[0]?.[0] || '0')
      const bestAsk = parseFloat(orderBook.asks[0]?.[0] || '0')
      
      if (bestBid === 0 || bestAsk === 0) {
        throw new Error('Invalid order book data')
      }

      const averagePrice = (bestBid + bestAsk) / 2

      return {
        symbol,
        price: averagePrice,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.warn(`Binance API failed for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Try CoinGecko as fallback
      try {
        return await this.fetchFromCoinGecko(symbol)
      } catch (cgError) {
        logger.error(`CoinGecko also failed for ${symbol}: ${cgError instanceof Error ? cgError.message : 'Unknown error'}`)
        return null
      }
    }
  }

  /**
   * Fallback: get price from CoinGecko API
   */
  private async fetchFromCoinGecko(symbol: string): Promise<BinancePrice | null> {
    try {
      logger.info(`🦎 Trying CoinGecko for ${symbol}`)
      
      // Map Binance symbols to CoinGecko pairs
      const cgPairs: { [key: string]: { id: string, vs_currency: string } } = {
        'USDTARS': { id: 'tether', vs_currency: 'ars' },
        'USDTBRL': { id: 'tether', vs_currency: 'brl' }
      }
      
      const pair = cgPairs[symbol]
      if (!pair) {
        throw new Error(`Symbol ${symbol} not supported by CoinGecko fallback`)
      }
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${pair.id}&vs_currencies=${pair.vs_currency}`,
        { 
          signal: AbortSignal.timeout(8000),
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`CoinGecko API failed: ${response.status}`)
      }
      
      const data = await response.json()
      const price = data[pair.id]?.[pair.vs_currency]
      
      if (!price || price === 0) {
        throw new Error('Invalid CoinGecko price data')
      }
      
      logger.info(`✅ CoinGecko price for ${symbol}: ${price}`)
      
      return {
        symbol,
        price,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error(`CoinGecko failed for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Fallback: scrape from Binance web page
   */
  private async scrapeFromWeb(symbol: string): Promise<BinancePrice | null> {
    try {
      // Convert symbol format: USDTARS -> USDT_ARS
      const pairFormat = this.convertSymbolToPair(symbol)
      const url = `https://www.binance.com/es-AR/trade/${pairFormat}?type=spot`
      
      logger.info(`Scraping from: ${url}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        throw new Error('Web scraping request failed')
      }

      const html = await response.text()
      
      // Look for price in the HTML using regex patterns
      // This is a simplified approach - in production, you'd want more robust parsing
      const pricePatterns = [
        /Precio medio[^0-9]*?≈?\s*([0-9,]+\.?[0-9]*)/i,
        /"lastPrice":"([0-9]+\.?[0-9]*)"/,
        /data-bn-type="text"[^>]*>([0-9,]+\.?[0-9]*)</
      ]

      let price = 0
      for (const pattern of pricePatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          price = parseFloat(match[1].replace(/,/g, ''))
          if (price > 0) break
        }
      }

      if (price === 0) {
        throw new Error('Could not extract price from HTML')
      }

      return {
        symbol,
        price,
        timestamp: new Date().toISOString()
      }
    } catch (_error) {
      logger.error(`Web scraping failed for ${symbol}:`, _error)
      return null
    }
  }

  /**
   * Convert API symbol to web format
   * USDTARS -> USDT_ARS
   */
  private convertSymbolToPair(symbol: string): string {
    const pairs: { [key: string]: string } = {
      'USDTARS': 'USDT_ARS',
      'USDTBRL': 'USDT_BRL',
      'USDTUSD': 'USDT_USD'
    }
    return pairs[symbol] || symbol
  }

  /**
   * Get multiple prices concurrently
   */
  async getMultiplePrices(symbols: string[]): Promise<{ [symbol: string]: BinancePrice | null }> {
    const results = await Promise.allSettled(
      symbols.map(async symbol => ({
        symbol,
        price: await this.getBinancePrice(symbol)
      }))
    )

    const prices: { [symbol: string]: BinancePrice | null } = {}
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        prices[result.value.symbol] = result.value.price
      } else {
        prices[symbols[index]] = null
      }
    })

    return prices
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }
}