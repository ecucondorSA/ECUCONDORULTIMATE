'use client';

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

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Reemplazar con tu API real
      // const response = await fetch('/api/exchange-rates');
      // const data = await response.json();
      
      const mockRates = generateMockRates();
      setRates(mockRates);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tasas');
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

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchRates, 30000);

    return () => clearInterval(interval);
  }, [fetchRates]);

  // Efecto para mostrar notificación de actualización
  useEffect(() => {
    if (lastUpdate && rates.length > 0) {
      // Aquí podrías agregar una notificación toast
      console.log(`Tasas actualizadas: ${lastUpdate.toLocaleTimeString()}`);
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