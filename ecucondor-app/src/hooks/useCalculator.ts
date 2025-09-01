/**
 * Custom hook for calculator logic
 * Manages all state and business logic for currency conversion
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ExchangeRate, CalculatorState, TransactionDetails, CurrencyPair, TransactionType } from '@/lib/types/calculator';
import { 
  parseAmount, 
  formatNumber, 
  calculateSendToReceive, 
  calculateReceiveToSend, 
  getTransactionDetails,
  getCurrencies
} from '@/lib/utils/calculator-utils';
import { logger } from '@/lib/utils/logger';

export function useCalculator() {
  // State
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('USD-ARS');
  const [transactionType, setTransactionType] = useState<TransactionType>('sell');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Computed values
  const selectedRate = useMemo(() => {
    return rates.find(rate => rate.pair === selectedPair) || null;
  }, [rates, selectedPair]);

  const transactionDetails = useMemo(() => {
    return getTransactionDetails(transactionType, selectedPair, sendAmount, receiveAmount, selectedRate);
  }, [transactionType, selectedPair, sendAmount, receiveAmount, selectedRate]);

  const currencies = useMemo(() => getCurrencies(selectedPair), [selectedPair]);

  // Fetch rates from API
  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();
      
      if (data.success && data.data) {
        setRates(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      logger.error('Error fetching rates', error);
    }
  }, []);

  // Handle amount changes with automatic conversion
  const handleSendAmountChange = useCallback((value: string) => {
    setSendAmount(value);
    
    if (!selectedRate) return;
    
    setIsCalculating(true);
    
    const numAmount = parseAmount(value);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setReceiveAmount('');
      setIsCalculating(false);
      return;
    }

    const converted = calculateSendToReceive(numAmount, selectedRate, transactionType, selectedPair);
    setReceiveAmount(formatNumber(converted));
    setIsCalculating(false);
  }, [selectedRate, transactionType, selectedPair]);

  const handleReceiveAmountChange = useCallback((value: string) => {
    setReceiveAmount(value);
    
    if (!selectedRate) return;
    
    setIsCalculating(true);
    
    const numAmount = parseAmount(value);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setSendAmount('');
      setIsCalculating(false);
      return;
    }

    const needed = calculateReceiveToSend(numAmount, selectedRate, transactionType, selectedPair);
    setSendAmount(formatNumber(needed));
    setIsCalculating(false);
  }, [selectedRate, transactionType, selectedPair]);

  // Handle transaction type change
  const handleTransactionTypeChange = useCallback((type: TransactionType) => {
    setTransactionType(type);
    
    // Recalculate if we have amounts
    if (sendAmount && selectedRate) {
      const numAmount = parseAmount(sendAmount);
      if (numAmount > 0) {
        const converted = calculateSendToReceive(numAmount, selectedRate, type, selectedPair);
        setReceiveAmount(formatNumber(converted));
      }
    }
  }, [sendAmount, selectedRate, selectedPair]);

  // Handle pair change
  const handlePairChange = useCallback((pair: CurrencyPair) => {
    setSelectedPair(pair);
    setSendAmount('');
    setReceiveAmount('');
  }, []);

  // Clear all amounts
  const clearAmounts = useCallback(() => {
    setSendAmount('');
    setReceiveAmount('');
  }, []);

  // Show transaction summary
  const showTransactionSummary = useCallback(() => {
    if (transactionDetails) {
      setShowSummary(true);
    }
  }, [transactionDetails]);

  // Initial data fetch
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    // State
    rates,
    selectedPair,
    transactionType,
    sendAmount,
    receiveAmount,
    loading,
    isCalculating,
    showSummary,
    lastUpdate,
    
    // Computed
    selectedRate,
    transactionDetails,
    currencies,
    
    // Actions
    setSelectedPair: handlePairChange,
    setTransactionType: handleTransactionTypeChange,
    setSendAmount: handleSendAmountChange,
    setReceiveAmount: handleReceiveAmountChange,
    setLoading,
    setShowSummary,
    clearAmounts,
    showTransactionSummary,
    fetchRates
  };
}