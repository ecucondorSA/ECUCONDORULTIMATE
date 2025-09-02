/**
 * Transaction Summary Component
 * Shows complete transaction details with WhatsApp and PDF actions
 */

import { memo } from 'react';
import { TransactionDetails } from '@/lib/types/calculator';
import { COMPANY_CONFIG } from '@/lib/config/company';
import { generateWhatsAppMessage } from '@/lib/utils/calculator-utils';
import PaymentInstructions from './PaymentInstructions';

interface TransactionSummaryProps {
  details: TransactionDetails;
  userEmail: string | null;
  onClose: () => void;
  onDownloadPDF: () => void;
  loading: boolean;
}

function TransactionSummary({
  details,
  userEmail,
  onClose,
  onDownloadPDF,
  loading
}: TransactionSummaryProps) {
  const whatsappMessage = generateWhatsAppMessage(details, {}, userEmail, true);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-ecucondor-primary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 ¡Resumen de Transacción!
            </h2>
            <p className="text-ecucondor-muted">
              Confirma los detalles y procede con el pago
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-ecucondor-secondary rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💱</div>
              <div className="text-lg">
                <span className="text-red-400 font-semibold">
                  Envías: {details.type === 'buy' ? 'ARS' : 'USD'} {details.sendAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-2xl my-2">↓</div>
              <div className="text-lg">
                <span className="text-green-400 font-semibold">
                  Recibes: {details.type === 'buy' ? 'USD' : 'ARS'} {details.receiveAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-ecucondor-muted mt-2">
                Tasa: {details.rate} • {details.commission > 0 ? `Comisión: ${(details.commission * 100)}%` : 'Sin comisión'}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <PaymentInstructions details={details} />

          {/* WhatsApp Confirmation */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-green-400 mb-3 flex items-center">
              📱 Paso 2: Confirma el pago
            </h3>
            <p className="text-sm text-ecucondor-muted mb-3">
              Después de realizar el pago, confirma por WhatsApp:
            </p>
            <a
              href={`https://wa.me/${COMPANY_CONFIG.whatsappFormatted}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Confirmar Pago por WhatsApp
            </a>
          </div>

          {/* PDF Download */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-orange-400 mb-3 flex items-center">
              📄 Paso 3: Descarga tu comprobante
            </h3>
            <p className="text-sm text-ecucondor-muted mb-3">
              Guarda este comprobante como respaldo. Se enviará automáticamente a Ecucondor:
            </p>
            <button
              onClick={onDownloadPDF}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Comprobante PDF
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-ecucondor-secondary py-3 px-4 rounded-lg font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TransactionSummary);