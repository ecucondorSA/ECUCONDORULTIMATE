import { logger } from '@/lib/utils/logger';
/**
 * Newsletter API Service
 * Maneja suscripciones a newsletter y email marketing
 */

export interface NewsletterSubscription {
  email: string;
  name?: string;
  tags?: string[];
  source?: string;
  preferences?: {
    exchangeRates?: boolean;
    marketNews?: boolean;
    promotions?: boolean;
  };
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    status: 'subscribed' | 'pending' | 'unsubscribed';
    subscribedAt: string;
  };
  error?: string;
}

class NewsletterAPI {
  private readonly apiUrl: string;
  private readonly apiKey?: string;

  constructor() {
    this.apiUrl = '/api/newsletter';
    this.apiKey = process.env.NEXT_PUBLIC_NEWSLETTER_API_KEY;
  }

  /**
   * Suscribe un usuario al newsletter
   */
  async subscribe(subscription: NewsletterSubscription): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        },
        body: JSON.stringify({
          ...subscription,
          source: subscription.source || 'website',
          subscribedAt: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al suscribirse');
      }

      return data;
    } catch (error) {
      logger.error('Error subscribing to newsletter:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Desuscribe un usuario del newsletter
   */
  async unsubscribe(email: string): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al desuscribirse');
      }

      return data;
    } catch (error) {
      logger.error('Error unsubscribing from newsletter:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verifica el estado de una suscripción
   */
  async getSubscriptionStatus(email: string): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar suscripción');
      }

      return data;
    } catch (error) {
      logger.error('Error checking subscription status:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualiza las preferencias de un suscriptor
   */
  async updatePreferences(
    email: string, 
    preferences: NewsletterSubscription['preferences']
  ): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        },
        body: JSON.stringify({ email, preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar preferencias');
      }

      return data;
    } catch (error) {
      logger.error('Error updating preferences:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtiene estadísticas del newsletter (para admin)
   */
  async getStats(): Promise<{
    success: boolean;
    data?: {
      totalSubscribers: number;
      activeSubscribers: number;
      newSubscribers30d: number;
      unsubscribeRate: number;
      topSources: Array<{ source: string; count: number }>;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey })
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data;
    } catch (error) {
      logger.error('Error getting newsletter stats:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Valida un email antes de suscribirlo
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Limpia y normaliza un email
   */
  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

// Export singleton instance
export const newsletterAPI = new NewsletterAPI();

// Export default
export default newsletterAPI;