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

type RateUpdateCallback = (rates: ExchangeRate[]) => void;

/**
 * Servicio centralizado para gestión de tasas de cambio
 * - Una sola fuente de verdad para todas las tasas
 * - Actualizaciones cada 30 segundos
 * - Sistema de suscripción para componentes
 */
class RateManagerService {
  private static instance: RateManagerService;
  private rates: ExchangeRate[] = [];
  private subscribers: Set<RateUpdateCallback> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;
  private lastUpdateTime = 0;

  // Configuración
  private readonly UPDATE_INTERVAL = 30000; // 30 segundos
  private readonly MIN_UPDATE_INTERVAL = 5000; // Mínimo 5 segundos entre updates

  static getInstance(): RateManagerService {
    if (!RateManagerService.instance) {
      RateManagerService.instance = new RateManagerService();
    }
    return RateManagerService.instance;
  }

  private constructor() {
    this.startPeriodicUpdates();
  }

  /**
   * Suscribirse a actualizaciones de tasas
   */
  subscribe(callback: RateUpdateCallback): () => void {
    this.subscribers.add(callback);
    
    // Enviar tasas actuales inmediatamente si las tenemos
    if (this.rates.length > 0) {
      callback(this.rates);
    } else {
      // Si no tenemos tasas, hacer un fetch inmediato
      this.fetchRates();
    }

    // Retornar función de unsuscribe
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Obtener tasas actuales sin suscripción
   */
  getCurrentRates(): ExchangeRate[] {
    return [...this.rates];
  }

  /**
   * Forzar actualización manual
   */
  async forceUpdate(): Promise<ExchangeRate[]> {
    const now = Date.now();
    
    // Prevenir spam de updates
    if (now - this.lastUpdateTime < this.MIN_UPDATE_INTERVAL) {
      logger.info('⏱️ Rate update throttled - too frequent');
      return this.rates;
    }

    return this.fetchRates();
  }

  /**
   * Iniciar actualizaciones periódicas
   */
  private startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Hacer primera actualización inmediatamente
    this.fetchRates();

    // Configurar actualizaciones periódicas
    this.updateInterval = setInterval(() => {
      this.fetchRates();
    }, this.UPDATE_INTERVAL);

    logger.info(`🔄 Rate manager started - updating every ${this.UPDATE_INTERVAL/1000}s`);
  }

  /**
   * Detener actualizaciones periódicas
   */
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    logger.info('⏹️ Rate manager stopped');
  }

  /**
   * Obtener tasas desde la API
   */
  private async fetchRates(): Promise<ExchangeRate[]> {
    if (this.isUpdating) {
      logger.info('⏳ Rate update already in progress');
      return this.rates;
    }

    this.isUpdating = true;
    this.lastUpdateTime = Date.now();

    try {
      logger.info('🔄 Fetching rates from centralized service...');
      
      const response = await fetch('/api/public-rates', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        this.rates = data.data;
        this.notifySubscribers();
        
        logger.info(`✅ Rates updated successfully - ${this.subscribers.size} subscribers notified`);
        return this.rates;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      logger.error('❌ Failed to fetch rates:', error);
      
      // En caso de error, mantener las tasas anteriores si las tenemos
      if (this.rates.length > 0) {
        logger.info('📋 Using previous rates due to fetch error');
      }
      
      return this.rates;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Notificar a todos los suscriptores
   */
  private notifySubscribers() {
    const ratesCopy = [...this.rates];
    this.subscribers.forEach(callback => {
      try {
        callback(ratesCopy);
      } catch (error) {
        logger.error('❌ Error notifying rate subscriber:', error);
      }
    });
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      subscriberCount: this.subscribers.size,
      lastUpdateTime: this.lastUpdateTime,
      ratesCount: this.rates.length,
      isUpdating: this.isUpdating,
      updateInterval: this.UPDATE_INTERVAL
    };
  }
}

// Exportar instancia singleton
export const rateManager = RateManagerService.getInstance();

// Limpiar en caso de hot reload (desarrollo)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  if (window.__rateManager) {
    // @ts-ignore
    window.__rateManager.stopUpdates();
  }
  // @ts-ignore
  window.__rateManager = rateManager;
}