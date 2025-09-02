'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showWelcome?: boolean;
}

export default function WhatsAppWidget({
  phoneNumber = '+5491166599559',
  message = 'Hola! Me gustaría obtener más información sobre ECUCONDOR 💰',
  position = 'bottom-right',
  showWelcome = true
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Mostrar notificación después de 5 segundos si no ha interactuado
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowNotification(true);
        // Ocultar notificación después de 5 segundos
        setTimeout(() => setShowNotification(false), 5000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowNotification(false);
    setHasInteracted(true);
  };

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setHasInteracted(true);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Notificación de bienvenida */}
      <AnimatePresence>
        {showNotification && showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 bg-white rounded-xl shadow-2xl p-4 max-w-xs border-2 border-green-200"
            style={{ marginBottom: '10px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  ¡Hola! 👋
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ¿Necesitas ayuda con cambio de divisas? ¡Hablemos!
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            </div>
            {/* Flecha pointing down */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-green-200 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget expandido */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border-2 border-green-200 w-80"
          >
            {/* Header */}
            <div className="bg-green-500 rounded-t-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg">🦅</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">ECUCONDOR</h4>
                <p className="text-green-100 text-sm">Soporte en línea</p>
              </div>
              <button
                onClick={handleToggle}
                className="text-white hover:text-green-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🦅</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                    <p className="text-sm text-gray-800">
                      ¡Hola! Soy el asistente de ECUCONDOR. 
                      ¿En qué puedo ayudarte hoy?
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-center mb-3">
                  Típicamente respondemos en pocos minutos ⚡
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800">💱 Consultas de Cambio</div>
                    <div className="text-xs text-gray-600">Tasas actuales y transacciones</div>
                  </button>
                  
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800">📞 Soporte Técnico</div>
                    <div className="text-xs text-gray-600">Ayuda con la plataforma</div>
                  </button>
                  
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800">ℹ️ Información General</div>
                    <div className="text-xs text-gray-600">Servicios y consultas</div>
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={18} />
                Iniciar Conversación
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de notificación */}
        {showNotification && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">!</span>
          </motion.div>
        )}

        {/* Pulso animado */}
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </div>
  );
}