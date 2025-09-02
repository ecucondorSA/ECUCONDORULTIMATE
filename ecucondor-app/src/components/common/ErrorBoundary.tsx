'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo: errorInfo.componentStack,
    });

    // Llamar callback opcional de error
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Aquí podrías enviar a Sentry, LogRocket, etc.
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.handleReset}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

// Componente de fallback por defecto
function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto text-center border-2 border-red-200">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. No te preocupes, nuestro equipo ha sido notificado 
          y está trabajando para solucionarlo.
        </p>

        {isDevelopment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left"
          >
            <h3 className="font-semibold text-red-800 mb-2">Error de desarrollo:</h3>
            <p className="text-red-700 text-sm font-mono mb-2">
              {error.message}
            </p>
            {errorInfo && (
              <details className="text-red-600 text-xs">
                <summary className="cursor-pointer font-semibold mb-2">
                  Ver stack trace
                </summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                  {error.stack}
                </pre>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                  {errorInfo}
                </pre>
              </details>
            )}
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetError}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </motion.button>

          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Si el problema persiste, contacta a nuestro soporte:{' '}
          <a 
            href="mailto:Ecucondor@gmail.com" 
            className="text-yellow-600 hover:text-yellow-700 font-semibold"
          >
            Ecucondor@gmail.com
          </a>
        </p>
      </div>
    </motion.div>
  );
}

// Error Boundary especializado para formularios
export function FormErrorBoundary({ children, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={FormErrorFallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

function FormErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error en el formulario
      </h3>
      <p className="text-red-700 mb-4">
        Ha ocurrido un error al procesar el formulario. Por favor, intenta nuevamente.
      </p>
      <button
        onClick={resetError}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

// Error Boundary para secciones de datos
export function DataErrorBoundary({ children, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={DataErrorFallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

function DataErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
      <AlertTriangle className="w-6 h-6 text-gray-600 mx-auto mb-3" />
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        Error al cargar datos
      </h3>
      <p className="text-gray-600 mb-4 text-sm">
        No pudimos cargar la información. Por favor, intenta recargar.
      </p>
      <button
        onClick={resetError}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

export default ErrorBoundary;