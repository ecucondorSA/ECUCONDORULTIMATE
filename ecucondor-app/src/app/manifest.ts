import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EcuCondor - Intercambio de Divisas',
    short_name: 'EcuCondor',
    description: 'Plataforma FinTech para intercambio seguro de divisas entre Argentina, Brasil y Ecuador',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a2332',
    theme_color: '#f4d03f',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'es-EC',
    categories: ['finance', 'business'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '835x833',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}