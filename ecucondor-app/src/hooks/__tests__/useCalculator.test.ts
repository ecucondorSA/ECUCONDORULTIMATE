import { renderHook, act } from '@testing-library/react';
import { useCalculator } from '../useCalculator';

// Mock the useExchangeRates hook
jest.mock('../useExchangeRates', () => ({
  __esModule: true,
  default: () => ({
    rates: [
      {
        id: 'test-1',
        pair: 'USD-ARS',
        base_currency: 'USD',
        target_currency: 'ARS',
        sell_rate: 1000,
        buy_rate: 950,
        spread: 50,
        commission_rate: 0.03,
        last_updated: new Date().toISOString(),
      },
      {
        id: 'test-2',
        pair: 'USD-BRL',
        base_currency: 'USD',
        target_currency: 'BRL',
        sell_rate: 5.5,
        buy_rate: 5.3,
        spread: 0.2,
        commission_rate: 0.02,
        last_updated: new Date().toISOString(),
      },
    ],
    loading: false,
    error: null,
    refreshRates: jest.fn(),
    lastUpdate: new Date(),
  }),
}));

describe('useCalculator', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.selectedPair).toBe('USD-ARS');
    expect(result.current.transactionType).toBe('sell');
    expect(result.current.sendAmount).toBe('');
    expect(result.current.receiveAmount).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.showSummary).toBe(false);
  });

  it('should update selected pair', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSelectedPair('USD-BRL');
    });

    expect(result.current.selectedPair).toBe('USD-BRL');
  });

  it('should update transaction type', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setTransactionType('buy');
    });

    expect(result.current.transactionType).toBe('buy');
  });

  it('should calculate receive amount when send amount changes', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSendAmount('100');
    });

    // For USD-ARS sell at rate 1000 with 3% commission
    // 100 USD * 1000 = 100,000 ARS
    // Commission: 100,000 * 0.03 = 3,000 ARS
    // Receive: 100,000 - 3,000 = 97,000 ARS
    expect(result.current.receiveAmount).toBe('97000,00');
  });

  it('should calculate send amount when receive amount changes', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setReceiveAmount('97000');
    });

    // Working backwards from 97,000 ARS
    // With 3% commission: 97,000 / (1 - 0.03) = 100,000 ARS gross
    // 100,000 ARS / 1000 rate = 100 USD
    expect(result.current.sendAmount).toBe('100,00');
  });

  it('should clear amounts', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSendAmount('100');
      result.current.setReceiveAmount('97000');
    });

    act(() => {
      result.current.clearAmounts();
    });

    expect(result.current.sendAmount).toBe('');
    expect(result.current.receiveAmount).toBe('');
  });

  it('should get transaction details', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSendAmount('100');
    });

    const details = result.current.transactionDetails;

    expect(details).not.toBeNull();
    expect(details?.type).toBe('sell');
    expect(details?.pair).toBe('USD-ARS');
    expect(details?.sendAmount).toBe(100);
    expect(details?.receiveAmount).toBe(97000);
    expect(details?.rate).toBe(1000);
    expect(details?.commission).toBe(0.03);
  });

  it('should show transaction summary', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSendAmount('100');
    });

    act(() => {
      result.current.showTransactionSummary();
    });

    expect(result.current.showSummary).toBe(true);
  });

  it('should handle currency switch correctly', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setSelectedPair('USD-BRL');
      result.current.setSendAmount('100');
    });

    // For USD-BRL sell at rate 5.5 with 2% commission
    // 100 USD * 5.5 = 550 BRL
    // Commission: 550 * 0.02 = 11 BRL
    // Receive: 550 - 11 = 539 BRL
    expect(result.current.receiveAmount).toBe('539,00');
  });

  it('should handle buy transaction type', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setTransactionType('buy');
      result.current.setSendAmount('950'); // Sending ARS to buy USD
    });

    // For buy: 950 ARS / 950 buy_rate = 1 USD
    expect(result.current.receiveAmount).toBe('1,00');
  });
});