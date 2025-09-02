import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EcuCondor - Tu aliado financiero para intercambio de divisas';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Patrón de fondo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            background: 'radial-gradient(circle at 25% 25%, #FFD700 0%, transparent 50%), radial-gradient(circle at 75% 75%, #FFD700 0%, transparent 50%)',
          }}
        />
        
        {/* Contenido principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px',
            zIndex: 1,
          }}
        >
          {/* Logo/Título */}
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#FFD700',
              margin: '0 0 20px 0',
              textShadow: '0 4px 8px rgba(255, 215, 0, 0.3)',
            }}
          >
            ECUCONDOR
          </h1>
          
          {/* Subtítulo */}
          <h2
            style={{
              fontSize: '42px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 30px 0',
              lineHeight: 1.2,
            }}
          >
            Tu Puente Financiero Global
          </h2>
          
          {/* Descripción */}
          <p
            style={{
              fontSize: '28px',
              color: '#cccccc',
              margin: '0 0 40px 0',
              maxWidth: '800px',
              lineHeight: 1.3,
            }}
          >
            Intercambio seguro de divisas USD • ARS • BRL
          </p>
          
          {/* Características */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>🔒</div>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>Seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>⚡</div>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>Rápido</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>💰</div>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>Competitivo</span>
            </div>
          </div>
          
          {/* Call to action */}
          <div
            style={{
              marginTop: '30px',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              padding: '16px 32px',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: 'none',
            }}
          >
            Comienza tu transacción
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '30px',
            fontSize: '40px',
            opacity: 0.6,
          }}
        >
          🦅
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '30px',
            color: '#888888',
            fontSize: '18px',
          }}
        >
          ecucondor.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}