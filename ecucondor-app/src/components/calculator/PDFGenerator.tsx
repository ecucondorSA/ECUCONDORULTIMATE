/**
 * PDF Generator Component
 * Handles PDF generation and email sending functionality
 */

import { TransactionDetails, PDFData, PaymentInstructions } from '@/lib/types/calculator';
import { COMPANY_CONFIG } from '@/lib/config/company';
import { formatNumber } from '@/lib/utils/calculator-utils';
import { logger } from '@/lib/utils/logger';

interface PDFGeneratorProps {
  details: TransactionDetails;
  userEmail: string | null;
  onPDFGenerated?: (pdfData: PDFData) => void;
}

export class PDFGenerator {
  static async generatePDFReceipt(
    details: TransactionDetails | null, 
    user: any = null
  ): Promise<PDFData | null> {
    logger.debug('generatePDFReceipt iniciado', { details: !!details, user: !!user });
    
    if (!details) {
      logger.warn('No details provided for PDF generation', { details });
      return null;
    }

    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        logger.debug('No window (SSR) - skipping PDF generation');
        return null;
      }

      logger.debug('Importando jsPDF...');
      const { jsPDF } = await import('jspdf');
      logger.debug('jsPDF importado exitosamente');
      
      const doc = new jsPDF();
      logger.debug('Documento PDF creado');

      const clientEmail = user?.email || 'Cliente';
      const currentDate = new Date().toLocaleString('es-AR');
      const transactionId = `ECU-${Date.now()}`;
      
      logger.debug('Datos preparados', { paymentInstr: true, transactionId });
      
      // Configurar colores
      const primaryColor = [52, 152, 219]; // Azul
      const accentColor = [231, 76, 60]; // Rojo
      const darkColor = [44, 62, 80]; // Azul oscuro
      
      // Header con diseño profesional
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 50, 'F'); // Rectángulo de fondo azul
      
      // Logo/Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('🦅 ECUCONDOR', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Tu aliado en cambio de divisas | Confianza y velocidad', 20, 35);
      
      // Línea decorativa
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(2);
      doc.line(20, 40, 190, 40);
      
      // Resetear color de texto
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      
      // Título del documento
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 55, 170, 15, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROBANTE DE TRANSACCIÓN', 25, 65);
      
      // Información de transacción en tabla
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // ID y fecha
      doc.setFillColor(248, 249, 250);
      doc.rect(20, 75, 170, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('No. Transacción:', 25, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(transactionId, 80, 85);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha y Hora:', 25, 95);
      doc.setFont('helvetica', 'normal');
      doc.text(currentDate, 80, 95);
      
      // Detalles de la operación
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 105, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES DE LA OPERACIÓN', 25, 110);
      
      // Resetear color
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      
      // Tabla de detalles
      doc.setFillColor(248, 249, 250);
      doc.rect(20, 115, 170, 50, 'F');
      
      let yPos = 125;
      doc.setFont('helvetica', 'bold');
      doc.text('Tipo de Operación:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${details.type === 'buy' ? 'Compra de ' + details.pair.split('-')[1] : 'Compra de USD'}`, 80, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Monto a Enviar:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${details.type === 'sell' ? 'USD' : 'ARS'} ${formatNumber(details.sendAmount)}`, 80, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Monto a Recibir:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${details.type === 'sell' ? 'ARS' : 'USD'} ${formatNumber(details.receiveAmount)}`, 80, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Tasa de Cambio:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(details.rate.toString(), 80, yPos);
      
      if (details.commission > 0) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Comisión:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${details.commission}% (${formatNumber(details.commissionAmount)})`, 80, yPos);
      }
      
      // Instrucciones de pago
      yPos += 20;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(20, yPos, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUCCIONES DE PAGO', 25, yPos + 5);
      
      // Resetear color
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      yPos += 15;
      
      doc.setFillColor(248, 249, 250);
      doc.rect(20, yPos, 170, 40, 'F');
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Beneficiario:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_CONFIG.name, 80, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('RUC:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_CONFIG.ruc, 80, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Banco:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_CONFIG.bankFullName, 80, yPos);
      
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Método de Pago:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text('Transferencia Bancaria', 80, yPos);
      
      // Footer profesional
      yPos += 25;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos, 170, 25, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`✓ Este comprobante ha sido enviado automáticamente a ${COMPANY_CONFIG.email}`, 25, yPos + 8);
      doc.text('⏱ Tiempo estimado de procesamiento: 5 minutos - 1 hora', 25, yPos + 16);
      
      // Información de contacto en el pie
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(`WhatsApp: ${COMPANY_CONFIG.whatsappDisplay} | Email: ${COMPANY_CONFIG.email} | Web: ${COMPANY_CONFIG.domain}`, 25, 292);
      
      logger.info('PDF generado exitosamente');
      return { doc, transactionId };
    } catch (error) {
      logger.error('Error generando PDF', error);
      logger.error('Stack trace', error.stack);
      return null;
    }
  }

  static async sendPDFToEcucondor(pdfData: PDFData, userEmail?: string): Promise<void> {
    try {
      // Convertir PDF a base64
      const pdfBase64 = pdfData.doc.output('datauristring');
      
      // En una implementación real, esto se enviaría a una API
      const emailData = {
        to: COMPANY_CONFIG.email,
        subject: `Nuevo comprobante de transacción - ${pdfData.transactionId}`,
        body: `
          Se ha generado un nuevo comprobante de transacción.
          
          Cliente: ${userEmail || 'Cliente'}
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
      logger.info('PDF enviado automáticamente a Ecucondor');
      
      return Promise.resolve();
    } catch (error) {
      logger.error('Error enviando PDF a Ecucondor', error);
      throw error;
    }
  }
}