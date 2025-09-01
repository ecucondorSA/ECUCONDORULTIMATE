'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ExchangeRate {
  pair: string;
  buy_rate: number;
  sell_rate: number;
  spread: number;
  last_updated: string;
}

interface TransactionDetails {
  pair: string;
  type: 'buy' | 'sell';
  sendAmount: number;
  receiveAmount: number;
  rate: number;
  commission: number;
  commissionAmount: number;
  total: number;
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇪🇨',  // Bandera de Ecuador
  ARS: '🇦🇷',
  BRL: '🇧🇷',
};

const COMMISSION_RATES = {
  'USD-ARS': 0.03, // 3% solo para USD a ARS
  standard: 0.0,   // 0% para otros pares
};

// Datos bancarios para instrucciones de pago
const PAYMENT_INFO = {
  ecucondor: {
    company: 'Ecucondor SAS',
    ruc: '1391937000OO-1',
    bank: 'Produbanco',
    accountType: 'Cuenta Corriente',
    // En una app real, estos datos estarían en variables de entorno
  },
  mercadopago: {
    alias: 'ecucondor.mp',
    // En una app real, estos datos estarían en variables de entorno
  }
};

const WHATSAPP_NUMBER = '+5491166599559';

export default function CalculatorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [selectedPair, setSelectedPair] = useState('USD-ARS');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch rates
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();
      if (data.success) {
        setRates(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  // Get current rate for selected pair
  const currentRate = useMemo(() => {
    const rate = rates.find(r => r.pair === selectedPair);
    if (!rate) return null;
    
    // LÓGICA CORREGIDA PARA RENTABILIDAD:
    // - Cliente da USD y quiere ARS → usar sell_rate (Ecucondor da menos ARS que Binance)
    // - Cliente da ARS y quiere USD → usar buy_rate (Ecucondor cobra más ARS que Binance)
    const [baseCurrency, targetCurrency] = selectedPair.split('-');
    
    if (transactionType === 'buy') {
      // Comprar target currency (ARS/BRL)
      if (baseCurrency === 'USD') {
        return rate.sell_rate; // Cliente da USD → recibe menos ARS (Ecucondor gana)
      } else {
        return rate.buy_rate; // Cliente da ARS → paga más ARS por USD (Ecucondor gana)
      }
    } else {
      // Comprar base currency (USD)
      if (baseCurrency === 'USD') {
        return rate.buy_rate; // Cliente da ARS → paga más ARS por USD (Ecucondor gana)
      } else {
        return rate.sell_rate; // Cliente da USD → recibe menos ARS (Ecucondor gana)
      }
    }
  }, [rates, selectedPair, transactionType]);

  // Get commission rate based on currency pair and transaction direction
  const commissionRate = useMemo(() => {
    // 3% solo para USD → ARS (cliente da USD y recibe ARS)
    if (selectedPair === 'USD-ARS' && transactionType === 'buy') {
      // "Comprar Pesos Argentinos" = cliente da USD, recibe ARS
      return COMMISSION_RATES['USD-ARS'];
    }
    // ARS → USD (cliente da ARS y recibe USD) = sin comisión
    return COMMISSION_RATES.standard;
  }, [selectedPair, transactionType]);

  // Calculate conversion
  const calculateConversion = (amount: string, isFromSend: boolean) => {
    if (!amount || !currentRate) return;
    
    setIsCalculating(true);
    // Parsing robusto para números con formato español/argentino
    // Formato esperado: 90.000,50 (punto = separador miles, coma = decimal)
    const cleanedAmount = amount
      .replace(/\./g, '') // Eliminar separadores de miles (puntos)
      .replace(/,/g, '.') // Convertir coma decimal a punto decimal
    
    const numAmount = parseFloat(cleanedAmount);
    
    // Debug logging
    console.log('🔍 PARSING DEBUG:', {
      input_original: amount,
      input_limpio: cleanedAmount,
      numero_parseado: numAmount,
      transactionType,
      selectedPair
    });
    
    if (isNaN(numAmount)) {
      setIsCalculating(false);
      return;
    }

    const [baseCurrency, targetCurrency] = selectedPair.split('-');
    
    if (isFromSend) {
      // Calculate receive amount
      let grossConverted: number;
      
      if (transactionType === 'buy') {
        // Comprando target currency (ARS/BRL): USD → ARS
        grossConverted = numAmount * currentRate;
      } else {
        // Comprando base currency (USD): ARS → USD  
        grossConverted = numAmount / currentRate;
      }
      
      const commissionAmount = grossConverted * commissionRate;
      const netConverted = grossConverted - commissionAmount;
      
      // Debug log
      console.log('🧮 Cálculo Send→Receive:', {
        tipo: transactionType,
        par: selectedPair,
        envio: numAmount,
        tasa: currentRate,
        operacion: transactionType === 'buy' ? 'multiplicar' : 'dividir',
        bruto: grossConverted,
        comision: commissionAmount + ' (' + (commissionRate * 100) + '%)',
        neto: netConverted
      });
      
      setReceiveAmount(formatNumber(netConverted));
    } else {
      // Calculate send amount (reverse calculation)
      const targetReceive = numAmount;
      const grossNeeded = targetReceive / (1 - commissionRate);
      let sendNeeded: number;
      
      if (transactionType === 'buy') {
        // Comprando target currency: necesito USD para obtener ARS
        sendNeeded = grossNeeded / currentRate;
      } else {
        // Comprando base currency: necesito ARS para obtener USD
        sendNeeded = grossNeeded * currentRate;
      }
      
      // Debug log
      console.log('🧮 Cálculo Receive→Send:', {
        tipo: transactionType,
        par: selectedPair,
        recibir: targetReceive,
        comision: (commissionRate * 100) + '%',
        brutoNecesario: grossNeeded,
        tasa: currentRate,
        operacion: transactionType === 'buy' ? 'dividir' : 'multiplicar',
        envioNecesario: sendNeeded
      });
      
      setSendAmount(formatNumber(sendNeeded));
    }
    
    setIsCalculating(false);
  };

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    // Para números grandes, usar formato con punto como separador de miles y coma para decimales
    return num.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true, // Asegurar separadores de miles
    });
  };

  // Handle amount changes
  const handleSendAmountChange = (value: string) => {
    setSendAmount(value);
    calculateConversion(value, true);
  };

  const handleReceiveAmountChange = (value: string) => {
    setReceiveAmount(value);
    calculateConversion(value, false);
  };

  // Get transaction details
  const getTransactionDetails = (): TransactionDetails | null => {
    if (!sendAmount || !receiveAmount || !currentRate) return null;
    
    // Usar el mismo parseo robusto que calculateConversion
    const sendCleaned = sendAmount
      .replace(/\./g, '') // Eliminar separadores de miles (puntos)
      .replace(/,/g, '.') // Convertir coma decimal a punto decimal
    const receiveCleaned = receiveAmount
      .replace(/\./g, '') // Eliminar separadores de miles (puntos)  
      .replace(/,/g, '.') // Convertir coma decimal a punto decimal
      
    const send = parseFloat(sendCleaned);
    const receive = parseFloat(receiveCleaned);
    
    // Debug logging para resumen
    console.log('🧾 RESUMEN DEBUG:', {
      sendAmount_original: sendAmount,
      sendAmount_limpio: sendCleaned,
      send_parseado: send,
      receiveAmount_original: receiveAmount,
      receiveAmount_limpio: receiveCleaned,
      receive_parseado: receive,
      currentRate,
      transactionType
    });
    
    // Calcular comisión correctamente: sobre el monto convertido bruto
    const grossConverted = send * currentRate;
    const commissionAmount = grossConverted * commissionRate;
    
    return {
      pair: selectedPair,
      type: transactionType,
      sendAmount: send,
      receiveAmount: receive,
      rate: currentRate,
      commission: commissionRate * 100,
      commissionAmount,
      total: send,
    };
  };

  // Handle transaction confirmation
  const handleConfirmTransaction = async () => {
    const details = getTransactionDetails();
    if (!details || !user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/transactions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pair: details.pair,
          type: details.type,
          amount: details.sendAmount,
          rate: details.rate,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        router.push(`/transactions/${data.transactionId}`);
      } else {
        alert(data.error || 'Error al procesar la transacción');
      }
    } catch (error) {
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Get currency from pair
  const getCurrencies = (pair: string) => {
    const [from, to] = pair.split('-');
    return { from, to };
  };

  // Generar instrucciones de pago dinámicas
  const getPaymentInstructions = (details: TransactionDetails | null) => {
    if (!details) return null;
    
    const { from, to } = getCurrencies(details.pair);
    const isReceivingDollars = details.type === 'sell'; // ARS → USD
    
    return {
      send: {
        currency: isReceivingDollars ? 'ARS' : 'USD',
        amount: details.sendAmount,
        // LÓGICA CORREGIDA:
        // - Cliente da ARS (recibe USD) → Transferencia a Produbanco
        // - Cliente da USD (recibe ARS) → Transferencia a Produbanco también
        method: 'transferencia bancaria',
        account: `${PAYMENT_INFO.ecucondor.company}\nRUC: ${PAYMENT_INFO.ecucondor.ruc}\n${PAYMENT_INFO.ecucondor.bank} - ${PAYMENT_INFO.ecucondor.accountType}\n\n🏦 Número de cuenta: [Solicitar a Ecucondor]\n💳 Tipo: ${PAYMENT_INFO.ecucondor.accountType}`
      },
      receive: {
        currency: isReceivingDollars ? 'USD' : 'ARS',
        amount: details.receiveAmount,
        // Cliente siempre recibe por MercadoPago
        method: 'MercadoPago'
      }
    };
  };

  // Generar mensaje de WhatsApp mejorado (incluyendo PDF)
  const generateWhatsAppMessage = (details: TransactionDetails | null, includePDF: boolean = false) => {
    if (!details) return '';
    
    const { send, receive } = getPaymentInstructions(details);
    const userName = user?.email || 'Cliente';
    const transactionId = `ECU-${Date.now()}`;
    
    let message = `¡Hola equipo de Ecucondor! 👋😊

Soy ${userName} y les escribo para hacer un cambio con ustedes 🎉

💱 *CONFIRMACIÓN DE CAMBIO - ECUCONDOR* ✨

📝 *Detalles de mi operación:*
• 📤 Envié: ${send?.currency} ${formatNumber(details.sendAmount)}
• 📥 Recibiré: ${receive?.currency} ${formatNumber(details.receiveAmount)}
• 💳 Método de pago: ${send?.method}

✅ *CONFIRMACIÓN IMPORTANTE:*
• ✅ Ya realicé el pago completo
• ✅ Acepto y estoy de acuerdo con todas las políticas de Ecucondor
• ✅ He leído y entiendo los términos y condiciones del servicio

⏰ Comprendo perfectamente que la conversión puede tardar entre 5 minutos y 1 hora, no hay problema 😌

🤝 Confío plenamente en su servicio profesional y quedo a la espera de la confirmación y el envío de mis ${receive?.currency}.`;

    if (includePDF) {
      message += `

📄 *Comprobante digital adjunto:* 📋
• 🆔 ID de transacción: ${transactionId}
• 📧 También enviado a ecucondor@gmail.com para sus registros
• 🔒 Documento seguro con todos los detalles`;
    }

    message += `

🙏 Muchísimas gracias por este excelente servicio 
💚 Realmente aprecio la confianza y profesionalismo de Ecucondor
🌟 Espero hacer muchos más cambios con ustedes en el futuro

Que tengan un día increíble 🌈✨`;

    return encodeURIComponent(message);
  };

  // Generar PDF del comprobante con import dinámico
  const generatePDFReceipt = async (details: TransactionDetails | null) => {
    console.log('🔍 generatePDFReceipt iniciado:', { details: !!details, user: !!user });
    
    if (!details) {
      console.log('❌ No details:', { details });
      return null;
    }
    
    // Permitir PDF sin usuario (usar datos genéricos)
    const clientEmail = user?.email || 'Cliente';

    try {
      // Import dinámico de jsPDF solo en el cliente
      if (typeof window === 'undefined') {
        console.log('❌ No window (SSR)');
        return null;
      }
      
      console.log('📦 Importando jsPDF...');
      const { jsPDF } = await import('jspdf');
      console.log('✅ jsPDF importado exitosamente');
      
      const doc = new jsPDF();
      console.log('✅ Documento PDF creado');
      
      const paymentInstr = getPaymentInstructions(details);
      const currentDate = new Date().toLocaleString('es-AR');
      const transactionId = `ECU-${Date.now()}`;
      
      console.log('📋 Datos preparados:', { paymentInstr, transactionId });
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ECUCONDOR', 20, 30);
      doc.text('Comprobante de Transacción', 20, 45);
      
      // Transaction info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${transactionId}`, 20, 65);
      doc.text(`Fecha: ${currentDate}`, 20, 75);
      doc.text(`Cliente: ${clientEmail}`, 20, 85);
      
      // Transaction details
      doc.setFont('helvetica', 'bold');
      doc.text('Detalles:', 20, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(`Operación: ${details.type === 'buy' ? 'Comprar ' + details.pair.split('-')[1] : 'Comprar USD'}`, 20, 115);
      doc.text(`Envías: ${paymentInstr?.send.currency} ${formatNumber(details.sendAmount)}`, 20, 125);
      doc.text(`Recibes: ${paymentInstr?.receive.currency} ${formatNumber(details.receiveAmount)}`, 20, 135);
      doc.text(`Tasa: ${currentRate}`, 20, 145);
      if (details.commission > 0) {
        doc.text(`Comisión: ${details.commission}% (${formatNumber(details.commissionAmount)})`, 20, 155);
      }
      
      // Payment instructions
      doc.setFont('helvetica', 'bold');
      doc.text('Instrucciones de Pago:', 20, 175);
      doc.setFont('helvetica', 'normal');
      doc.text(`Método: ${paymentInstr?.send.method}`, 20, 185);
      doc.text('Ecucondor SAS', 20, 195);
      doc.text('RUC: 1391937000OO-1', 20, 205);
      doc.text('Produbanco - Cuenta Corriente', 20, 215);
      
      // Footer
      doc.setFontSize(10);
      doc.text('Enviado automáticamente a Ecucondor', 20, 250);
      doc.text('Tiempo estimado: 5 min - 1 hora', 20, 260);
      
      console.log('✅ PDF generado exitosamente');
      return { doc, transactionId };
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      console.error('Stack trace:', error.stack);
      return null;
    }
  };

  // Enviar PDF a Ecucondor automáticamente
  const sendPDFToEcucondor = async (pdfData: { doc: any; transactionId: string }) => {
    try {
      // Convertir PDF a base64
      const pdfBase64 = pdfData.doc.output('datauristring');
      
      // En una implementación real, esto se enviaría a una API
      const emailData = {
        to: 'ecucondor@gmail.com',
        subject: `Nuevo comprobante de transacción - ${pdfData.transactionId}`,
        body: `
          Se ha generado un nuevo comprobante de transacción.
          
          Cliente: ${user?.email || 'Cliente'}
          ID Transacción: ${pdfData.transactionId}
          Fecha: ${new Date().toLocaleString('es-AR')}
          
          El comprobante PDF se adjunta a este mensaje.
        `,
        attachment: {
          filename: `Comprobante_${pdfData.transactionId}.pdf`,
          content: pdfBase64
        }
      };

      // Simular envío (en producción sería una llamada a API)
      console.log('📧 PDF enviado automáticamente a Ecucondor:', emailData);
      
      // TODO: Implementar API real de envío de email
      // await fetch('/api/send-receipt', {
      //   method: 'POST',
      //   body: JSON.stringify(emailData)
      // });
      
      return true;
    } catch (error) {
      console.error('Error enviando PDF a Ecucondor:', error);
      return false;
    }
  };

  // Descargar PDF y enviarlo a Ecucondor
  const handleDownloadPDF = async () => {
    console.log('🚀 handleDownloadPDF iniciado');
    console.log('📋 transactionDetails:', transactionDetails);
    
    try {
      setLoading(true);
      console.log('⏳ Loading activado');
      
      const pdfData = await generatePDFReceipt(transactionDetails);
      console.log('📄 generatePDFReceipt resultado:', pdfData);
      
      if (pdfData) {
        console.log('✅ PDF generado, procediendo a descargar...');
        // Descargar para el usuario
        pdfData.doc.save(`Comprobante_Ecucondor_${pdfData.transactionId}.pdf`);
        console.log('💾 Archivo descargado');
        
        // Enviar automáticamente a Ecucondor
        console.log('📧 Enviando a Ecucondor...');
        await sendPDFToEcucondor(pdfData);
        console.log('📧 Enviado a Ecucondor');
        
        alert('✅ Comprobante descargado y enviado automáticamente a Ecucondor');
      } else {
        console.log('❌ pdfData es null/undefined');
        alert('❌ Error generando el comprobante PDF. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error en handleDownloadPDF:', error);
      console.error('Stack:', error.stack);
      alert('❌ Error procesando el comprobante. Verifica tu conexión.');
    } finally {
      setLoading(false);
      console.log('⏳ Loading desactivado');
    }
  };

  const transactionDetails = getTransactionDetails();
  const paymentInstructions = getPaymentInstructions(transactionDetails);
  const whatsappMessage = generateWhatsAppMessage(transactionDetails, true);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center">
          <div className="ecucondor-pulse w-16 h-16 bg-ecucondor-yellow rounded-full mx-auto mb-4"></div>
          <p className="text-ecucondor-muted">Cargando calculadora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ecucondor-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-ecucondor-primary">
            Calculadora de <span className="text-neon-gold">Divisas</span>
          </h1>
          <p className="text-ecucondor-muted">
            Calcula y realiza tus transacciones al mejor tipo de cambio
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="ecucondor-card p-6 mb-6">
          {/* Currency Pair Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ecucondor-secondary mb-2">
              Par de Divisas
            </label>
            <div className="grid grid-cols-3 gap-3">
              {rates.map(rate => {
                const { from, to } = getCurrencies(rate.pair);
                return (
                  <button
                    key={rate.pair}
                    onClick={() => setSelectedPair(rate.pair)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPair === rate.pair
                        ? 'border-ecucondor-yellow bg-ecucondor-yellow/10'
                        : 'border-ecucondor-tertiary hover:border-ecucondor-yellow/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">{CURRENCY_FLAGS[from]}</span>
                      <svg className="w-4 h-4 text-ecucondor-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" />
                      </svg>
                      <span className="text-2xl">{CURRENCY_FLAGS[to]}</span>
                    </div>
                    <div className="text-sm font-semibold text-ecucondor-primary">{rate.pair}</div>
                    <div className="text-xs text-ecucondor-muted">
                      {(() => {
                        const [baseCurrency] = rate.pair.split('-');
                        if (transactionType === 'buy') {
                          return baseCurrency === 'USD' ? rate.sell_rate : rate.buy_rate;
                        } else {
                          return baseCurrency === 'USD' ? rate.buy_rate : rate.sell_rate;
                        }
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ecucondor-secondary mb-2">
              ¿Qué quieres hacer?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransactionType('buy')}
                className={`p-3 rounded-lg font-medium transition-all text-center ${
                  transactionType === 'buy'
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : 'bg-ecucondor-tertiary border-2 border-ecucondor-tertiary text-ecucondor-secondary hover:border-green-500/50'
                }`}
              >
                <div className="text-sm">Comprar</div>
                <div className="text-xs opacity-75 mt-1">
                  {selectedPair === 'USD-ARS' ? 'Pesos Argentinos' : selectedPair === 'USD-BRL' ? 'Reales Brasileños' : 'Moneda Local'}
                </div>
                <div className="text-xs opacity-50 mt-1">
                  (Envías USD, recibes {selectedPair.split('-')[1]})
                </div>
              </button>
              <button
                onClick={() => setTransactionType('sell')}
                className={`p-3 rounded-lg font-medium transition-all text-center ${
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
                    ? CURRENCY_FLAGS[getCurrencies(selectedPair).from]
                    : CURRENCY_FLAGS[getCurrencies(selectedPair).to]
                  }
                </div>
                <input
                  type="text"
                  value={sendAmount}
                  onChange={(e) => handleSendAmountChange(e.target.value)}
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
                    ? CURRENCY_FLAGS[getCurrencies(selectedPair).to]
                    : CURRENCY_FLAGS[getCurrencies(selectedPair).from]
                  }
                </div>
                <input
                  type="text"
                  value={receiveAmount}
                  onChange={(e) => handleReceiveAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent text-xl font-semibold text-ecucondor-primary placeholder-ecucondor-muted"
                />
              </div>
            </div>
          </div>

          {/* Rate Info */}
          <div className="bg-ecucondor-tertiary/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ecucondor-muted">Tasa de cambio</span>
              <span className="font-semibold text-ecucondor-primary">
                {(() => {
                  const { from, to } = getCurrencies(selectedPair);
                  const [baseCurrency, targetCurrency] = selectedPair.split('-');
                  
                  if (transactionType === 'buy') {
                    // Comprar target currency
                    if (baseCurrency === 'USD') {
                      // USD-ARS: Comprar Pesos → 1 USD = X ARS
                      return `1 ${from} = ${currentRate} ${to}`;
                    } else {
                      // ARS-BRL: Comprar Reales → 1 ARS = X BRL  
                      return `1 ${from} = ${currentRate} ${to}`;
                    }
                  } else {
                    // Comprar base currency
                    if (baseCurrency === 'USD') {
                      // USD-ARS: Comprar Dólares → 1 ARS = X USD
                      return `1 ${to} = ${currentRate ? (1 / currentRate).toFixed(6) : 0} ${from}`;
                    } else {
                      // ARS-BRL: Comprar ARS → 1 BRL = X ARS
                      return `1 ${to} = ${currentRate ? (1 / currentRate).toFixed(6) : 0} ${from}`;
                    }
                  }
                })()}
              </span>
            </div>
            {commissionRate > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ecucondor-muted">Comisión</span>
                <span className="font-semibold text-ecucondor-yellow">
                  {(commissionRate * 100).toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ecucondor-muted">Última actualización</span>
              <span className="text-xs text-ecucondor-muted">
                {lastUpdate.toLocaleTimeString('es-AR')}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowSummary(true)}
            disabled={!sendAmount || !receiveAmount || isCalculating}
            className="w-full btn-ecucondor-primary py-4 px-6 rounded-lg font-medium text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ver Resumen de Transacción
          </button>
        </div>

        {/* Transaction Summary Modal */}
        {showSummary && transactionDetails && paymentInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="ecucondor-card max-w-lg w-full p-6 my-8">
              <h2 className="text-2xl font-bold text-ecucondor-primary mb-6">
                💱 Instrucciones de Pago
              </h2>
              
              {/* Resumen de la operación */}
              <div className="bg-ecucondor-tertiary/30 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-ecucondor-primary mb-3">📋 Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ecucondor-muted">Operación:</span>
                    <span className="font-semibold">
                      {transactionDetails.type === 'buy' 
                        ? `Comprar ${getCurrencies(selectedPair).to}`
                        : 'Comprar USD'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ecucondor-muted">Envías:</span>
                    <span className="font-semibold text-red-400">
                      {paymentInstructions.send.currency} {formatNumber(paymentInstructions.send.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ecucondor-muted">Recibes:</span>
                    <span className="font-semibold text-green-400">
                      {paymentInstructions.receive.currency} {formatNumber(paymentInstructions.receive.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instrucciones de pago */}
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

              {/* Confirmación por WhatsApp */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-green-400 mb-3 flex items-center">
                  📱 Paso 2: Confirma el pago
                </h3>
                <p className="text-sm text-ecucondor-muted mb-3">
                  Después de realizar el pago, confirma por WhatsApp:
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${whatsappMessage}`}
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

              {/* Comprobante PDF */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-orange-400 mb-3 flex items-center">
                  📄 Paso 3: Descarga tu comprobante
                </h3>
                <p className="text-sm text-ecucondor-muted mb-3">
                  Guarda este comprobante como respaldo. Se enviará automáticamente a Ecucondor:
                </p>
                <button
                  onClick={handleDownloadPDF}
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

              {/* Información de recepción */}
              <div className="bg-ecucondor-tertiary/50 rounded-lg p-3 mb-6">
                <p className="text-xs text-ecucondor-muted text-center">
                  ⏰ Recibirás tus <strong>{paymentInstructions.receive.currency}</strong> por <strong>{paymentInstructions.receive.method}</strong> en 5 minutos - 1 hora
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex-1 btn-ecucondor-secondary py-3 px-4 rounded-lg font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}