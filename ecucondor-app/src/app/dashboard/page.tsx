'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/utils/logger';
import Header from '@/components/common/Header';

// Dashboard stats component
const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    monthlyVolume: 0,
    activePriceLocks: 0,
    availableLimit: 0,
  });

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with real API call when backend is ready
      // For now, show zeros for new users
      setStats({
        totalTransactions: 0,
        monthlyVolume: 0.00,
        activePriceLocks: 0,
        availableLimit: 10000.00, // Default limit for new users
      });
    } catch {
      // Set default values on error
      setStats({
        totalTransactions: 0,
        monthlyVolume: 0.00,
        activePriceLocks: 0,
        availableLimit: 10000.00,
      });
    }
  };


  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <div className="ecucondor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ecucondor-muted">Transacciones Totales</p>
            <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
          </div>
          <div className="p-3 bg-ecucondor-tertiary rounded-full">
            <svg className="w-6 h-6 text-ecucondor-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Volume */}
      <div className="ecucondor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ecucondor-muted">Volumen Mensual</p>
            <p className="text-2xl font-bold text-white">${stats.monthlyVolume.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-ecucondor-tertiary rounded-full">
            <svg className="w-6 h-6 text-ecucondor-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Price Locks */}
      <div className="ecucondor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ecucondor-muted">Price Locks Activos</p>
            <p className="text-2xl font-bold text-white">{stats.activePriceLocks}</p>
          </div>
          <div className="p-3 bg-ecucondor-tertiary rounded-full">
            <svg className="w-6 h-6 text-ecucondor-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Available Limit */}
      <div className="ecucondor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ecucondor-muted">Límite Disponible</p>
            <p className="text-2xl font-bold text-white">${stats.availableLimit.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-ecucondor-tertiary rounded-full">
            <svg className="w-6 h-6 text-ecucondor-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exchange rates component
const ExchangeRatesTable = ({ rates }: { rates: {
  pair: string;
  buy_rate: number;
  sell_rate: number;
  last_updated: string;
}[] }) => {
  return (
    <div className="ecucondor-card p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        💱 Tipos de Cambio en Tiempo Real
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rates.map((rate) => (
          <div key={rate.pair} className="bg-gradient-to-r from-ecucondor-yellow/10 to-ecucondor-yellow/5 border border-ecucondor-yellow/20 rounded-xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">{rate.pair}</h4>
              <span className="text-xs text-ecucondor-muted bg-ecucondor-tertiary/30 px-2 py-1 rounded-full">
                {new Date(rate.last_updated).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-ecucondor-muted">Compramos</span>
                <span className="text-xl font-bold text-ecucondor-buy">
                  ${rate.buy_rate.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-ecucondor-muted">Vendemos</span>
                <span className="text-xl font-bold text-ecucondor-sell">
                  ${rate.sell_rate.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {rates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-ecucondor-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ecucondor-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-ecucondor-muted">Cargando tipos de cambio...</p>
        </div>
      )}
    </div>
  );
};

// Recent transactions component
const RecentTransactions = () => {
  // TODO: Replace with real transactions from API
  const transactions: {
    id: string;
    type: 'buy' | 'sell';
    pair: string;
    amount: number;
    date: Date;
    status: 'completed' | 'pending' | 'failed';
  }[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'pending':
        return 'status-warning';
      case 'failed':
        return 'status-error';
      default:
        return 'status-info';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-ecucondor-buy' : 'text-ecucondor-sell';
  };

  return (
    <div className="ecucondor-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Transacciones Recientes
      </h3>
      
      {transactions.length === 0 ? (
        // Empty state for new users
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-ecucondor-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ecucondor-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-white mb-2">
            Sin transacciones aún
          </h4>
          <p className="text-ecucondor-muted mb-6 max-w-md mx-auto">
            Cuando realices tu primera transacción, aparecerá aquí junto con todo tu historial.
          </p>
          <Link 
            href="/calculator"
            className="btn-ecucondor-primary py-2 px-6 rounded-lg font-medium inline-block"
          >
            Hacer mi primera transacción
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-ecucondor-tertiary/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${tx.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <svg className={`w-4 h-4 ${getTypeColor(tx.type)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tx.type === 'buy' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">{tx.pair}</p>
                  <p className="text-sm text-ecucondor-muted">
                    {tx.type === 'buy' ? 'Compra' : 'Venta'} • {tx.date.toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">
                  {tx.amount.toLocaleString('es-AR')}
                </p>
                <p className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status === 'completed' ? 'Completada' : 
                   tx.status === 'pending' ? 'Pendiente' : 'Fallida'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main dashboard page
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rates, setRates] = useState<{
    pair: string;
    buy_rate: number;
    sell_rate: number;
    last_updated: string;
  }[]>([]);
  const [showPriceLock, setShowPriceLock] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [greeting, setGreeting] = useState(''); // Saludo fijo para la sesión

  // Auth protection with better loading handling
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        const currentPath = window.location.pathname;
        const loginUrl = `/login?returnTo=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
        return;
      } else {
        console.log('✅ Dashboard: User authenticated:', user.email);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Only initialize if user is authenticated
    if (!loading && user) {
      // Generar saludo una sola vez al cargar la página
      setGreeting(generateGreeting());
      
      fetchRates();
      
      // Set up real-time updates - more frequent for dashboard
      const interval = setInterval(fetchRates, 10000); // Update every 10 seconds for real-time experience
      return () => clearInterval(interval);
    }
  }, [loading, user]);

  const fetchRates = async () => {
    try {
      // Try public endpoint first for real-time updates without cache
      let response = await fetch('/api/public-rates', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      let data = await response.json();
      
      if (data.success && data.data) {
        setRates(data.data);
        logger.info('✅ Dashboard rates fetched from public endpoint');
      } else {
        // Fallback to main API
        response = await fetch('/api/rates');
        data = await response.json();
        
        if (data.success && data.data) {
          setRates(data.data);
          logger.info('✅ Dashboard rates fetched from main API');
        }
      }
    } catch (error) {
      logger.error('Error fetching dashboard rates', error);
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.firstName) {
      return user.user_metadata.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const generateGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      // Mañana - mensajes energéticos
      const morningGreetings = [
        '¡Buenos días, financiero madrugador! ☀️',
        '¡El sol sale y tus inversiones brillan! 🌅',
        '¡Buenos días! ¡Que las ganancias te acompañen! ✨',
        '¡Mañana perfecta para hacer crecer tu dinero! 🌱',
        '¡Buenos días, campeón de las divisas! 🏆'
      ];
      return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    } else if (hour >= 12 && hour < 18) {
      // Tarde - mensajes motivadores
      const afternoonGreetings = [
        '¡Buenas tardes! ¡La productividad continúa! 💼',
        '¡Tarde perfecta para revisar tus inversiones! 📈',
        '¡Buenas tardes, maestro del cambio de divisas! 🎯',
        '¡El mejor momento para hacer negocios inteligentes! 🧠',
        '¡Buenas tardes! ¡Tus finanzas están en buenas manos! 👌',
        '¡La tarde es tuya, aprovecha cada oportunidad! 🚀'
      ];
      return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
    } else if (hour >= 18 && hour < 22) {
      // Noche temprana - mensajes relajados
      const eveningGreetings = [
        '¡Buenas noches! ¡Tiempo de revisar el día! 🌆',
        '¡La noche llega, pero las oportunidades no paran! 🌟',
        '¡Buenas noches, estratega financiero! 📊',
        '¡Hora de planificar el éxito de mañana! 🎯',
        '¡Buenas noches! ¡Que tus cuentas sumen felicidad! 😊'
      ];
      return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
    } else if (hour >= 22 || hour < 2) {
      // Noche tardía - mensajes graciosos para noctámbulos
      const lateNightGreetings = [
        '¡Hola, alma nocturna! 🌙',
        '¿Trabajando hasta tarde? ¡Admirable! ✨',
        '¡Saludos, búho financiero! 🦉',
        '¡La noche es joven y las divisas nunca duermen! 🌟',
        '¡Los mercados asiáticos ya están despiertos! 🌏',
        '¡Nocturno pero nunca desorganizado! 🦇'
      ];
      return lateNightGreetings[Math.floor(Math.random() * lateNightGreetings.length)];
    } else {
      // Madrugada 2-5am - mensajes para los más valientes
      const earlyMorningGreetings = [
        '¿Aún despierto? ¡Eres incansable! 🌅',
        '¡Madrugador o trasnochador? En cualquier caso, ¡hola! 🌄',
        '¡Los mercados globales nunca paran, como tú! 🌍',
        '¡Hora de los valientes financieros! 💪',
        '¡Definitivamente eres un guerrero de las finanzas! ⚔️',
        '¡3 AM y aquí sigues! ¡Eres una leyenda! 👑'
      ];
      return earlyMorningGreetings[Math.floor(Math.random() * earlyMorningGreetings.length)];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center">
          <div className="ecucondor-pulse w-16 h-16 bg-ecucondor-yellow rounded-full mx-auto mb-4"></div>
          <p className="text-ecucondor-muted">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ecucondor-primary">
      <Header showLogout={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Personalized Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting}, <span className="text-neon-gold">{getUserName()}</span>
          </h1>
          <p className="text-ecucondor-muted">
            Bienvenido a tu panel de control de Ecucondor
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/calculator"
            className="btn-ecucondor-primary px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v6m0-6l-6 6" />
            </svg>
            <span>Realizar Transacción</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ExchangeRatesTable rates={rates} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ecucondor-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/calculator" className="btn-ecucondor-primary p-4 rounded-lg text-center block hover:no-underline">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v6m0-6l-6 6" />
            </svg>
            Realizar Transacción
          </Link>
          <button 
            onClick={() => setShowPriceLock(true)}
            className="btn-ecucondor-secondary p-4 rounded-lg text-center hover:bg-ecucondor-yellow/20 transition-colors"
          >
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Bloquear Precio
          </button>
          <button 
            onClick={() => setShowLimits(true)}
            className="btn-ecucondor-secondary p-4 rounded-lg text-center hover:bg-ecucondor-yellow/20 transition-colors"
          >
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ver Límites
          </button>
        </div>
      </div>

      {/* Price Lock Modal */}
      {showPriceLock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="ecucondor-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Bloquear Precio</h3>
              <button 
                onClick={() => setShowPriceLock(false)}
                className="text-ecucondor-muted hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-ecucondor-muted text-sm">
                Bloquea una tasa de cambio favorable por un tiempo determinado para asegurar tu transacción.
              </p>
              <div className="bg-ecucondor-yellow/10 border border-ecucondor-yellow/20 rounded-lg p-4">
                <p className="text-sm text-white">
                  🚧 <strong>Próximamente disponible</strong>
                </p>
                <p className="text-xs text-ecucondor-muted mt-1">
                  Esta funcionalidad estará disponible próximamente para ofrecerte mayor control sobre tus transacciones.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPriceLock(false)}
                  className="flex-1 btn-ecucondor-secondary py-2 px-4 rounded-lg"
                >
                  Cerrar
                </button>
                <Link 
                  href="/calculator" 
                  className="flex-1 btn-ecucondor-primary py-2 px-4 rounded-lg text-center"
                  onClick={() => setShowPriceLock(false)}
                >
                  Ir a Calculadora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Limits Modal */}
      {showLimits && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="ecucondor-card p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Límites de Transacción</h3>
              <button 
                onClick={() => setShowLimits(false)}
                className="text-ecucondor-muted hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center py-2 border-b border-ecucondor-tertiary">
                  <span className="text-sm text-ecucondor-muted">Límite diario</span>
                  <span className="font-medium text-white">$10,000 USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ecucondor-tertiary">
                  <span className="text-sm text-ecucondor-muted">Límite mensual</span>
                  <span className="font-medium text-white">$50,000 USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ecucondor-tertiary">
                  <span className="text-sm text-ecucondor-muted">Utilizado este mes</span>
                  <span className="font-medium text-ecucondor-buy">$0 USD</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-ecucondor-muted">Disponible</span>
                  <span className="font-bold text-white text-lg">$50,000 USD</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📊 <strong>Aumenta tus límites</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Completa la verificación KYC para acceder a límites más altos y funciones premium.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLimits(false)}
                  className="flex-1 btn-ecucondor-secondary py-2 px-4 rounded-lg"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    setShowLimits(false);
                    // TODO: Navigate to KYC verification
                  }}
                  className="flex-1 btn-ecucondor-primary py-2 px-4 rounded-lg"
                >
                  Verificar KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}