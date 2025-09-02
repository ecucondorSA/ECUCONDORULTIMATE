"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Wrapper para prevenir problemas de hidration con contenido responsivo
 * Implementación basada en mejores prácticas de GitHub
 */
export function ResponsiveWrapper({ 
  children, 
  fallback = null, 
  className 
}: ResponsiveWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const responsive = useResponsive();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mostrar fallback durante SSR y primera hidration
  if (!isMounted) {
    return fallback ? (
      <div className={className} suppressHydrationWarning>
        {fallback}
      </div>
    ) : null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface ConditionalRenderProps {
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderizado condicional basado en breakpoints
 * Previene problemas de hidration con SSR
 */
export function ConditionalRender({
  mobile,
  tablet,
  desktop,
  fallback
}: ConditionalRenderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Durante SSR, mostrar fallback móvil (mobile-first)
  if (!isMounted) {
    return (
      <div suppressHydrationWarning>
        {fallback || mobile || null}
      </div>
    );
  }

  // Después de hidration, mostrar contenido correcto
  if (isDesktop && desktop) return <>{desktop}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isMobile && mobile) return <>{mobile}</>;

  return fallback ? <>{fallback}</> : null;
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Componente de imagen responsiva optimizada
 */
export function ResponsiveImage({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  className = '',
  priority = false
}: ResponsiveImageProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Seleccionar la imagen apropiada
  let imageSrc = src;
  if (isMounted) {
    if (isDesktop && desktopSrc) imageSrc = desktopSrc;
    else if (isTablet && tabletSrc) imageSrc = tabletSrc;
    else if (isMobile && mobileSrc) imageSrc = mobileSrc;
  } else if (mobileSrc) {
    // Mobile-first durante SSR
    imageSrc = mobileSrc;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`w-full h-auto object-cover ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      suppressHydrationWarning
    />
  );
}

interface BreakpointDebuggerProps {
  show?: boolean;
}

/**
 * Componente para debug de breakpoints (solo development)
 */
export function BreakpointDebugger({ show = process.env.NODE_ENV === 'development' }: BreakpointDebuggerProps) {
  const responsive = useResponsive();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!show || !isMounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div>Breakpoint: {responsive.breakpoint}</div>
      <div>Width: {responsive.width}px</div>
      <div>Height: {responsive.height}px</div>
      <div>
        Mobile: {responsive.isMobile ? '✅' : '❌'} | 
        Tablet: {responsive.isTablet ? '✅' : '❌'} | 
        Desktop: {responsive.isDesktop ? '✅' : '❌'}
      </div>
    </div>
  );
}