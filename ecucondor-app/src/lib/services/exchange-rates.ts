import { ExchangeRate, RateConfig, Currency } from '@/lib/types'
import { BinanceService } from './binance'
import { logger } from '@/lib/utils/logger'

export class ExchangeRateService {
  private static instance: ExchangeRateService
  private binanceService: BinanceService
  private rates: Map<string, ExchangeRate> = new Map()
  
  // Configuration for each currency pair
  private readonly rateConfigs: RateConfig[] = [
    {
      pair: 'USD-ARS',
      source_symbol: 'USDTARS',
      sell_adjustment: -20,    // Ecucondor sells USD: binance - 20
      buy_adjustment: 50,      // Ecucondor buys USD: binance + 50  
      commission_sell: 0.03,   // 3% commission when selling USD->ARS
      commission_buy: 0        // 0% commission when buying USD (ARS->USD)
    },
    {
      pair: 'USD-BRL',
      source_symbol: 'USDTBRL',
      sell_adjustment: -0.05,  // Small adjustment for BRL
      buy_adjustment: 0.10,    // Small adjustment for BRL
      commission_sell: 0.02,   // 2% commission USD->BRL
      commission_buy: 0        // 0% commission BRL->USD
    },
  ]

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService()
    }
    return ExchangeRateService.instance
  }

  constructor() {
    this.binanceService = BinanceService.getInstance()
  }

  /**
   * Update all exchange rates from sources
   */
  async updateRates(): Promise<Map<string, ExchangeRate>> {
    logger.info('Updating exchange rates...')
    
    // Get all Binance symbols we need
    const binanceSymbols = this.rateConfigs
      .filter(config => config.source_symbol)
      .map(config => config.source_symbol!)

    // Fetch prices from Binance
    const binancePrices = await this.binanceService.getMultiplePrices(binanceSymbols)
    
    // Calculate rates for each pair
    for (const config of this.rateConfigs) {
      try {
        const rate = await this.calculateRate(config, binancePrices)
        this.rates.set(config.pair, rate)
        logger.info(`Updated ${config.pair}`, { sell: rate.sell_rate, buy: rate.buy_rate })
      } catch (error) {
        logger.error(`Failed to calculate rate for ${config.pair}`, error)
      }
    }

    // Calculate cross rates (ARS-BRL, etc.)
    this.calculateCrossRates()

    return this.rates
  }

  /**
   * Calculate rate for a specific pair
   */
  private async calculateRate(
    config: RateConfig, 
    binancePrices: { [symbol: string]: { price: number } | null }
  ): Promise<ExchangeRate> {
    let basePrice: number
    let source: 'binance' | 'fixed' | 'calculated' = 'fixed'

    if (config.source_symbol) {
      // Get from Binance
      const binancePrice = binancePrices[config.source_symbol]
      if (!binancePrice) {
        throw new Error(`No price available for ${config.source_symbol}`)
      }
      basePrice = binancePrice.price
      source = 'binance'
    } else {
      // Fixed rate (like USD-ECU = 1.00)
      basePrice = 1.00
      source = 'fixed'
    }

    // Calculate sell and buy rates based on Ecucondor's business logic
    const sellRate = basePrice + config.sell_adjustment  // What Ecucondor charges to sell base currency
    const buyRate = basePrice + config.buy_adjustment    // What Ecucondor pays to buy base currency
    const spread = buyRate - sellRate

    const [baseCurrency, targetCurrency] = config.pair.split('-') as [Currency, Currency]

    return {
      id: `rate_${config.pair.toLowerCase().replace('-', '_')}_${Date.now()}`,
      pair: config.pair,
      base_currency: baseCurrency,
      target_currency: targetCurrency,
      binance_rate: source === 'binance' ? basePrice : undefined,
      sell_rate: Math.round(sellRate * 100) / 100, // Round to 2 decimals
      buy_rate: Math.round(buyRate * 100) / 100,
      spread: Math.round(spread * 100) / 100,
      commission_rate: config.commission_sell, // Default to sell commission
      last_updated: new Date().toISOString(),
      source
    }
  }

  /**
   * Calculate cross rates like ARS-BRL
   */
  private calculateCrossRates(): void {
    const usdArs = this.rates.get('USD-ARS')
    const usdBrl = this.rates.get('USD-BRL')

    if (usdArs && usdBrl) {
      // ARS to BRL: divide BRL rate by ARS rate
      const arsBrlSell = usdBrl.sell_rate / usdArs.sell_rate
      const arsBrlBuy = usdBrl.buy_rate / usdArs.buy_rate

      const arsBrlRate: ExchangeRate = {
        id: `rate_ars_brl_${Date.now()}`,
        pair: 'ARS-BRL',
        base_currency: 'ARS',
        target_currency: 'BRL',
        sell_rate: Math.round(arsBrlSell * 10000) / 10000, // More decimals for cross rates
        buy_rate: Math.round(arsBrlBuy * 10000) / 10000,
        spread: Math.round((arsBrlBuy - arsBrlSell) * 10000) / 10000,
        commission_rate: 0.015, // 1.5% for cross rates
        last_updated: new Date().toISOString(),
        source: 'calculated'
      }

      this.rates.set('ARS-BRL', arsBrlRate)
      logger.info('Calculated cross rate ARS-BRL', { rate: arsBrlSell })
    }
  }

  /**
   * Get specific rate by pair
   */
  getRate(pair: string): ExchangeRate | null {
    return this.rates.get(pair) || null
  }

  /**
   * Get all current rates
   */
  getAllRates(): ExchangeRate[] {
    return Array.from(this.rates.values())
  }

  /**
   * Calculate transaction amounts
   */
  calculateTransaction(
    pair: string,
    amount: number,
    type: 'buy' | 'sell'
  ): {
    base_amount: number
    target_amount: number
    rate_used: number
    commission: number
    total_cost: number
  } | null {
    const rate = this.getRate(pair)
    if (!rate) return null

    const rateUsed = type === 'sell' ? rate.sell_rate : rate.buy_rate
    const commissionRate = type === 'sell' ? rate.commission_rate : 0

    let baseAmount: number, targetAmount: number

    if (type === 'sell') {
      // Client sells base currency to Ecucondor
      baseAmount = amount
      targetAmount = amount * rateUsed
      const commission = targetAmount * commissionRate
      
      return {
        base_amount: baseAmount,
        target_amount: targetAmount - commission,
        rate_used: rateUsed,
        commission,
        total_cost: targetAmount
      }
    } else {
      // Client buys base currency from Ecucondor  
      targetAmount = amount
      baseAmount = amount / rateUsed
      const commission = 0 // No commission on buy operations
      
      return {
        base_amount: baseAmount,
        target_amount: targetAmount,
        rate_used: rateUsed,
        commission,
        total_cost: amount
      }
    }
  }

  /**
   * Get rate configuration
   */
  getRateConfig(pair: string): RateConfig | null {
    return this.rateConfigs.find(config => config.pair === pair) || null
  }

  /**
   * Health check - verify all rates are fresh
   */
  isHealthy(): boolean {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    for (const rate of this.rates.values()) {
      const lastUpdated = new Date(rate.last_updated).getTime()
      if (now - lastUpdated > maxAge) {
        return false
      }
    }

    return this.rates.size > 0
  }
}