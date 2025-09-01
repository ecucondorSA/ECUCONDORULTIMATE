# 🔒 Seguridad - Ecucondor App

## Variables de Entorno

### ⚠️ Variables Sensibles
Las siguientes variables contienen información sensible y **NUNCA** deben ser committed al repositorio:

- `SUPABASE_SERVICE_ROLE_KEY` - Acceso completo a la base de datos
- `BINANCE_API_KEY` / `BINANCE_SECRET_KEY` - Acceso a API de Binance (si se usa)

### 🔧 Configuración Local

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Completa con tus valores reales:**
   - Obtén las claves desde tu dashboard de Supabase
   - Configura URLs según tu entorno (desarrollo/producción)

### 🚀 Configuración en Producción (Vercel)

En tu dashboard de Vercel, configura estas variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ecucondor.com
```

### 🛡️ Mejores Prácticas

1. **Regenera claves regularmente**
2. **Usa claves diferentes para dev/prod**
3. **Limita permisos de Row Level Security en Supabase**
4. **Nunca loggees claves sensibles**
5. **Rota claves si sospechas compromiso**

### 🔍 Verificación

Para verificar que no hay claves expuestas:

```bash
# Verificar que .env.local está ignorado
git status --ignored

# Buscar accidentalmente claves en código
grep -r "eyJ" src/ || echo "✅ No JWT tokens in source"
```