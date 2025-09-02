"use client";

import { useState, useEffect } from 'react';

// Breakpoints basados en Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: Breakpoint | 'xs';
}

/**
 * Hook personalizado para responsive design mobile-first
 * Basado en mejores prácticas de GitHub y Next.js
 */
export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState<ResponsiveState>({
    width: 0,
    height: 0,
    isMobile: true, // Default mobile-first
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    breakpoint: 'xs',
  });

  useEffect(() => {
    function updateDimensions() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determinar breakpoint actual
      let breakpoint: Breakpoint | 'xs' = 'xs';
      let isMobile = true;
      let isTablet = false;
      let isDesktop = false;
      let isLargeDesktop = false;

      if (width >= BREAKPOINTS['2xl']) {
        breakpoint = '2xl';
        isLargeDesktop = true;
        isDesktop = true;
        isMobile = false;
      } else if (width >= BREAKPOINTS.xl) {
        breakpoint = 'xl';
        isLargeDesktop = true;
        isDesktop = true;
        isMobile = false;
      } else if (width >= BREAKPOINTS.lg) {
        breakpoint = 'lg';
        isDesktop = true;
        isMobile = false;
      } else if (width >= BREAKPOINTS.md) {
        breakpoint = 'md';
        isTablet = true;
        isMobile = false;
      } else if (width >= BREAKPOINTS.sm) {
        breakpoint = 'sm';
        isTablet = true;
        isMobile = false;
      }

      setDimensions({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        breakpoint,
      });
    }

    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      updateDimensions();
      
      const debouncedUpdate = debounce(updateDimensions, 150);
      window.addEventListener('resize', debouncedUpdate);
      window.addEventListener('orientationchange', debouncedUpdate);

      return () => {
        window.removeEventListener('resize', debouncedUpdate);
        window.removeEventListener('orientationchange', debouncedUpdate);
      };
    }
  }, []);

  return dimensions;
}

/**
 * Hook para detectar si estamos en un breakpoint específico o superior
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook para detección mobile simple
 */
export function useMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * Utilidad de debounce para evitar renders excesivos
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Utilidades para uso en componentes
 */
export const responsive = {
  /**
   * Obtiene classes CSS basadas en el breakpoint actual
   */
  getClasses: (classes: Partial<Record<Breakpoint | 'xs', string>>): string => {
    if (typeof window === 'undefined') {
      return classes.xs || ''; // SSR fallback
    }
    
    const width = window.innerWidth;
    
    if (width >= BREAKPOINTS['2xl'] && classes['2xl']) return classes['2xl'];
    if (width >= BREAKPOINTS.xl && classes.xl) return classes.xl;
    if (width >= BREAKPOINTS.lg && classes.lg) return classes.lg;
    if (width >= BREAKPOINTS.md && classes.md) return classes.md;
    if (width >= BREAKPOINTS.sm && classes.sm) return classes.sm;
    
    return classes.xs || '';
  },

  /**
   * Verifica si estamos en un breakpoint específico
   */
  is: (breakpoint: Breakpoint): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= BREAKPOINTS[breakpoint];
  },
};