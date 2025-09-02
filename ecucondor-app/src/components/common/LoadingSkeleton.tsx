'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
  lines?: number;
  animate?: boolean;
}

export default function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangle',
  lines = 1,
  animate = true 
}: LoadingSkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded";
  
  const variants = {
    card: "h-48 w-full",
    text: "h-4 w-full",
    circle: "h-12 w-12 rounded-full",
    rectangle: "h-6 w-full"
  };

  const animationVariants = {
    animate: {
      backgroundPosition: ['200% 0%', '-200% 0%'],
      transition: {
        duration: 1.5,
        ease: 'linear' as const,
        repeat: Infinity,
      }
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${variants[variant]} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{
              backgroundSize: '400% 100%'
            }}
            variants={animate ? animationVariants : {}}
            animate={animate ? 'animate' : ''}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${className}`}>
        <motion.div
          className={`${baseClasses} ${variants[variant]} mb-4`}
          style={{
            backgroundSize: '400% 100%'
          }}
          variants={animate ? animationVariants : {}}
          animate={animate ? 'animate' : ''}
        />
        <div className="space-y-2">
          <LoadingSkeleton variant="text" lines={1} animate={animate} />
          <LoadingSkeleton variant="text" lines={2} animate={animate} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        backgroundSize: '400% 100%'
      }}
      variants={animate ? animationVariants : {}}
      animate={animate ? 'animate' : ''}
    />
  );
}

// Componente específico para el skeleton de tasas de cambio
export function ExchangeRatesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-600/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LoadingSkeleton 
                variant="circle" 
                className="mr-3 h-8 w-8" 
                animate={true} 
              />
              <div>
                <LoadingSkeleton 
                  variant="text" 
                  className="w-16 h-4 mb-1" 
                  animate={true} 
                />
                <LoadingSkeleton 
                  variant="text" 
                  className="w-12 h-3" 
                  animate={true} 
                />
              </div>
            </div>
            <LoadingSkeleton 
              variant="text" 
              className="w-20 h-8" 
              animate={true} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente específico para testimonios
export function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-600/30"
        >
          <div className="flex items-center mb-4">
            <LoadingSkeleton 
              variant="circle" 
              className="mr-4 h-12 w-12" 
              animate={true} 
            />
            <div className="flex-1">
              <LoadingSkeleton 
                variant="text" 
                className="w-24 h-4 mb-2" 
                animate={true} 
              />
              <LoadingSkeleton 
                variant="text" 
                className="w-32 h-3" 
                animate={true} 
              />
            </div>
          </div>
          <LoadingSkeleton 
            variant="text" 
            lines={3} 
            className="mb-4" 
            animate={true} 
          />
          <div className="flex">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <LoadingSkeleton
                key={starIndex}
                variant="circle"
                className="w-4 h-4 mr-1"
                animate={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}