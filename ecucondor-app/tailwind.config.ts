import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Breakpoints personalizados (consistentes con useResponsive)
      screens: {
        'xs': '0px',
        'sm': '640px',   // tablet pequeño
        'md': '768px',   // tablet
        'lg': '1024px',  // desktop
        'xl': '1280px',  // desktop grande
        '2xl': '1536px', // ultra wide
      },
      // Espaciado mobile-first
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Tipografía responsive
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
      },
      // Contenedores responsive
      maxWidth: {
        'container-xs': '100%',
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
      },
      // Animaciones optimizadas para mobile
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Plugin personalizado para utilidades responsive
    function({ addUtilities, theme }: any) {
      addUtilities({
        // Touch targets seguros (minimum 44px)
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-target-sm': {
          minHeight: '36px',
          minWidth: '36px',
        },
        '.touch-target-lg': {
          minHeight: '56px',
          minWidth: '56px',
        },
        // Safe area utilities
        '.safe-area-inset': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-area-top': {
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
        },
        '.safe-area-bottom': {
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        },
        // Mobile-first container
        '.container-responsive': {
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          '@screen sm': {
            maxWidth: '640px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
          '@screen 2xl': {
            maxWidth: '1536px',
          },
        },
        // Grid responsive predefinido
        '.grid-responsive': {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
          '@screen sm': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
          },
          '@screen lg': {
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          },
        },
      });
    },
  ],
} satisfies Config;