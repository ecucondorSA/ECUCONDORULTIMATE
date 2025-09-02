'use client';

import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🔒",
    title: "Máxima Seguridad",
    description: "Protegemos tus transacciones con tecnología de punta."
  },
  {
    icon: "⚡",
    title: "Rapidez Inigualable", 
    description: "Procesos optimizados para transacciones instantáneas."
  },
  {
    icon: "📈",
    title: "Tasas Competitivas",
    description: "Las mejores tasas del mercado, siempre actualizadas."
  },
  {
    icon: "🧠",
    title: "Análisis Inteligente",
    description: "Actualizaciones del mercado con nuestro sistema de análisis basado en IA."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="py-24 bg-white" id="features" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Características Principales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre por qué miles de usuarios confían en ECUCONDOR para sus necesidades financieras
          </p>
        </motion.div>

        {/* Layout con características a la izquierda y imagen a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 4 Tarjetas de características a la izquierda */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 border-2 transition-all duration-500 hover:scale-105 hover:-translate-y-1 shadow-lg"
                style={{
                  borderColor: '#FFD700',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.15)'
                }}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
                }}
              >
                <motion.div 
                  className="text-4xl mb-4 text-center"
                  animate={{ 
                    y: [0, -5, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 3,
                      delay: index * 0.2 
                    }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-bold mb-3 text-gray-900 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Imagen a la derecha */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              <div 
                className="relative rounded-xl overflow-hidden shadow-lg border-2"
                style={{
                  borderColor: 'transparent',
                  maxWidth: '200px',
                  aspectRatio: '9/16'
                }}
              >
                <Image 
                  src="/imagen/E.png" 
                  alt="ECUCONDOR - Plataforma Financiera"
                  width={200}
                  height={356}
                  className="w-full h-full object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
              
              {/* Elementos flotantes decorativos */}
              <motion.div 
                className="absolute -top-2 -right-2 w-3 h-3 rounded-full"
                style={{
                  background: '#FFD700',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                }}
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 3
                  }
                }}
              />
              
              <motion.div 
                className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full"
                style={{
                  background: '#FFA500',
                  boxShadow: '0 2px 6px rgba(255, 165, 0, 0.3)'
                }}
                animate={{ 
                  y: [0, -8, 0],
                  scale: [1, 1.3, 1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2.5,
                    delay: 1
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesSection);