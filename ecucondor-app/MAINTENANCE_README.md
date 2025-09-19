# 🔧 EcuCondor - Página de Mantenimiento

## 📋 Descripción

Sistema completo de página de mantenimiento para EcuCondor con diseño profesional, animaciones y funcionalidades avanzadas.

## 🎨 Características

### ✨ Diseño Visual
- **Diseño responsive** - Se adapta a todos los dispositivos
- **Animaciones suaves** - Partículas flotantes y efectos de pulso
- **Gradientes modernos** - Colores acordes a la marca EcuCondor
- **Iconografía clara** - Símbolos intuitivos para cada sección

### ⚡ Funcionalidades
- **Contador regresivo** - Tiempo estimado de regreso en tiempo real
- **Auto-refresh** - Se actualiza automáticamente cada 5 minutos
- **Información de contacto** - Enlaces directos a WhatsApp y email
- **Estado en tiempo real** - Indicador visual del estado del mantenimiento

### 📱 Responsive
- Optimizado para móviles, tablets y desktop
- Tipografías escalables
- Layout adaptativo

## 📁 Archivos Incluidos

```
📦 Página de Mantenimiento
├── maintenance.html              # Página principal de mantenimiento
├── src/app/maintenance/page.tsx  # Ruta Next.js para /maintenance
├── maintenance-toggle.js         # Script para activar/desactivar
└── MAINTENANCE_README.md         # Esta documentación
```

## 🚀 Uso

### Activar Modo Mantenimiento

```bash
# Opción 1: Usar el script
node maintenance-toggle.js on

# Opción 2: Manual
cp maintenance.html public/maintenance.html
```

### Desactivar Modo Mantenimiento

```bash
# Opción 1: Usar el script
node maintenance-toggle.js off

# Opción 2: Manual
rm public/maintenance.html
```

### Verificar Estado

```bash
node maintenance-toggle.js status
```

## 🌐 Acceso

Una vez activado, la página estará disponible en:

- **Directo**: `https://tu-dominio.com/maintenance.html`
- **Ruta Next.js**: `https://tu-dominio.com/maintenance`

## ⚙️ Configuración

### Personalizar Tiempo de Mantenimiento

Edita el archivo `maintenance.html` línea 304:

```javascript
const targetTime = now + (2.5 * 60 * 60 * 1000); // 2.5 horas
```

### Cambiar Información de Contacto

Edita las líneas 246-253 en `maintenance.html`:

```html
<a href="mailto:ecucondor@gmail.com" class="contact-item">
<a href="https://wa.me/5491166599559" class="contact-item" target="_blank">
```

### Modificar Colores de Marca

Variables CSS principales en el `<style>`:

```css
/* Color principal EcuCondor */
#FFD700  /* Dorado */
#FFA500  /* Naranja dorado */
#0f172a  /* Azul oscuro */
```

## 🔄 Integración con Middleware

Para redirigir automáticamente todo el tráfico a la página de mantenimiento, agrega esto al `middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar si existe el archivo de mantenimiento
  const isMaintenanceMode = /* lógica para verificar estado */;
  
  if (isMaintenanceMode && !request.nextUrl.pathname.includes('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance.html', request.url));
  }
  
  return NextResponse.next();
}
```

## 📊 Monitoreo

### Auto-refresh
- La página se recarga automáticamente cada 5 minutos
- Verifica si el mantenimiento ha terminado
- Contador regresivo en tiempo real

### Métricas
- Tiempo de inicio del mantenimiento
- Duración estimada
- Estado del sistema

## 🎯 Mejores Prácticas

### ✅ Antes del Mantenimiento
1. Notificar a usuarios con anticipación
2. Configurar el tiempo estimado realista
3. Preparar información de contacto actualizada

### ✅ Durante el Mantenimiento
1. Monitorear el contador regresivo
2. Actualizar si hay retrasos
3. Responder consultas urgentes

### ✅ Después del Mantenimiento
1. Desactivar inmediatamente
2. Verificar funcionamiento normal
3. Comunicar que el servicio está restaurado

## 🛠️ Comandos Útiles

```bash
# Verificar estado actual
node maintenance-toggle.js

# Activar con mensaje personalizado
node maintenance-toggle.js on

# Desactivar y limpiar archivos
node maintenance-toggle.js off

# Ver ayuda completa
node maintenance-toggle.js --help
```

## 📞 Soporte

Para dudas sobre la implementación:

- **Email**: ecucondor@gmail.com
- **WhatsApp**: +54 9 11 6659-9559
- **Documentación**: Este archivo

## 🔄 Versiones

- **v1.0** - Página básica de mantenimiento
- **v1.1** - Contador regresivo y auto-refresh
- **v1.2** - Diseño responsive y animaciones
- **v1.3** - Sistema de toggle automatizado

---

**Desarrollado para EcuCondor** 🦅  
*Tu Puente Financiero Global*