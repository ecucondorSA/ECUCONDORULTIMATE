'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

export interface ExchangeRate {
  pair: string;
  sell_rate: number;
  buy_rate: number;
  binance_rate: number;
  spread: number;
  last_updated: string;
  source: 'binance' | 'cache' | 'emergency';
}

export interface DisplayExchangeRate {
  pair: string;
  flag: string;
  rate: string;
  change: string;
  trend: '↗️' | '↘️' | '➡️';
  percentage: number;
  lastUpdate: Date;
  source: string;
}

interface UseOptimizedExchangeRatesReturn {
  rates: DisplayExchangeRate[];
  loading: boolean;
  error: string | null;
  refreshRates: () => void;
  lastUpdate: Date | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isUsingSSE: boolean;
}

/**
 * Hook optimizado para tasas de cambio con soporte para SSE y fallback
 * - Usa Server-Sent Events para actualizaciones en tiempo real
 * - Fallback a polling si SSE no está disponible
 * - Gestión inteligente de reconexión
 */
export const useOptimizedExchangeRates = (): UseOptimizedExchangeRatesReturn => {
  const [rates, setRates] = useState<DisplayExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [isUsingSSE, setIsUsingSSE] = useState(false);

  // Referencias para gestión de conexiones
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Función para transformar datos de API a formato de display
  const transformRatesToDisplay = useCallback((apiRates: ExchangeRate[]): DisplayExchangeRate[] => {
    return apiRates.map((rate) => {
      let displayPair = rate.pair;
      let flag = '💱';
      let formattedRate = rate.sell_rate.toFixed(2);
      
      if (rate.pair === 'USD-ARS') {
        displayPair = 'USD/ARS';
        flag = '🇺🇸🇦🇷';
        formattedRate = `$${rate.sell_rate.toFixed(2)}`;
      } else if (rate.pair === 'USD-BRL') {
        displayPair = 'USD/BRL';
        flag = '🇺🇸🇧🇷';
        formattedRate = `R$ ${rate.sell_rate.toFixed(2)}`;
      } else if (rate.pair === 'ARS-BRL') {
        displayPair = 'BRL/ARS';
        flag = '🇧🇷🇦🇷';
        const brlToArsRate = 1 / rate.sell_rate;
        formattedRate = `$${brlToArsRate.toFixed(2)}`;
      }
      
      // Calcular cambio porcentual basado en el binance_rate vs sell_rate
      const percentage = rate.binance_rate > 0 ? 
        ((rate.sell_rate - rate.binance_rate) / rate.binance_rate * 100) : 0;
      
      return {
        pair: displayPair,
        flag,
        rate: formattedRate,
        change: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
        trend: percentage > 0 ? '↗️' : percentage < 0 ? '↘️' : '➡️',
        percentage,
        lastUpdate: new Date(rate.last_updated),
        source: rate.source
      };
    });
  }, []);

  // Función para obtener tasas via API REST (fallback)
  const fetchRatesViaAPI = useCallback(async (): Promise<ExchangeRate[]> => {
    const cacheBuster = Date.now();
    const response = await fetch(`/api/public-rates?t=${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error('Invalid API response format');
    }
  }, []);

  // Función para manejar actualizaciones de tasas
  const handleRatesUpdate = useCallback((apiRates: ExchangeRate[]) => {
    const displayRates = transformRatesToDisplay(apiRates);
    setRates(displayRates);
    setLastUpdate(new Date());
    setError(null);
    setLoading(false);
    
    logger.info(`✅ Rates updated - ${apiRates.length} pairs, sources: ${apiRates.map(r => r.source).join(', ')}`);
  }, [transformRatesToDisplay]);

  // Configurar SSE connection
  const setupSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setConnectionStatus('connecting');
      setIsUsingSSE(true);
      
      const eventSource = new EventSource('/api/rates/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        logger.info('✅ SSE connection established');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'rates_update' && Array.isArray(data.data)) {
            handleRatesUpdate(data.data);
          } else if (data.type === 'connected') {
            logger.info('📡 SSE connection confirmed');
          }
        } catch (error) {
          logger.error('❌ Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        logger.error('❌ SSE connection error:', error);
        setConnectionStatus('error');
        
        // Intentar reconectar con backoff exponencial
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++;
          
          logger.info(`🔄 Attempting SSE reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setupSSE();
          }, delay);
        } else {
          logger.warn('⚠️ Max SSE reconnect attempts reached, falling back to polling');
          setIsUsingSSE(false);
          setupPolling();
        }
      };

    } catch (error) {
      logger.error('❌ Failed to setup SSE, falling back to polling:', error);
      setIsUsingSSE(false);
      setupPolling();
    }
  }, [handleRatesUpdate]);

  // Configurar polling como fallback
  const setupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setConnectionStatus('connected');
    setIsUsingSSE(false);
    
    const pollRates = async () => {
      try {
        const apiRates = await fetchRatesViaAPI();
        handleRatesUpdate(apiRates);
      } catch (error) {
        logger.error('❌ Polling error:', error);
        setError('Error al obtener tasas');
        setConnectionStatus('error');
      }
    };

    // Primera llamada inmediata
    pollRates();
    
    // Configurar polling cada 30 segundos
    pollingIntervalRef.current = setInterval(pollRates, 30000);
    
    logger.info('🔄 Polling mode activated - updating every 30s');
  }, [fetchRatesViaAPI, handleRatesUpdate]);

  // Función para refrescar manualmente
  const refreshRates = useCallback(async () => {
    try {
      setLoading(true);
      const apiRates = await fetchRatesViaAPI();
      handleRatesUpdate(apiRates);
    } catch (error) {
      logger.error('❌ Manual refresh error:', error);
      setError('Error al refrescar tasas');
      setLoading(false);
    }
  }, [fetchRatesViaAPI, handleRatesUpdate]);

  // Inicializar conexión
  useEffect(() => {
    // Intentar SSE primero, con fallback a polling
    if (typeof EventSource !== 'undefined') {
      setupSSE();
    } else {
      logger.warn('⚠️ EventSource not supported, using polling');
      setupPolling();
    }

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupSSE, setupPolling]);

  // Manejar visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionStatus === 'error') {
        logger.info('📱 Page became visible, attempting to reconnect...');
        if (isUsingSSE) {
          setupSSE();
        } else {
          setupPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus, isUsingSSE, setupSSE, setupPolling]);

  return {
    rates,
    loading,
    error,
    refreshRates,
    lastUpdate,
    connectionStatus,
    isUsingSSE
  };
};