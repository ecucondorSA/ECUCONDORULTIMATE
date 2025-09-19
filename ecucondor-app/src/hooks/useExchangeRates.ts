'use client';
import { logger } from '@/lib/utils/logger';
import { useOptimizedExchangeRates } from './useOptimizedExchangeRates';

// Mantener interfaz original para compatibilidad
export interface ExchangeRate {
  pair: string;
  flag: string;
  rate: string;
  change: string;
  trend: '↗️' | '↘️' | '➡️';
  percentage: number;
  lastUpdate: Date;
}

interface UseExchangeRatesReturn {
  rates: ExchangeRate[];
  loading: boolean;
  error: string | null;
  refreshRates: () => void;
  lastUpdate: Date | null;
}

/**
 * Hook de tasas de cambio (LEGACY - mantiene compatibilidad)
 * 
 * Este hook mantiene la API original pero internamente usa el nuevo
 * sistema optimizado con SSE y servicio centralizado.
 * 
 * Para nuevos componentes, usar useOptimizedExchangeRates directamente.
 */
const useExchangeRates = (): UseExchangeRatesReturn => {
  logger.info('🔄 Using optimized exchange rates (legacy compatibility mode)');
  
  // Usar el hook optimizado internamente
  const {
    rates: optimizedRates,
    loading,
    error,
    refreshRates,
    lastUpdate,
    connectionStatus,
    isUsingSSE
  } = useOptimizedExchangeRates();

  // Transformar las tasas al formato legacy si es necesario
  // (En este caso, el formato ya es compatible)
  const rates: ExchangeRate[] = optimizedRates.map(rate => ({
    pair: rate.pair,
    flag: rate.flag,
    rate: rate.rate,
    change: rate.change,
    trend: rate.trend,
    percentage: rate.percentage,
    lastUpdate: rate.lastUpdate
  }));

  // Log de información del sistema optimizado
  if (lastUpdate) {
    logger.info(`📊 Legacy hook: ${rates.length} rates, SSE: ${isUsingSSE}, Status: ${connectionStatus}`);
  }

  return {
    rates,
    loading,
    error,
    refreshRates,
    lastUpdate
  };
};

export default useExchangeRates;