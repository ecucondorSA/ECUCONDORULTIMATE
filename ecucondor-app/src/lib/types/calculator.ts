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
  doc: { 
    save: (filename: string) => void;
    output: (type: string) => string;
  }; // jsPDF document with save and output methods
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

// Commission rates by pair and transaction type
export const COMMISSION_RATES: Record<string, number> = {
  'USD-ARS-sell': 0.03, // 3% cuando vendes USD por ARS
  'USD-ARS-buy': 0.0,   // 0% cuando compras USD con ARS (promoción!)
  'USD-BRL-sell': 0.02, // 2% cuando vendes USD por BRL
  'USD-BRL-buy': 0.02,  // 2% cuando compras USD con BRL
  'ARS-BRL': 0.025,     // 2.5% para conversiones ARS-BRL
  'standard': 0.0       // 0% por defecto
};