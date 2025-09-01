/**
 * Company configuration from environment variables
 * All company-related information centralized here
 */

export const COMPANY_CONFIG = {
  // Company Details
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ecucondor SAS',
  ruc: process.env.NEXT_PUBLIC_COMPANY_RUC || '1391937000OO-1',
  bank: process.env.NEXT_PUBLIC_COMPANY_BANK || 'Produbanco',
  bankAccountType: process.env.NEXT_PUBLIC_COMPANY_BANK_ACCOUNT_TYPE || 'Cuenta Corriente',
  domain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'ecucondor.com',
  
  // Contact Information
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+5491166599559',
  email: process.env.NEXT_PUBLIC_PAYMENT_EMAIL || 'ecucondor@gmail.com',
  
  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Formatted Information
  get whatsappFormatted() {
    return this.whatsapp.replace('+', '').replace(/\s/g, '');
  },
  
  get whatsappDisplay() {
    // Format: +54 9 11 6659-9559
    const cleaned = this.whatsapp.replace(/\D/g, '');
    if (cleaned.startsWith('549')) {
      return `+54 9 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
    }
    return this.whatsapp;
  },
  
  get bankFullName() {
    return `${this.bank} - ${this.bankAccountType}`;
  },
  
  get website() {
    return `https://${this.domain}`;
  }
} as const;

// Payment configurations
export const PAYMENT_INFO = {
  company: COMPANY_CONFIG.name,
  ruc: COMPANY_CONFIG.ruc,
  bank: COMPANY_CONFIG.bank,
  accountType: COMPANY_CONFIG.bankAccountType,
  // Add specific account numbers when available
  // accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '',
} as const;

// Validation
if (process.env.NODE_ENV === 'development') {
  console.log('🏢 Company Configuration Loaded:', {
    name: COMPANY_CONFIG.name,
    bank: COMPANY_CONFIG.bankFullName,
    contact: `${COMPANY_CONFIG.email} | ${COMPANY_CONFIG.whatsappDisplay}`
  });
}