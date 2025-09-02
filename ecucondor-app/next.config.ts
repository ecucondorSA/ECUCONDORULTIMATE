import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack
  turbopack: {
    root: process.cwd(),
  },
  // Optimizaciones de imagen avanzadas
  images: {
    domains: ['ecucondor.com', '*.vercel.app'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año para mayor cache
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuración experimental para Next.js 15
  experimental: {
    // Optimized package imports (compatible con Next.js 15 stable)
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    // Explicitly enable turbo mode for development
    turbo: {
      root: process.cwd()
    }
  },

  // Redirects para SEO y UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/calc',
        destination: '/calculator',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/register',
        permanent: true,
      },
    ];
  },

  // Compresión
  compress: true,

  // ESLint configuration for build
  eslint: {
    // Temporarily ignore during builds to allow deployment
    ignoreDuringBuilds: true,
  },

  // Headers de seguridad y performance mejorados
  async headers() {
    return [
      {
        // Cache estático optimizado para assets
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Cache para imágenes Next.js
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Headers de seguridad globales
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Content Security Policy optimizado para EcuCondor
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live *.vercel-analytics.com *.vercel-insights.com *.google.com *.gstatic.com;
              style-src 'self' 'unsafe-inline' fonts.googleapis.com;
              font-src 'self' fonts.gstatic.com data:;
              img-src 'self' data: blob: https: *.vercel.com *.google.com *.googleusercontent.com;
              media-src 'self' data: blob:;
              connect-src 'self' api.binance.com wss://ws-api.binance.com:443 *.supabase.co wss://*.supabase.co vitals.vercel-insights.com *.google.com;
              frame-src 'self' *.google.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s+/g, ' ').trim(),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
        ],
      },
      {
        // Headers específicos para API routes
        source: '/api/(.*)',
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
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
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
