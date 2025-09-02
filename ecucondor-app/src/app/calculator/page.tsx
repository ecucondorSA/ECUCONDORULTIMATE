'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import refactored components and hooks
import { useCalculator } from '@/hooks/useCalculator';
import { CURRENCY_FLAGS } from '@/lib/types/calculator';
import { formatNumber } from '@/lib/utils/calculator-utils';
import { PDFGenerator } from '@/components/calculator/PDFGenerator';
import TransactionSummary from '@/components/calculator/TransactionSummary';
import { logger } from '@/lib/utils/logger';
import Header from '@/components/common/Header';

export default function CalculatorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Use custom calculator hook for all logic
  const {
    selectedPair,
    transactionType,
    sendAmount,
    receiveAmount,
    loading,
    isCalculating,
    showSummary,
    lastUpdate,
    selectedRate,
    transactionDetails,
    currencies,
    setSelectedPair,
    setTransactionType,
    setSendAmount,
    setReceiveAmount,
    setLoading,
    setShowSummary,
    showTransactionSummary,
    clearAmounts
  } = useCalculator();

  // PDF download handler
  const handleDownloadPDF = async () => {
    logger.debug('handleDownloadPDF iniciado');
    logger.debug('transactionDetails', !!transactionDetails);

    if (!transactionDetails) return;

    try {
      setLoading(true);
      logger.debug('Loading activado');

      const pdfData = await PDFGenerator.generatePDFReceipt(transactionDetails, user);
      logger.debug('generatePDFReceipt resultado', !!pdfData);

      if (pdfData) {
        logger.debug('PDF generado, procediendo a descargar...');
        // Download PDF
        pdfData.doc.save(`Comprobante_${pdfData.transactionId}.pdf`);
        logger.info('Archivo descargado');

        // Send to Ecucondor
        logger.debug('Enviando a Ecucondor...');
        await PDFGenerator.sendPDFToEcucondor(pdfData, user?.email);
        logger.info('Enviado a Ecucondor');

        // Show success message and provide next steps
        const shouldReturnToDashboard = window.confirm(
          `COMPROBANTE GENERADO EXITOSAMENTE!\n\n` +
          `Se ha enviado automaticamente a EcuCondor para su procesamiento.\n\n` +
          `Tiempo estimado de procesamiento: 5 minutos - 1 hora\n\n` +
          `Deseas regresar al dashboard para ver el estado de tu transaccion?\n\n` +
          `* Presiona "Aceptar" para ir al Dashboard\n` +
          `* Presiona "Cancelar" para hacer otra transaccion`
        );

        if (shouldReturnToDashboard) {
          router.push('/dashboard');
        } else {
          // Reset calculator for new transaction
          clearAmounts();
          setShowSummary(false);
        }

      } else {
        logger.warn('pdfData es null/undefined');
        alert('Error generando el comprobante PDF. Intenta nuevamente.');
      }
    } catch (error) {
      logger.error('Error en handleDownloadPDF', error);
      
      // Show user-friendly error message
      const shouldRetry = window.confirm(
        'ERROR AL PROCESAR LA TRANSACCION\n\n' +
        'Hubo un problema al generar el comprobante.\n\n' +
        'Presiona "Aceptar" para intentar nuevamente\n' +
        'Presiona "Cancelar" para regresar al dashboard'
      );
      
      if (shouldRetry) {
        // Reset and allow user to try again
        setShowSummary(false);
      } else {
        router.push('/dashboard');
        return;
      }
    } finally {
      setLoading(false);
      logger.debug('Loading desactivado');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ecucondor-yellow"></div>
          <p className="mt-4 text-ecucondor-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-ecucondor-secondary mb-4">
            Acceso Requerido
          </h2>
          <p className="text-ecucondor-muted mb-6">
            Necesitas iniciar sesión para usar la calculadora de cambio.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full btn-ecucondor-primary py-3 px-6 rounded-lg text-center font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/" 
              className="block w-full btn-ecucondor-secondary py-3 px-6 rounded-lg text-center font-medium"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ecucondor-primary">
      <Header showLogout={true} />
      <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ecucondor-secondary mb-2">
              💱 Calculadora de Cambio
            </h1>
            <p className="text-ecucondor-muted">
              Convierte entre USD, ARS y BRL con tasas en tiempo real
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-ecucondor-muted">
              Bienvenido/a, <span className="font-medium">{user.email}</span>
            </p>
            {lastUpdate && (
              <p className="text-xs text-ecucondor-muted">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Calculator Card */}
        <div className="bg-ecucondor-secondary rounded-lg p-6 shadow-lg">
          {/* Currency Pair Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ecucondor-secondary mb-3">
              Par de Divisas
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['USD-ARS', 'USD-BRL', 'ARS-BRL'] as const).map((pair) => (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedPair === pair
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                      : 'bg-ecucondor-tertiary border-2 border-ecucondor-tertiary text-ecucondor-secondary hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-sm font-medium">{pair}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {CURRENCY_FLAGS[currencies.from]} → {CURRENCY_FLAGS[currencies.to]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ecucondor-secondary mb-3">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransactionType('buy')}
                className={`p-4 rounded-lg text-center transition-all ${
                  transactionType === 'buy'
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : 'bg-ecucondor-tertiary border-2 border-ecucondor-tertiary text-ecucondor-secondary hover:border-green-500/50'
                }`}
              >
                <div className="text-sm">Vender</div>
                <div className="text-xs opacity-75 mt-1">
                  {selectedPair.split('-')[1]} → {selectedPair.split('-')[0]}
                </div>
                <div className="text-xs opacity-50 mt-1">
                  (Envías {selectedPair.split('-')[1]}, recibes {selectedPair.split('-')[0]})
                </div>
              </button>
              <button
                onClick={() => setTransactionType('sell')}
                className={`p-4 rounded-lg text-center transition-all ${
                  transactionType === 'sell'
                    ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                    : 'bg-ecucondor-tertiary border-2 border-ecucondor-tertiary text-ecucondor-secondary hover:border-blue-500/50'
                }`}
              >
                <div className="text-sm">Comprar</div>
                <div className="text-xs opacity-75 mt-1">
                  Dólares Ecuatorianos
                </div>
                <div className="text-xs opacity-50 mt-1">
                  (Envías {selectedPair.split('-')[1]}, recibes USD)
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-ecucondor-secondary mb-2">
                {transactionType === 'buy' ? 'Envías' : 'Envías'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                  {transactionType === 'buy' 
                    ? CURRENCY_FLAGS[currencies.from]
                    : CURRENCY_FLAGS[currencies.to]
                  }
                </div>
                <input
                  type="text"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent text-xl font-semibold text-ecucondor-primary placeholder-ecucondor-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ecucondor-secondary mb-2">
                Recibes
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                  {transactionType === 'buy' 
                    ? CURRENCY_FLAGS[currencies.to]
                    : CURRENCY_FLAGS[currencies.from]
                  }
                </div>
                <input
                  type="text"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent text-xl font-semibold text-ecucondor-primary placeholder-ecucondor-muted"
                />
              </div>
            </div>
          </div>

          {/* Rate Information */}
          {selectedRate && (
            <div className="bg-ecucondor-tertiary/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ecucondor-muted">
                  Tasa {transactionType === 'sell' ? 'venta' : 'compra'}:
                </span>
                <span className="font-semibold text-ecucondor-secondary">
                  {formatNumber(transactionType === 'sell' ? selectedRate.sell_rate : selectedRate.buy_rate)}
                </span>
              </div>
              {selectedRate.spread > 0 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-ecucondor-muted">Spread:</span>
                  <span className="text-ecucondor-secondary">
                    {formatNumber(selectedRate.spread)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={showTransactionSummary}
              disabled={!transactionDetails || isCalculating}
              className="flex-1 btn-ecucondor-primary py-4 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculando...
                </span>
              ) : (
                '💳 Ver Resumen y Proceder'
              )}
            </button>
          </div>

          {/* Loading indicator */}
          {isCalculating && (
            <div className="text-center mt-4">
              <p className="text-sm text-ecucondor-muted">Calculando conversión...</p>
            </div>
          )}
        </div>

        {/* Transaction Summary Modal */}
        {showSummary && transactionDetails && (
          <TransactionSummary
            details={transactionDetails}
            userEmail={user?.email}
            onClose={() => setShowSummary(false)}
            onDownloadPDF={handleDownloadPDF}
            loading={loading}
          />
        )}
      </div>
      </div>
    </div>
  );
}