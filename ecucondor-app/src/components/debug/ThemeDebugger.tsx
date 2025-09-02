"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

/**
 * Componente para debuggear problemas de tema en móvil
 * Solo aparece en desarrollo
 */
export function ThemeDebugger() {
  const { theme, toggleTheme } = useTheme();
  const [touchEvents, setTouchEvents] = useState<string[]>([]);
  const [clickEvents, setClickEvents] = useState<string[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const logEvent = (eventType: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const entry = `${timestamp}: ${eventType}`;
      
      if (eventType.includes('touch')) {
        setTouchEvents(prev => [...prev.slice(-4), entry]);
      } else {
        setClickEvents(prev => [...prev.slice(-4), entry]);
      }
    };

    // Event listeners para debuggear
    const handleTouchStart = () => logEvent('touchstart');
    const handleTouchEnd = () => logEvent('touchend');
    const handleClick = () => logEvent('click');
    const handleMouseDown = () => logEvent('mousedown');

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // No mostrar en producción
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="mb-2">
        <h3 className="font-bold text-sm">🎨 Theme Debug</h3>
        <div>Current: <span className="text-yellow-400">{theme}</span></div>
        <div>HTML Class: <span className="text-green-400">
          {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        </span></div>
      </div>
      
      <div className="mb-2">
        <button 
          onClick={toggleTheme}
          className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Toggle Theme
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <h4 className="font-semibold text-xs">Touch Events:</h4>
          {touchEvents.map((event, i) => (
            <div key={i} className="text-orange-300 text-xs">{event}</div>
          ))}
        </div>
        
        <div>
          <h4 className="font-semibold text-xs">Click Events:</h4>
          {clickEvents.map((event, i) => (
            <div key={i} className="text-blue-300 text-xs">{event}</div>
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Tap anywhere to test events
      </div>
    </div>
  );
}