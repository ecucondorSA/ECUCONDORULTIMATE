/**
 * Calculator utilities for currency conversion and formatting
 */

import { Currency, CurrencyConfig, TransactionDetails, ExchangeRate, COMMISSION_RATES } from '@/lib/types/calculator';
import { logger } from '@/lib/utils/logger';

/**
 * Parse currency pair string to get from/to currencies
 */
export function getCurrencies(pair: string): CurrencyConfig {
  const [from, to] = pair.split('-') as [Currency, Currency];
  return { from, to };
}

/**
 * Format number with proper locale formatting
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return '0,00';
  
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Parse and clean amount string for calculations
 */
export function parseAmount(amount: string): number {
  if (!amount) return 0;
  
  // Remove formatting and convert to number
  const cleanedAmount = amount
    .replace(/\s/g, '') // Remove spaces
    .replace(/\./g, '') // Remove thousand separators (dots)
    .replace(/,/g, '.'); // Convert comma decimal to point decimal
    
  const numAmount = parseFloat(cleanedAmount);
  logger.debug('PARSING DEBUG', {
    input_original: amount,
    input_limpio: cleanedAmount,
    numero_parseado: numAmount,
  });
  
  return isNaN(numAmount) ? 0 : numAmount;
}

/**
 * Calculate conversion from send amount to receive amount
 */
export function calculateSendToReceive(
  sendAmount: number,
  rate: ExchangeRate,
  transactionType: 'buy' | 'sell',
  pair: string
): number {
  if (!rate || sendAmount <= 0) return 0;
  
  const currentRate = transactionType === 'sell' ? rate.sell_rate : rate.buy_rate;
  const commissionRate = COMMISSION_RATES[pair] || COMMISSION_RATES.standard;
  
  let receiveAmount: number;
  
  if (transactionType === 'sell') {
    // Client sells base currency (USD) for target currency (ARS)
    const grossConverted = sendAmount * currentRate;
    const commissionAmount = grossConverted * commissionRate;
    receiveAmount = grossConverted - commissionAmount;
  } else {
    // Client buys base currency (USD) with target currency (ARS)
    receiveAmount = sendAmount / currentRate;
  }
  
  logger.debug('Cálculo Send→Receive', {
    tipo: transactionType,
    par: pair,
    envio: sendAmount,
    tasa: currentRate,
    comision: (commissionRate * 100) + '%',
    resultado: receiveAmount
  });
  
  return Math.max(0, receiveAmount);
}

/**
 * Calculate send amount needed for desired receive amount
 */
export function calculateReceiveToSend(
  receiveAmount: number,
  rate: ExchangeRate,
  transactionType: 'buy' | 'sell',
  pair: string
): number {
  if (!rate || receiveAmount <= 0) return 0;
  
  const currentRate = transactionType === 'sell' ? rate.sell_rate : rate.buy_rate;
  const commissionRate = COMMISSION_RATES[pair] || COMMISSION_RATES.standard;
  
  let sendAmount: number;
  
  if (transactionType === 'sell') {
    // Work backwards: desired receive + commission = gross, then divide by rate
    const grossNeeded = receiveAmount / (1 - commissionRate);
    sendAmount = grossNeeded / currentRate;
  } else {
    // For buy: multiply receive amount by rate
    sendAmount = receiveAmount * currentRate;
  }
  
  logger.debug('Cálculo Receive→Send', {
    tipo: transactionType,
    par: pair,
    recibir: receiveAmount,
    comision: (commissionRate * 100) + '%',
    resultado: sendAmount
  });
  
  return Math.max(0, sendAmount);
}

/**
 * Get transaction details from current state
 */
export function getTransactionDetails(
  transactionType: 'buy' | 'sell',
  selectedPair: string,
  sendAmount: string,
  receiveAmount: string,
  selectedRate: ExchangeRate | null
): TransactionDetails | null {
  const send = parseAmount(sendAmount);
  const receive = parseAmount(receiveAmount);
  
  if (!selectedRate || send <= 0 || receive <= 0) {
    return null;
  }
  
  const commissionRate = COMMISSION_RATES[selectedPair] || COMMISSION_RATES.standard;
  const rate = transactionType === 'sell' ? selectedRate.sell_rate : selectedRate.buy_rate;
  
  logger.debug('RESUMEN DEBUG', {
    transactionType,
    selectedPair,
    sendAmount,
    receiveAmount,
    currentRate: rate
  });
  
  return {
    type: transactionType,
    pair: selectedPair,
    sendAmount: send,
    receiveAmount: receive,
    rate,
    commission: commissionRate,
    commissionAmount: transactionType === 'sell' ? (receive * commissionRate) : 0
  };
}

/**
 * Generate WhatsApp message with transaction details
 */
export function generateWhatsAppMessage(
  details: TransactionDetails | null,
  paymentInstructions: any,
  userEmail: string | null,
  includePDF: boolean = false
): string {
  if (!details) return '';
  
  const userName = userEmail || 'Cliente';
  const transactionId = `ECU-${Date.now()}`;
  
  let message = `¡Hola equipo de Ecucondor! 👋😊

Soy ${userName} y les escribo para hacer un cambio con ustedes 🎉

💱 *CONFIRMACIÓN DE CAMBIO - ECUCONDOR* ✨

📝 *Detalles de mi operación:*
• 📤 Envié: ${paymentInstructions?.send?.currency} ${formatNumber(details.sendAmount)}
• 📥 Recibiré: ${paymentInstructions?.receive?.currency} ${formatNumber(details.receiveAmount)}
• 💳 Método de pago: ${paymentInstructions?.send?.method}

✅ *CONFIRMACIÓN IMPORTANTE:*
• ✅ Ya realicé el pago completo
• ✅ Acepto y estoy de acuerdo con todas las políticas de Ecucondor
• ✅ He leído y entiendo los términos y condiciones del servicio

⏰ Comprendo perfectamente que la conversión puede tardar entre 5 minutos y 1 hora, no hay problema 😌

🤝 Confío plenamente en su servicio profesional y quedo a la espera de la confirmación y el envío de mis ${paymentInstructions?.receive?.currency}.`;

  if (includePDF) {
    message += `

📄 *Comprobante digital adjunto:* 📋
• 🆔 ID de transacción: ${transactionId}
• 📧 También enviado a su sistema para sus registros
• 🔒 Documento seguro con todos los detalles`;
  }

  message += `

🙏 Muchísimas gracias por este excelente servicio 
💚 Realmente aprecio la confianza y profesionalismo de Ecucondor
🌟 Espero hacer muchos más cambios con ustedes en el futuro

Que tengan un día increíble 🌈✨`;

  return encodeURIComponent(message);
}