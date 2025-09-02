import {
  getCurrencies,
  formatNumber,
  parseAmount,
  calculateSendToReceive,
  calculateReceiveToSend,
  getTransactionDetails,
} from '../calculator-utils';
import { ExchangeRate } from '@/lib/types/calculator';

describe('calculator-utils', () => {
  const mockRate: ExchangeRate = {
    id: 'test-rate',
    pair: 'USD-ARS',
    base_currency: 'USD',
    target_currency: 'ARS',
    sell_rate: 1000,
    buy_rate: 950,
    spread: 50,
    commission_rate: 0.03,
    last_updated: new Date().toISOString(),
    source: 'fixed' as const,
  };

  describe('getCurrencies', () => {
    it('should parse currency pair correctly', () => {
      const result = getCurrencies('USD-ARS');
      expect(result).toEqual({ from: 'USD', to: 'ARS' });
    });

    it('should handle different currency pairs', () => {
      const result = getCurrencies('BRL-USD');
      expect(result).toEqual({ from: 'BRL', to: 'USD' });
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with Spanish locale', () => {
      expect(formatNumber(1000)).toBe('1.000,00');
      expect(formatNumber(1234.56)).toBe('1.234,56');
      expect(formatNumber(0)).toBe('0,00');
    });

    it('should handle NaN', () => {
      expect(formatNumber(NaN)).toBe('0,00');
    });
  });

  describe('parseAmount', () => {
    it('should parse formatted amounts correctly', () => {
      expect(parseAmount('1.000,00')).toBe(1000);
      expect(parseAmount('1.234,56')).toBe(1234.56); // Spanish format uses dots for thousands
      expect(parseAmount('100')).toBe(100);
    });

    it('should handle empty string', () => {
      expect(parseAmount('')).toBe(0);
    });

    it('should handle invalid input', () => {
      expect(parseAmount('abc')).toBe(0);
    });

    it('should handle mixed formats', () => {
      expect(parseAmount('1 000,50')).toBe(1000.5);
      expect(parseAmount('1.000.000,99')).toBe(1000000.99);
    });
  });

  describe('calculateSendToReceive', () => {
    it('should calculate sell transaction correctly', () => {
      // Sell 100 USD for ARS at rate 1000 with 3% commission
      const result = calculateSendToReceive(100, mockRate, 'sell', 'USD-ARS');
      
      // 100 USD * 1000 = 100,000 ARS
      // Commission: 100,000 * 0.03 = 3,000 ARS
      // Receive: 100,000 - 3,000 = 97,000 ARS
      expect(result).toBe(97000);
    });

    it('should calculate buy transaction correctly', () => {
      // Buy USD with 950 ARS at buy rate 950
      const result = calculateSendToReceive(950, mockRate, 'buy', 'USD-ARS');
      
      // 950 ARS / 950 = 1 USD (no commission on buy)
      expect(result).toBe(1);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateSendToReceive(0, mockRate, 'sell', 'USD-ARS')).toBe(0);
      expect(calculateSendToReceive(-100, mockRate, 'sell', 'USD-ARS')).toBe(0);
    });

    it('should handle missing rate', () => {
      expect(calculateSendToReceive(100, null as unknown as ExchangeRate, 'sell', 'USD-ARS')).toBe(0);
    });
  });

  describe('calculateReceiveToSend', () => {
    it('should calculate reverse sell transaction correctly', () => {
      // Want to receive 97,000 ARS by selling USD
      const result = calculateReceiveToSend(97000, mockRate, 'sell', 'USD-ARS');
      
      // With 3% commission: 97,000 / (1 - 0.03) = 100,000 ARS gross
      // 100,000 ARS / 1000 rate = 100 USD
      expect(result).toBeCloseTo(100, 2);
    });

    it('should calculate reverse buy transaction correctly', () => {
      // Want to receive 1 USD by buying with ARS
      const result = calculateReceiveToSend(1, mockRate, 'buy', 'USD-ARS');
      
      // 1 USD * 950 buy rate = 950 ARS needed
      expect(result).toBe(950);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateReceiveToSend(0, mockRate, 'sell', 'USD-ARS')).toBe(0);
      expect(calculateReceiveToSend(-100, mockRate, 'sell', 'USD-ARS')).toBe(0);
    });
  });

  describe('getTransactionDetails', () => {
    it('should return complete transaction details', () => {
      const details = getTransactionDetails(
        'sell',
        'USD-ARS',
        '100',
        '97000',
        mockRate
      );

      expect(details).not.toBeNull();
      expect(details?.type).toBe('sell');
      expect(details?.pair).toBe('USD-ARS');
      expect(details?.sendAmount).toBe(100);
      expect(details?.receiveAmount).toBe(97000);
      expect(details?.rate).toBe(1000);
      expect(details?.commission).toBe(0.03);
      expect(details?.commissionAmount).toBe(2910); // 97000 * 0.03
    });

    it('should return null for invalid inputs', () => {
      expect(getTransactionDetails('sell', 'USD-ARS', '', '', mockRate)).toBeNull();
      expect(getTransactionDetails('sell', 'USD-ARS', '100', '97000', null)).toBeNull();
      expect(getTransactionDetails('sell', 'USD-ARS', '0', '0', mockRate)).toBeNull();
    });

    it('should handle buy transactions', () => {
      const details = getTransactionDetails(
        'buy',
        'USD-ARS',
        '950',
        '1',
        mockRate
      );

      expect(details).not.toBeNull();
      expect(details?.type).toBe('buy');
      expect(details?.commissionAmount).toBe(0); // No commission on buy
    });
  });
});