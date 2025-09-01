# 🚀 Guía de Deployment para ECUCONDORULTIMATE

## 📁 Estructura del Proyecto

Este es un **monorepo** donde el proyecto Next.js está ubicado en `ecucondor-app/`:

```
ECUCONDORULTIMATE/
├── ecucondor-app/          # ← Aplicación Next.js 15
│   ├── package.json        # ← Dependencias de Next.js
│   ├── src/app/            # ← App Router de Next.js
│   └── .next/              # ← Build output
├── package.json            # ← Scripts de monorepo
├── vercel.json             # ← Configuración de Vercel
└── README.md               # ← Documentación principal
```

## ⚙️ Configuración de Vercel

### Método 1: Usando vercel.json (Automático)
El archivo `vercel.json` está configurado para:
- Detectar que es un proyecto Next.js en subdirectorio
- Ejecutar build desde `ecucondor-app/`
- Configurar variables de entorno necesarias
- Optimizar funciones serverless

### Método 2: Configuración Manual en Dashboard
Si prefieres configurar manualmente:

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **General** → **Build & Output Settings**
3. Configura:
   - **Framework Preset:** Next.js
   - **Root Directory:** `ecucondor-app` (¡IMPORTANTE!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

## 🔐 Variables de Entorno Requeridas

En Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Optional: Para desarrollo local
NODE_ENV=production
```

## 🧪 Comandos de Verificación Local

Antes de hacer deploy, verifica que todo funcione:

```bash
# Desde la raíz del proyecto
npm run build    # Build del proyecto completo
npm run lint     # Verificar calidad de código  
npm run dev      # Desarrollo local

# Desde ecucondor-app/
cd ecucondor-app
pnpm build       # Build específico
pnpm lint        # Lint específico  
pnpm dev         # Desarrollo específico
```

## 🚀 Proceso de Deploy

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Deploy configuration"
   git push origin main
   ```

2. **Vercel se triggerará automáticamente** y debería:
   - Detectar Next.js en `ecucondor-app/`
   - Instalar dependencias correctamente
   - Ejecutar build sin errores
   - Desplegar exitosamente

## 🔧 Troubleshooting

### Error: "No Next.js version detected"
- ✅ **Solución:** Configurar Root Directory a `ecucondor-app`
- ✅ **Verificar:** `vercel.json` está en la raíz del repo

### Error: "Module not found"
- ✅ **Verificar:** Variables de entorno configuradas
- ✅ **Revisar:** `.env.local.example` en `ecucondor-app/`

### Error de Build
- ✅ **Probar localmente:** `npm run build` desde raíz
- ✅ **Verificar:** Todos los tests pasan (`npm run lint`)

## 📊 URLs del Proyecto

Una vez deployado, tendrás acceso a:

- **Frontend:** `https://tu-proyecto.vercel.app`
- **APIs:** `https://tu-proyecto.vercel.app/api/rates`
- **Health Check:** `https://tu-proyecto.vercel.app/api/health`
- **Streaming:** `https://tu-proyecto.vercel.app/api/rates/stream`

## 🎯 Próximos Pasos Después del Deploy

1. **Configurar Base de Datos:**
   - Ejecutar `database/schema.sql` en Supabase
   - Configurar RLS policies

2. **Testing de APIs:**
   - Probar endpoints desde producción
   - Verificar rate limiting y CORS

3. **Monitoreo:**
   - Configurar alertas en Vercel
   - Revisar logs de funciones serverless