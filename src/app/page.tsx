'use client';

import {
  companyInfo,
  creditRates,
  depositRates,
  investmentProducts,
  type FinancialRate
} from '@/data/rates';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'credits' | 'investments'>('deposits');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const RateCard = ({ rate }: { rate: FinancialRate }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{rate.name}</h3>
        <span className="text-2xl font-bold text-primary">
          {rate.rate}%
        </span>
      </div>
      {rate.description && (
        <p className="text-gray-600 mb-4">{rate.description}</p>
      )}
      <div className="space-y-2 text-sm text-gray-700">
        {rate.minAmount && (
          <div className="flex justify-between">
            <span>Monto mínimo:</span>
            <span className="font-medium">{formatCurrency(rate.minAmount)}</span>
          </div>
        )}
        {rate.maxAmount && (
          <div className="flex justify-between">
            <span>Monto máximo:</span>
            <span className="font-medium">{formatCurrency(rate.maxAmount)}</span>
          </div>
        )}
        {rate.term && (
          <div className="flex justify-between">
            <span>Plazo:</span>
            <span className="font-medium">{rate.term}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: typeof investmentProducts[0] }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Características:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {product.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Requisitos:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {product.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-2">Documentos:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {product.documents.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">
              {companyInfo.name}
            </h1>
            <p className="text-xl text-gray-600">{companyInfo.slogan}</p>
            <p className="text-gray-500 mt-2">{companyInfo.description}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'deposits'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Depósitos
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'credits'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Créditos
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'investments'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Inversiones
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'deposits' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Tasas de Depósito
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {depositRates.map((rate) => (
                  <RateCard key={rate.id} rate={rate} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'credits' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Tasas de Crédito
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditRates.map((rate) => (
                  <RateCard key={rate.id} rate={rate} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Productos de Inversión
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investmentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-300">
                <p>{companyInfo.contact.phone}</p>
                <p>{companyInfo.contact.email}</p>
                <p>{companyInfo.contact.address}</p>
                <p>{companyInfo.contact.hours}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Útiles</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Servicios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sucursales</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Cuentas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Créditos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Inversiones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguros</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href={companyInfo.socialMedia.facebook} className="text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href={companyInfo.socialMedia.twitter} className="text-gray-300 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href={companyInfo.socialMedia.instagram} className="text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 {companyInfo.name}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
