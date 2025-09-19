'use client';
import { logger } from '@/lib/utils/logger';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useOptimizedExchangeRates } from '@/hooks/useOptimizedExchangeRates';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExchangeRate, CURRENCY_FLAGS, CurrencyPair } from '@/lib/types/calculator';
import { parseAmount, formatNumber, calculateSendToReceive, getCurrencies } from '@/lib/utils/calculator-utils';

interface InlineCalculatorProps {
  className?: string;
}

function InlineCalculator({ className = '' }: InlineCalculatorProps) {
  // Use SSE optimized hook for real-time rates
  const { rates: sseRates, loading: ratesLoading, connectionStatus } = useOptimizedExchangeRates();
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('USD-ARS');
  const [sendAmount, setSendAmount] = useState('100');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Transform SSE rates to calculator format
  const rates: ExchangeRate[] = useMemo(() => {
    return sseRates.map((rate, index) => {
      const baseRate = parseFloat(rate.rate.replace(/[^0-9.]/g, ''));
      const currencies = getCurrencies(rate.pair as CurrencyPair);
      
      return {
        id: `${rate.pair}-${index}`,
        pair: rate.pair as CurrencyPair,
        base_currency: currencies.from,
        target_currency: currencies.to,
        binance_rate: baseRate,
        sell_rate: baseRate,
        buy_rate: baseRate + (baseRate * 0.02), // 2% margin
        spread: baseRate * 0.02,
        commission_rate: 0.005, // 0.5% commission
        last_updated: rate.lastUpdate.toISOString(),
        source: (rate.source === 'binance' || rate.source === 'calculated') ? rate.source : 'binance' as const
      };
    });
  }, [sseRates]);

  // Get current rate and currencies
  const selectedRate = useMemo(() => {
    return rates.find(rate => rate.pair === selectedPair) || null;
  }, [rates, selectedPair]);

  const currencies = useMemo(() => getCurrencies(selectedPair), [selectedPair]);

  // Calculate conversion when amount or pair changes
  useEffect(() => {
    if (!selectedRate || !sendAmount) {
      setReceiveAmount('');
      return;
    }

    setIsCalculating(true);
    const numAmount = parseAmount(sendAmount);
    
    if (numAmount > 0) {
      // Determine transaction type based on which currency is being sent
      const [fromCurrency] = selectedPair.split('-');
      const isSellingBaseCurrency = fromCurrency === currencies.from;
      const transactionType = isSellingBaseCurrency ? 'sell' : 'buy';
      
      const converted = calculateSendToReceive(numAmount, selectedRate, transactionType, selectedPair);
      setReceiveAmount(formatNumber(converted));
    } else {
      setReceiveAmount('');
    }
    
    setTimeout(() => setIsCalculating(false), 300);
  }, [sendAmount, selectedRate, selectedPair, currencies]);

  const handleAmountChange = useCallback((value: string) => {
    // Allow only numbers, dots, and commas
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    setSendAmount(cleanValue);
  }, []);

  const handlePairChange = useCallback((pair: CurrencyPair) => {
    setSelectedPair(pair);
    setSendAmount('100'); // Reset to default amount
  }, []);

  // Use appropriate rate based on transaction direction
  // For USD-ARS: sell_rate when client sells USD, buy_rate when client buys USD
  const rate = useMemo(() => {
    if (!selectedRate) return 0;
    
    // For display purposes, show the rate the client would get
    // If they're sending USD (selling USD to us), show sell_rate
    // If they're sending ARS (buying USD from us), show buy_rate
    const [fromCurrency] = selectedPair.split('-');
    const isSellingBaseCurrency = fromCurrency === currencies.from;
    
    return isSellingBaseCurrency ? selectedRate.sell_rate : selectedRate.buy_rate;
  }, [selectedRate, selectedPair, currencies]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          💱 Calculadora Rápida
        </h3>
        <div className="flex items-center gap-2 text-sm text-ecucondor-yellow">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          En Tiempo Real
        </div>
      </div>

      {/* Currency Pair Selection */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['USD-ARS', 'USD-BRL', 'ARS-BRL'] as const).map((pair) => (
          <button
            key={pair}
            onClick={() => handlePairChange(pair)}
            className={`p-2 rounded-lg text-center transition-all text-sm font-medium ${
              selectedPair === pair
                ? 'bg-ecucondor-yellow text-ecucondor-primary'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            {pair}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Envías {currencies.from}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
              {CURRENCY_FLAGS[currencies.from]}
            </div>
            <input
              type="text"
              value={sendAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="100"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Recibes {currencies.to}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
              {CURRENCY_FLAGS[currencies.to]}
            </div>
            <div className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold flex items-center">
              {isCalculating ? (
                <div className="animate-spin w-4 h-4 border-2 border-ecucondor-yellow border-t-transparent rounded-full"></div>
              ) : (
                receiveAmount || '0,00'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Display */}
      {selectedRate && (
        <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-sm text-white/80">Tasa de Cambio:</span>
          <span className="font-semibold text-ecucondor-yellow">
            1 {currencies.from} = {(() => {
              console.log('🔍 DEBUG INLINE CALCULATOR:', {
                selectedPair,
                'currencies.from': currencies.from,
                'currencies.to': currencies.to,
                selectedRate: selectedRate ? {
                  sell_rate: selectedRate.sell_rate,
                  buy_rate: selectedRate.buy_rate
                } : null,
                rate,
                formatted: formatNumber(rate)
              });
              return formatNumber(rate);
            })()} {currencies.to}
          </span>
        </div>
      )}

      {/* Action Button */}
      <Link
        href="/calculator"
        className="block w-full bg-gradient-to-r from-ecucondor-yellow to-yellow-400 text-ecucondor-primary py-3 px-6 rounded-lg font-semibold text-center transition-all hover:shadow-lg hover:scale-105 transform"
      >
        🔥 Hacer Cambio Ahora
      </Link>

      {/* Disclaimer */}
      <p className="text-xs text-white/60 text-center mt-3">
        * Tasas referenciales. Para cambios oficiales usa la calculadora completa.
      </p>
    </motion.div>
  );
}

export default memo(InlineCalculator);