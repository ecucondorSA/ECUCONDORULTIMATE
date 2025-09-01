'use client';

import { useState, useEffect } from 'react';

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
    // In production, fetch from your APIs
    setStats({
      totalTransactions: 47,
      monthlyVolume: 2850.50,
      activePriceLocks: 2,
      availableLimit: 7149.50,
    });
  };


  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <div className="ecucondor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ecucondor-muted">Transacciones Totales</p>
            <p className="text-2xl font-bold text-ecucondor-primary">{stats.totalTransactions}</p>
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
            <p className="text-2xl font-bold text-ecucondor-primary">${stats.monthlyVolume.toLocaleString()}</p>
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
            <p className="text-2xl font-bold text-ecucondor-primary">{stats.activePriceLocks}</p>
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
            <p className="text-2xl font-bold text-ecucondor-primary">${stats.availableLimit.toLocaleString()}</p>
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
  spread: number;
  last_updated: string;
}[] }) => {
  return (
    <div className="ecucondor-card p-6">
      <h3 className="text-lg font-semibold text-ecucondor-primary mb-4">
        Tipos de Cambio en Tiempo Real
      </h3>
      <div className="overflow-x-auto">
        <table className="ecucondor-table w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">Par</th>
              <th className="px-4 py-3 text-left">Compra</th>
              <th className="px-4 py-3 text-left">Venta</th>
              <th className="px-4 py-3 text-left">Spread</th>
              <th className="px-4 py-3 text-left">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.pair} className="hover:bg-ecucondor-tertiary/50">
                <td className="px-4 py-3 font-medium text-ecucondor-primary">
                  {rate.pair}
                </td>
                <td className="px-4 py-3 rate-buy">
                  {rate.buy_rate.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="px-4 py-3 rate-sell">
                  {rate.sell_rate.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="px-4 py-3 rate-spread">
                  {rate.spread.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-ecucondor-muted">
                  {new Date(rate.last_updated).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Recent transactions component
const RecentTransactions = () => {
  const mockTransactions = [
    {
      id: 1,
      pair: 'USD-ARS',
      type: 'sell',
      amount: 100,
      total: 135075,
      status: 'completed',
      date: new Date(),
    },
    {
      id: 2,
      pair: 'USD-ARS',
      type: 'buy',
      amount: 150000,
      total: 105.63,
      status: 'completed',
      date: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      pair: 'ARS-BRL',
      type: 'sell',
      amount: 50000,
      total: 167.8,
      status: 'pending',
      date: new Date(Date.now() - 7200000),
    },
  ];

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
      <h3 className="text-lg font-semibold text-ecucondor-primary mb-4">
        Transacciones Recientes
      </h3>
      <div className="space-y-4">
        {mockTransactions.map((tx) => (
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
                <p className="font-medium text-ecucondor-primary">{tx.pair}</p>
                <p className="text-sm text-ecucondor-muted">
                  {tx.type === 'buy' ? 'Compra' : 'Venta'} • {tx.date.toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-ecucondor-primary">
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
    </div>
  );
};

// Main dashboard page
export default function DashboardPage() {
  const [rates, setRates] = useState<{
    pair: string;
    buy_rate: number;
    sell_rate: number;
    spread: number;
    last_updated: string;
  }[]>([]);

  useEffect(() => {
    fetchRates();
    // Set up real-time updates
    const interval = setInterval(fetchRates, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();
      if (data.success) {
        setRates(data.data);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ecucondor-primary">Dashboard</h1>
        <p className="text-ecucondor-muted">
          Bienvenido a tu panel de control de Ecucondor
        </p>
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
        <h3 className="text-lg font-semibold text-ecucondor-primary mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-ecucondor-primary p-4 rounded-lg text-center">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Transacción
          </button>
          <button className="btn-ecucondor-secondary p-4 rounded-lg text-center">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Bloquear Precio
          </button>
          <button className="btn-ecucondor-secondary p-4 rounded-lg text-center">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ver Límites
          </button>
        </div>
      </div>
    </div>
  );
}