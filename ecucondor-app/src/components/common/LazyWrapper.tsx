'use client';

import { Suspense, lazy, ComponentType, useState, useEffect, useRef } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorBoundary from './ErrorBoundary';

interface LazyWrapperProps {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType;
  className?: string;
}

// HOC para lazy loading con error boundary integrado
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(importFunc);
  
  const WrappedComponent = (props: T) => {
    const {
      fallback: FallbackComponent = () => <LoadingSkeleton variant="card" />,
      errorFallback,
      className = ''
    } = options;

    return (
      <div className={className}>
        <ErrorBoundary fallback={errorFallback}>
          <Suspense fallback={<FallbackComponent />}>
            <LazyComponent {...props} />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  };

  WrappedComponent.displayName = `LazyWrapped(${LazyComponent.displayName || 'Component'})`;
  
  return WrappedComponent;
}

// Componente para lazy loading de imágenes con intersection observer
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder-image.jpg',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView && (
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
      )}
      
      {isInView && (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
          )}
          
          <img
            src={hasError ? placeholder : src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            loading="lazy"
          />
          
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
              Error al cargar imagen
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Hook para lazy loading con intersection observer
export function useLazyLoad(threshold = 0.1, rootMargin = '50px') {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isInView };
}

// Componente para cargar secciones de manera lazy
interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function LazySection({ 
  children, 
  fallback = <LoadingSkeleton variant="card" className="h-64" />,
  threshold = 0.1,
  rootMargin = '100px',
  className = ''
}: LazySectionProps) {
  const { ref, isInView } = useLazyLoad(threshold, rootMargin);

  return (
    <div ref={ref} className={className}>
      {isInView ? children : fallback}
    </div>
  );
}

