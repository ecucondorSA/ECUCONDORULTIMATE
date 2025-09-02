'use client';
import { logger } from '@/lib/utils/logger';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, Mail, User, MessageSquare, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  newsletter: z.boolean().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    defaultValues: {
      newsletter: false
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Ensure newsletter has a default value
    const submitData = {
      ...data,
      newsletter: data.newsletter ?? false
    };
    
    try {
      // Simular envío a API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      await response.json();
      
      toast.success('¡Mensaje enviado correctamente! Te contactaremos pronto.', {
        duration: 5000,
        icon: '✅',
      });

      reset();
    } catch (error) {
      logger.error('Error submitting form:', error);
      
      toast.error('Error al enviar el mensaje. Por favor intenta nuevamente.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-2xl p-8 shadow-2xl border-2 ${className}`}
      style={{
        borderColor: '#FFD700',
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.15)'
      }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Contáctanos
        </h3>
        <p className="text-gray-600">
          ¿Tienes preguntas? Nos encantaría ayudarte con tus consultas financieras.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} />
            Nombre completo *
          </label>
          <input
            {...register('name')}
            type="text"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Tu nombre completo"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} />
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono (opcional) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} />
            Teléfono (opcional)
          </label>
          <input
            {...register('phone')}
            type="tel"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+54 911 1234 5678"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Asunto */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare size={16} />
            Asunto *
          </label>
          <input
            {...register('subject')}
            type="text"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
              errors.subject ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.subject && (
            <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Mensaje */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mensaje *
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none ${
              errors.message ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Cuéntanos más detalles sobre tu consulta..."
          />
          {errors.message && (
            <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Newsletter checkbox */}
        <div className="flex items-center gap-3">
          <input
            {...register('newsletter')}
            type="checkbox"
            id="newsletter"
            className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
          />
          <label htmlFor="newsletter" className="text-sm text-gray-600">
            Quiero recibir noticias y actualizaciones de ECUCONDOR
          </label>
        </div>

        {/* Botón enviar */}
        <motion.button
          type="submit"
          disabled={!isValid || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            isValid && !isSubmitting
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-lg hover:shadow-yellow-500/30'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send size={20} />
              Enviar Mensaje
            </>
          )}
        </motion.button>
      </form>

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          También puedes contactarnos directamente por{' '}
          <a 
            href="https://wa.me/+5491166599559" 
            className="text-yellow-600 hover:text-yellow-700 font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          {' '}o al email{' '}
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