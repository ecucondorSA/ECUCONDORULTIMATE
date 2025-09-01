/**
 * Payment Instructions Component
 * Displays payment methods and account details for transactions
 */

import { TransactionDetails, PaymentInstructions as PaymentInstructionsType } from '@/lib/types/calculator';
import { COMPANY_CONFIG } from '@/lib/config/company';
import { formatNumber } from '@/lib/utils/calculator-utils';

interface PaymentInstructionsProps {
  details: TransactionDetails;
}

// Payment data configuration - now from env vars
const PAYMENT_DATA = {
  ecucondor: {
    company: COMPANY_CONFIG.name,
    ruc: COMPANY_CONFIG.ruc,
    bank: COMPANY_CONFIG.bank,
    accountType: COMPANY_CONFIG.bankAccountType,
  },
  mercadopago: {
    alias: 'ecucondor.mp',
  }
};

export default function PaymentInstructions({ details }: PaymentInstructionsProps) {
  // Generate payment instructions based on transaction details
  const getPaymentInstructions = (): PaymentInstructionsType => {
    const isReceivingDollars = details.type === 'sell'; // Selling ARS to get USD
    
    return {
      send: {
        currency: isReceivingDollars ? 'ARS' : 'USD',
        amount: details.sendAmount,
        // LÓGICA CORREGIDA:
        // - Cliente da ARS (recibe USD) → Transferencia a Produbanco
        // - Cliente da USD (recibe ARS) → Transferencia a Produbanco también
        method: 'transferencia bancaria',
        account: `${PAYMENT_DATA.ecucondor.company}\nRUC: ${PAYMENT_DATA.ecucondor.ruc}\n${PAYMENT_DATA.ecucondor.bank} - ${PAYMENT_DATA.ecucondor.accountType}\n\n🏦 Número de cuenta: [Solicitar a Ecucondor]\n💳 Tipo: ${PAYMENT_DATA.ecucondor.accountType}`
      },
      receive: {
        currency: isReceivingDollars ? 'USD' : 'ARS',
        amount: details.receiveAmount,
        // Cliente siempre recibe por MercadoPago
        method: 'MercadoPago'
      }
    };
  };

  const paymentInstructions = getPaymentInstructions();

  return (
    <div className="space-y-6">
      {/* Instrucciones de Pago */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-400 mb-3 flex items-center">
          💳 Paso 1: Realiza el pago
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-ecucondor-muted">
            Debes enviar <strong className="text-red-400">{paymentInstructions.send.currency} {formatNumber(paymentInstructions.send.amount)}</strong> por <strong>{paymentInstructions.send.method}</strong>:
          </p>
          <div className="bg-ecucondor-secondary rounded p-3 font-mono text-xs">
            <div className="whitespace-pre-line text-ecucondor-primary">
              {paymentInstructions.send.account}
            </div>
          </div>
          <p className="text-xs text-ecucondor-yellow">
            ⚠️ Importante: Guarda el comprobante de pago
          </p>
        </div>
      </div>

      {/* Información de recepción */}
      <div className="bg-ecucondor-tertiary/50 rounded-lg p-3 mb-6">
        <p className="text-xs text-ecucondor-muted text-center">
          ⏰ Recibirás tus <strong>{paymentInstructions.receive.currency}</strong> por <strong>{paymentInstructions.receive.method}</strong> en 5 minutos - 1 hora
        </p>
      </div>
    </div>
  );
}