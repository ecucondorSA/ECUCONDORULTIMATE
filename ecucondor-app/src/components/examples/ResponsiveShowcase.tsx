"use client";

import React from 'react';
import { useResponsive, useMobile, useBreakpoint } from '@/hooks/useResponsive';
import { ResponsiveWrapper, ConditionalRender, ResponsiveImage, BreakpointDebugger } from '@/components/common/ResponsiveWrapper';

/**
 * Componente de demostración de patrones responsive mobile-first
 * Implementa las mejores prácticas encontradas en GitHub
 */
export default function ResponsiveShowcase() {
  const responsive = useResponsive();
  const isMobile = useMobile();
  const isLargeScreen = useBreakpoint('lg');

  return (
    <div className="container mx-auto p-4">
      {/* Debugger para desarrollo */}
      <BreakpointDebugger />
      
      <div className="space-y-8">
        {/* Sección: Información del dispositivo */}
        <ResponsiveWrapper fallback={<div>Cargando...</div>}>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">📱 Información del Dispositivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/20 p-4 rounded">
                <h3 className="font-semibold">Dimensiones</h3>
                <p>{responsive.width} × {responsive.height}px</p>
              </div>
              <div className="bg-white/20 p-4 rounded">
                <h3 className="font-semibold">Breakpoint</h3>
                <p className="uppercase font-mono">{responsive.breakpoint}</p>
              </div>
              <div className="bg-white/20 p-4 rounded">
                <h3 className="font-semibold">Tipo</h3>
                <p>
                  {responsive.isMobile && '📱 Móvil'}
                  {responsive.isTablet && '📟 Tablet'}
                  {responsive.isDesktop && '🖥️ Desktop'}
                </p>
              </div>
            </div>
          </div>
        </ResponsiveWrapper>

        {/* Sección: Renderizado Condicional */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🔄 Renderizado Condicional</h2>
          <ConditionalRender
            mobile={
              <div className="bg-green-500 text-white p-4 rounded">
                <h3 className="font-bold">👋 Vista Móvil</h3>
                <p>Optimizado para pantallas pequeñas</p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Navegación simplificada</li>
                  <li>Botones más grandes</li>
                  <li>Contenido apilado verticalmente</li>
                </ul>
              </div>
            }
            tablet={
              <div className="bg-blue-500 text-white p-4 rounded">
                <h3 className="font-bold">📟 Vista Tablet</h3>
                <p>Diseño híbrido para pantallas medianas</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/20 p-3 rounded">
                    <h4 className="font-semibold">Característica 1</h4>
                    <p>Descripción adaptada para tablet</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded">
                    <h4 className="font-semibold">Característica 2</h4>
                    <p>Optimización específica</p>
                  </div>
                </div>
              </div>
            }
            desktop={
              <div className="bg-purple-500 text-white p-4 rounded">
                <h3 className="font-bold">🖥️ Vista Desktop</h3>
                <p>Experiencia completa para pantallas grandes</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/20 p-3 rounded">
                    <h4 className="font-semibold">Panel 1</h4>
                    <p>Información detallada</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded">
                    <h4 className="font-semibold">Panel 2</h4>
                    <p>Funcionalidades avanzadas</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded">
                    <h4 className="font-semibold">Panel 3</h4>
                    <p>Herramientas adicionales</p>
                  </div>
                </div>
              </div>
            }
            fallback={
              <div className="bg-gray-500 text-white p-4 rounded">
                <h3 className="font-bold">⏳ Cargando...</h3>
                <p>Detectando tipo de dispositivo...</p>
              </div>
            }
          />
        </div>

        {/* Sección: Grid Responsive */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🏗️ Grid Responsive</h2>
          <p className="text-gray-600 mb-6">
            Diseño que se adapta automáticamente: 1 columna en móvil, 
            2 en tablet, 3 en desktop.
          </p>
          
          <div className="grid-cards">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="card bg-gradient-to-br from-indigo-500 to-pink-500 text-white"
              >
                <h3 className="font-bold text-lg mb-2">Card {i + 1}</h3>
                <p>
                  {isMobile 
                    ? `📱 Vista móvil optimizada`
                    : isLargeScreen 
                    ? `🖥️ Experiencia desktop completa`
                    : `📟 Vista tablet balanceada`
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Imagen Responsive */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🖼️ Imágenes Responsivas</h2>
          <div className="bg-gray-200 rounded-lg overflow-hidden">
            <ResponsiveImage
              src="/placeholder-desktop.jpg"
              mobileSrc="/placeholder-mobile.jpg"
              tabletSrc="/placeholder-tablet.jpg"
              desktopSrc="/placeholder-desktop.jpg"
              alt="Imagen adaptativa según dispositivo"
              className="rounded-lg"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            * La imagen se adapta automáticamente según el dispositivo
          </p>
        </div>

        {/* Sección: Componentes Interactivos */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🎯 Elementos Interactivos</h2>
          
          <div className="space-y-4">
            {/* Botones con touch targets apropiados */}
            <div>
              <h3 className="font-semibold mb-2">Botones Optimizados</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  🚀 Acción Principal
                </button>
                <button className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                  📋 Secundario
                </button>
                <button className="btn bg-green-500 text-white hover:bg-green-600 transition-colors">
                  ✓ Confirmar
                </button>
              </div>
            </div>

            {/* Formulario responsive */}
            <div>
              <h3 className="font-semibold mb-2">Formulario Adaptativo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <textarea
                placeholder="Mensaje..."
                rows={4}
                className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sección: Performance Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">⚡ Optimizaciones Aplicadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-yellow-700 mb-2">CSS Mobile-First</h3>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>✅ Base styles para móvil</li>
                <li>✅ Progressive enhancement</li>
                <li>✅ CSS consolidado</li>
                <li>✅ Bundle size reducido</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-700 mb-2">JavaScript Optimizado</h3>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>✅ Hydration safety</li>
                <li>✅ Debounced resize events</li>
                <li>✅ SSR compatible</li>
                <li>✅ Performance monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}