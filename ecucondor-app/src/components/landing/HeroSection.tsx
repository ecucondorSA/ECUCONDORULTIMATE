'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useExchangeRates from '@/hooks/useExchangeRates';
import { ExchangeRatesSkeleton } from '@/components/common/LoadingSkeleton';
import InlineCalculator from '@/components/landing/InlineCalculator';

interface ExchangeRateDisplay {
  pair: string;
  flag: string;
  rate: string;
  change: string;
  trend: string;
  changePercent: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

export default function HeroSection() {
  const { rates, loading, error, lastUpdate } = useExchangeRates();

  // Transformar datos del hook a formato de display con validación
  const displayRates: ExchangeRateDisplay[] = rates.map(rate => {
    const percentage = rate.percentage ?? 0;
    return {
      pair: rate.pair || 'N/A',
      flag: rate.pair === 'USD/ARS' ? '🇺🇸🇦🇷' : 
            rate.pair === 'USD/BRL' ? '🇺🇸🇧🇷' : 
            rate.pair === 'BRL/ARS' ? '🇧🇷🇦🇷' : '💱',
      rate: rate.rate || 'N/A',
      change: percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`,
      trend: percentage > 0 ? '↗️' : percentage < 0 ? '↘️' : '➡️',
      changePercent: percentage
    };
  });

  return (
    <section className="relative py-16 overflow-hidden bg-black">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Contenido a la izquierda */}
          <motion.div 
            className="text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Título y descripción */}
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-3 text-yellow-400"
              style={{ textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)' }}
              variants={itemVariants}
            >
              ECUCONDOR
            </motion.h1>
            
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-4 text-white"
              variants={itemVariants}
            >
              Tu Puente Financiero Global
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-300 mb-6 leading-relaxed"
              variants={itemVariants}
            >
              La plataforma más segura para tus transacciones internacionales entre Argentina, Brasil y Ecuador
            </motion.p>
            
            <motion.div 
              className="space-y-2 text-base text-gray-300 mb-6"
              variants={itemVariants}
            >
              <p>• Transacciones seguras, rápidas y confiables</p>
              <p>• Las mejores tasas, actualizadas al instante</p>
              <p>• Tasas de Cambio en Tiempo Real</p>
            </motion.div>
            
            <motion.div className="mb-8" variants={itemVariants}>
              <Link
                href="/calculator"
                className="text-black font-bold px-8 py-4 rounded-xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-lg border-2 inline-block"
                style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                  borderColor: '#FFD700'
                }}
              >
                🚀 Iniciar Transacción
              </Link>
            </motion.div>

            {/* Cards de Cotizaciones */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Tasas de Cambio en Tiempo Real
                </h3>
                {lastUpdate && (
                  <p className="text-xs text-gray-400">
                    Actualizado: {new Date(lastUpdate).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                )}
              </div>
              
              {loading && rates.length === 0 && (
                <ExchangeRatesSkeleton />
              )}
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-300 text-sm">
                    ⚠️ Error al cargar tasas. Mostrando datos simulados.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {displayRates.map((rate, index) => (
                  <motion.div
                    key={rate.pair}
                    className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 ${
                      rate.changePercent > 0 
                        ? 'border-green-500/30 hover:border-green-400' 
                        : rate.changePercent < 0 
                        ? 'border-red-500/30 hover:border-red-400'
                        : 'border-yellow-500/30 hover:border-yellow-400'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.div 
                          className="text-xl mr-3"
                          animate={{ 
                            y: [0, -5, 0],
                            transition: { 
                              repeat: Infinity, 
                              duration: 2,
                              delay: index * 0.2 
                            }
                          }}
                        >
                          {rate.flag}
                        </motion.div>
                        <div>
                          <h4 className="text-base font-bold text-white">{rate.pair}</h4>
                          <p className={`text-xs ${
                            rate.changePercent > 0 
                              ? 'text-green-400' 
                              : rate.changePercent < 0 
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }`}>
                            {rate.change} {rate.trend}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-400">{rate.rate}</p>
                        {loading && (
                          <div className="flex items-center justify-end mt-1">
                            <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs text-gray-400 ml-1">Live</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Video a la derecha */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <div
                className="relative rounded-full overflow-hidden shadow-2xl border-4 transform hover:scale-105 transition-all duration-500"
                style={{
                  borderColor: 'transparent',
                  width: '500px',
                  height: '500px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <video
                  src="/assets/videos/hero-video.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Calculadora Inline - Nueva Sección */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Calculadora */}
          <InlineCalculator />
          
          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-ecucondor-yellow mb-4 flex items-center gap-2">
                ⚡ Por qué elegir ECUCONDOR
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">100% Seguro</h4>
                    <p className="text-gray-300 text-sm">Transacciones protegidas con encriptación de nivel bancario</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ultra Rápido</h4>
                    <p className="text-gray-300 text-sm">Procesamiento en 5-60 minutos, 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Mejores Tasas</h4>
                    <p className="text-gray-300 text-sm">Tasas competitivas actualizadas en tiempo real</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-ecucondor-yellow/20 to-yellow-400/20 rounded-2xl p-6 border border-ecucondor-yellow/30">
              <div className="text-center">
                <h3 className="text-lg font-bold text-ecucondor-yellow mb-2">
                  🎉 ¡Promoción Especial!
                </h3>
                <p className="text-white text-sm mb-3">
                  No cobramos comisión de ARS a USD
                </p>
                <p className="text-xs text-gray-300">
                  * Solo aplica para conversiones de Pesos Argentinos a Dólares. Otras conversiones sí tienen comisión.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}