# Configuración para Producción - Ecucondor.com

## 🌐 Configuración de Dominio

### Google Cloud Console
**Orígenes autorizados de JavaScript:**
- `https://ecucondor.com`
- `https://www.ecucondor.com`
- `https://qfregiogzspihbglvpqs.supabase.co` (mantener)
- `http://localhost:3000` (desarrollo)

**URIs de redireccionamiento autorizados:**
- `https://qfregiogzspihbglvpqs.supabase.co/auth/v1/callback`
- `https://ecucondor.com/auth/callback`
- `https://www.ecucondor.com/auth/callback`

### Supabase Dashboard
**Authentication → Settings:**

**Site URL:**
```
https://ecucondor.com
```

**Redirect URLs:**
```
https://ecucondor.com/*
https://www.ecucondor.com/*
https://qfregiogzspihbglvpqs.supabase.co/auth/v1/callback
http://localhost:3000/* (para desarrollo)
```

## 📋 Checklist de Configuración

### ✅ Google OAuth
- [ ] Client ID configurado en Supabase
- [ ] Client Secret configurado en Supabase
- [ ] Orígenes JavaScript actualizados
- [ ] URIs de redirección actualizados

### ✅ Supabase Auth
- [ ] Site URL actualizado a ecucondor.com
- [ ] Redirect URLs configurados
- [ ] Políticas RLS funcionando
- [ ] Tabla profiles creada

### ✅ Variables de Entorno para Producción
```bash
NEXT_PUBLIC_SUPABASE_URL="https://qfregiogzspihbglvpqs.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🚀 Despliegue
- Las URLs de redirect se ajustan automáticamente según el entorno
- Desarrollo: `localhost:3000/auth/callback`
- Producción: `https://ecucondor.com/auth/callback`