import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EcuCondor - Intercambio de divisas USD, ARS, BRL';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '40px 60px',
          position: 'relative',
        }}
      >
        {/* Contenido de texto */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#FFD700',
              margin: '0 0 16px 0',
              textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
            }}
          >
            ECUCONDOR
          </h1>
          
          <p
            style={{
              fontSize: '28px',
              color: '#ffffff',
              margin: '0 0 20px 0',
              fontWeight: '600',
            }}
          >
            Intercambio de divisas
          </p>
          
          <p
            style={{
              fontSize: '22px',
              color: '#cccccc',
              margin: '0',
              lineHeight: 1.3,
            }}
          >
            Tasas competitivas • Transacciones seguras • Procesamiento rápido
          </p>
          
          {/* Badges de monedas */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <div
              style={{
                background: '#FFD700',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              USD
            </div>
            <div
              style={{
                background: '#87CEEB',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              ARS
            </div>
            <div
              style={{
                background: '#228B22',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              BRL
            </div>
          </div>
        </div>
        
        {/* Elementos visuales del lado derecho */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Ícono principal */}
          <div
            style={{
              fontSize: '120px',
              filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))',
            }}
          >
            🦅
          </div>
          
          {/* Indicadores de características */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🔒</span>
              <span style={{ color: '#ffffff', fontSize: '18px' }}>Seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <span style={{ color: '#ffffff', fontSize: '18px' }}>Rápido</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💰</span>
              <span style={{ color: '#ffffff', fontSize: '18px' }}>Competitivo</span>
            </div>
          </div>
        </div>
        
        {/* URL en la esquina */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
            color: '#888888',
            fontSize: '16px',
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