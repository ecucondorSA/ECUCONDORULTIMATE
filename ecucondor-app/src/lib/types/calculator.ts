/**
 * Types and interfaces for the Calculator component
 */

export interface ExchangeRate {
  id: string;
  pair: string;
  base_currency: string;
  target_currency: string;
  binance_rate?: number;
  sell_rate: number;
  buy_rate: number;
  spread: number;
  commission_rate: number;
  last_updated: string;
  source: 'binance' | 'fixed' | 'calculated';
}

export interface TransactionDetails {
  type: 'buy' | 'sell';
  pair: string;
  sendAmount: number;
  receiveAmount: number;
  rate: number;
  commission: number;
  commissionAmount: number;
}

export interface PaymentInstructions {
  send: {
    currency: string;
    amount: number;
    method: string;
    account: string;
  };
  receive: {
    currency: string;
    amount: number;
    method: string;
  };
}

export interface PDFData {
  doc: unknown; // jsPDF document
  transactionId: string;
}

export type TransactionType = 'buy' | 'sell';
export type CurrencyPair = 'USD-ARS' | 'USD-BRL' | 'ARS-BRL';
export type Currency = 'USD' | 'ARS' | 'BRL';

export interface CalculatorState {
  rates: ExchangeRate[];
  selectedPair: CurrencyPair;
  transactionType: TransactionType;
  sendAmount: string;
  receiveAmount: string;
  loading: boolean;
  isCalculating: boolean;
  showSummary: boolean;
  lastUpdate: Date | null;
}

export interface CurrencyConfig {
  from: Currency;
  to: Currency;
}

// Currency flags mapping
export const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  ARS: '🇦🇷', 
  BRL: '🇧🇷'
};

// Commission rates by pair
export const COMMISSION_RATES: Record<string, number> = {
  'USD-ARS': 0.03, // 3% only for USD to ARS
  'standard': 0.0,  // 0% for other pairs
};