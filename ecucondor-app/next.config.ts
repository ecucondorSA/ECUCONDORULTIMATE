import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack
  turbopack: {
    root: '/home/edu/ECUCONDORULTIMATE/ecucondor-app',
  },
  // Optimizaciones de imagen
  images: {
    domains: ['ecucondor.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // Compresión
  compress: true,

  // Headers de seguridad y performance
  async headers() {
    return [
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configuración condicional - solo cuando no se usa Turbopack
  ...(!process.env.TURBOPACK && {
    webpack: (config, { isServer }) => {
      // Resolver problemas con jsPDF y módulos de Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
        encoding: false,
      };
      
      // Alias para evitar resolución de módulos problemáticos
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };

      // Optimizaciones de bundle
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }

      return config;
    },
  }),
};

export default nextConfig;
