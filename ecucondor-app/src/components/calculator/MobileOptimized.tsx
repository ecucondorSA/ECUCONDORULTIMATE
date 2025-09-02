'use client';

import React from 'react';

interface MobileWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`mobile-optimized ${className}`}>
      {children}
    </div>
  );
};

export const MobileCalculatorStyles = () => (
  <style jsx global>{`
    /* Mobile Calculator Optimizations */
    @media (max-width: 768px) {
      /* Main calculator container */
      .calculator-main {
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Header section */
      .calculator-header {
        flex-direction: column !important;
        gap: 1rem !important;
        text-align: center !important;
        padding: 1rem !important;
      }

      .calculator-header h1 {
        font-size: 1.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      .calculator-header .user-info {
        text-align: center !important;
        font-size: 0.875rem !important;
      }

      /* Currency pair buttons */
      .currency-pair-grid {
        grid-template-columns: 1fr !important;
        gap: 0.75rem !important;
      }

      .currency-pair-button {
        min-height: 52px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
      }

      /* Transaction type toggle */
      .transaction-type-toggle {
        display: flex !important;
        width: 100% !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        margin-bottom: 1.5rem !important;
      }

      .transaction-type-button {
        flex: 1 !important;
        padding: 1rem !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        min-height: 52px !important;
      }

      /* Input fields */
      .calculator-input-group {
        margin-bottom: 1.5rem !important;
      }

      .calculator-input {
        font-size: 1.5rem !important;
        padding: 1rem !important;
        height: 60px !important;
        text-align: center !important;
        font-weight: 700 !important;
        border: 2px solid #FFD700 !important;
        border-radius: 12px !important;
        background: white !important;
      }

      .calculator-input:focus {
        outline: none !important;
        border-color: #FFA500 !important;
        box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2) !important;
      }

      .currency-label {
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        margin-bottom: 0.5rem !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
      }

      /* Exchange rate display */
      .exchange-rate-card {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
        padding: 1.25rem !important;
        border-radius: 16px !important;
        margin: 1.5rem 0 !important;
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3) !important;
      }

      .exchange-rate-text {
        font-size: 1.125rem !important;
        font-weight: 700 !important;
        color: #000 !important;
        text-align: center !important;
      }

      /* Action buttons */
      .calculator-actions {
        display: flex !important;
        flex-direction: column !important;
        gap: 1rem !important;
        margin-top: 1.5rem !important;
      }

      .calculator-button {
        min-height: 56px !important;
        font-size: 1.125rem !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
        transition: all 0.2s !important;
      }

      .calculator-button:active {
        transform: scale(0.98) !important;
      }

      .button-primary {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
        color: #000 !important;
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4) !important;
      }

      .button-secondary {
        background: #f3f4f6 !important;
        color: #374151 !important;
        border: 2px solid #e5e7eb !important;
      }

      /* Transaction summary modal */
      .transaction-summary {
        position: fixed !important;
        inset: 0 !important;
        background: white !important;
        z-index: 9999 !important;
        overflow-y: auto !important;
        padding: 1rem !important;
      }

      .summary-header {
        position: sticky !important;
        top: 0 !important;
        background: white !important;
        padding: 1rem 0 !important;
        border-bottom: 2px solid #FFD700 !important;
        margin-bottom: 1rem !important;
      }

      .summary-content {
        padding: 1rem !important;
      }

      .summary-row {
        display: flex !important;
        justify-content: space-between !important;
        padding: 0.75rem 0 !important;
        border-bottom: 1px solid #e5e7eb !important;
        font-size: 1rem !important;
      }

      .summary-total {
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        color: #FFD700 !important;
        padding: 1rem 0 !important;
        border-top: 2px solid #FFD700 !important;
        margin-top: 1rem !important;
      }

      /* Loading states */
      .loading-spinner {
        width: 48px !important;
        height: 48px !important;
        border-width: 4px !important;
      }

      /* Toast notifications for mobile */
      .Toaster {
        position: fixed !important;
        bottom: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 99999 !important;
      }

      .toast-message {
        min-width: 280px !important;
        max-width: calc(100vw - 2rem) !important;
        font-size: 1rem !important;
        padding: 1rem !important;
      }

      /* Responsive cards */
      .info-card {
        padding: 1rem !important;
        border-radius: 12px !important;
        margin-bottom: 1rem !important;
      }

      /* Fix for iOS input zoom */
      input[type="number"],
      input[type="text"],
      select {
        font-size: 16px !important;
        -webkit-appearance: none !important;
      }

      /* Improve tap targets */
      button, a, .clickable {
        position: relative !important;
      }

      button::after, a::after, .clickable::after {
        content: '';
        position: absolute;
        top: -8px;
        right: -8px;
        bottom: -8px;
        left: -8px;
      }

      /* Landscape mode adjustments */
      @media (orientation: landscape) and (max-height: 500px) {
        .calculator-header {
          display: none !important;
        }

        .calculator-input {
          height: 48px !important;
          font-size: 1.25rem !important;
        }

        .calculator-button {
          min-height: 44px !important;
        }
      }

      /* Small phone adjustments */
      @media (max-width: 375px) {
        .calculator-input {
          font-size: 1.25rem !important;
          height: 52px !important;
        }

        .currency-pair-button {
          min-height: 48px !important;
          font-size: 0.875rem !important;
        }

        .calculator-button {
          min-height: 48px !important;
          font-size: 1rem !important;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .calculator-input {
          background: #1f2937 !important;
          color: white !important;
          border-color: #FFD700 !important;
        }

        .info-card {
          background: #1f2937 !important;
          color: white !important;
        }
      }

      /* Animations for mobile */
      @media (prefers-reduced-motion: no-preference) {
        .calculator-button {
          transition: transform 0.1s ease-in-out !important;
        }

        .calculator-button:active {
          transform: scale(0.95) !important;
        }
      }

      /* Fix sticky header issues */
      .sticky-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 40 !important;
        background: inherit !important;
      }

      /* Improve scrolling performance */
      .scrollable {
        -webkit-overflow-scrolling: touch !important;
        overflow-y: auto !important;
      }
    }

    /* PWA optimizations */
    @media (display-mode: standalone) {
      .calculator-header {
        padding-top: env(safe-area-inset-top) !important;
      }

      .calculator-actions {
        padding-bottom: env(safe-area-inset-bottom) !important;
      }
    }
  `}</style>
);

export default MobileCalculatorStyles;