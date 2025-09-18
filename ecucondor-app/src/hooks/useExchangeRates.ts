'use client';
import { logger } from '@/lib/utils/logger';

import { useState, useEffect, useCallback } from 'react';

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

// Datos simulados - en producción vendrían de tu API
const generateMockRates = (): ExchangeRate[] => {
  const baseRates = {
    USDARS: 1250,
    USDBRL: 5.20,
    BRLARS: 240
  };

  // Simulamos fluctuaciones reales
  const fluctuation = () => (Math.random() - 0.5) * 0.1; // ±5%
  
  return [
    {
      pair: "USD/ARS",
      flag: "🇺🇸🇦🇷",
      rate: `$${(baseRates.USDARS * (1 + fluctuation())).toFixed(2)}`,
      change: `${(Math.random() * 4 - 2).toFixed(1)}%`,
      trend: Math.random() > 0.5 ? '↗️' : '↘️',
      percentage: parseFloat((Math.random() * 4 - 2).toFixed(1)),
      lastUpdate: new Date()
    },
    {
      pair: "USD/BRL",
      flag: "🇺🇸🇧🇷",
      rate: `R$ ${(baseRates.USDBRL * (1 + fluctuation())).toFixed(2)}`,
      change: `${(Math.random() * 3 - 1.5).toFixed(1)}%`,
      trend: Math.random() > 0.5 ? '↗️' : '↘️',
      percentage: parseFloat((Math.random() * 3 - 1.5).toFixed(1)),
      lastUpdate: new Date()
    },
    {
      pair: "BRL/ARS",
      flag: "🇧🇷🇦🇷",
      rate: `$${(baseRates.BRLARS * (1 + fluctuation())).toFixed(2)}`,
      change: `${(Math.random() * 2 - 1).toFixed(1)}%`,
      trend: Math.random() > 0.5 ? '↗️' : '↘️',
      percentage: parseFloat((Math.random() * 2 - 1).toFixed(1)),
      lastUpdate: new Date()
    }
  ];
};

const useExchangeRates = (): UseExchangeRatesReturn => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('🔄 Fetching exchange rates...');
      
      // Obtener datos reales de la API con cache busting
      const cacheBuster = Date.now();
      
      // Try public endpoint first, then fallback to main API
      let response = await fetch(`/api/public-rates?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // If public endpoint fails, try main API
      if (!response.ok) {
        logger.warn('Public endpoint failed, trying main API...');
        response = await fetch(`/api/rates?t=${cacheBuster}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      logger.info('📊 API Response:', data);
      
      if (data.success && data.data) {
        // Transformar datos de API a formato de display
        const apiRates: ExchangeRate[] = data.data.map((rate: { 
          pair: string;
          sell_rate: number;
          buy_rate: number;
          binance_rate?: number;
          spread?: number;
          commission_rate?: number;
          last_updated: string;
          source: 'fixed' | 'binance' | 'manual';
        }) => {
          const sellRate = rate.sell_rate || 0;
          const baseRate = rate.binance_rate || sellRate;
          const percentage = baseRate > 0 ? ((sellRate - baseRate) / baseRate * 100) : 0;
          
          // Mapear pares de API a formato de display
          let displayPair = rate.pair;
          let flag = '💱';
          let formattedRate = sellRate.toFixed(2);
          
          if (rate.pair === 'USD-ARS') {
            displayPair = 'USD/ARS';
            flag = '🇺🇸🇦🇷';
            formattedRate = `$${sellRate.toFixed(2)}`;
          } else if (rate.pair === 'USD-BRL') {
            displayPair = 'USD/BRL';
            flag = '🇺🇸🇧🇷';
            formattedRate = `R$ ${sellRate.toFixed(2)}`;
          } else if (rate.pair === 'ARS-BRL') {
            displayPair = 'BRL/ARS';
            flag = '🇧🇷🇦🇷';
            // La tasa ARS-BRL nos dice cuántos BRL vale 1 ARS
            // Para mostrar BRL/ARS, necesitamos invertir: cuántos ARS vale 1 BRL
            const brlToArsRate = 1 / sellRate;
            formattedRate = `$${brlToArsRate.toFixed(2)}`;
          }
          
          return {
            pair: displayPair,
            flag,
            rate: formattedRate,
            change: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
            trend: percentage > 0 ? '↗️' : percentage < 0 ? '↘️' : '➡️',
            percentage,
            lastUpdate: new Date(rate.last_updated)
          };
        });
        
        setRates(apiRates);
        logger.info(`✅ Successfully updated ${apiRates.length} exchange rates`);
      } else {
        // Fallback a datos simulados si API falla
        logger.warn('⚠️ API response unsuccessful, using mock data');
        const mockRates = generateMockRates();
        setRates(mockRates);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      // En caso de error, usar datos simulados
      logger.error('❌ Error fetching rates, using mock data:', err);
      const mockRates = generateMockRates();
      setRates(mockRates);
      setError('API no disponible - mostrando datos simulados');
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRates = useCallback(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    // Cargar tasas inicialmente
    fetchRates();

    // Actualizar cada 15 segundos (más frecuente para tiempo real)
    const interval = setInterval(fetchRates, 15000);
    
    // También actualizar cuando la ventana recupera el foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        logger.info('Ventana recuperó el foco, actualizando tasas...');
        fetchRates();
      }
    };
    
    const handleFocus = () => {
      logger.info('Ventana recuperó el foco, actualizando tasas...');
      fetchRates();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchRates]);

  // Efecto para mostrar notificación de actualización
  useEffect(() => {
    if (lastUpdate && rates.length > 0) {
      // Aquí podrías agregar una notificación toast
      logger.info(`Tasas actualizadas: ${lastUpdate.toLocaleTimeString()}`);
    }
  }, [lastUpdate, rates]);

  return {
    rates,
    loading,
    error,
    refreshRates,
    lastUpdate
  };
};

export default useExchangeRates;