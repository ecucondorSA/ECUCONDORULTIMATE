# 🛠️ Configuración Supabase para Solucionar OAuth

## 🚨 Problema Detectado

El callback OAuth está fallando porque:
1. **Site URL** está configurado como `https://ecucondor.com/dashboard` (INCORRECTO)
2. **Redirect URLs** no incluyen `https://ecucondor.com/auth/callback`

## ✅ Configuración Correcta

### 1. Acceder al Dashboard de Supabase
1. Ve a https://app.supabase.com/
2. Selecciona tu proyecto: **qfregiogzspihbglvpqs**
3. Ve a **Authentication** → **URL Configuration**

### 2. Configurar Site URL
**Campo: Site URL**
```
https://ecucondor.com
```
**❌ NO usar:** `https://ecucondor.com/dashboard`

### 3. Configurar Redirect URLs
**Campo: Redirect URLs** (agregar estas líneas):
```
https://ecucondor.com/auth/callback
https://ecucondor.com/dashboard
http://localhost:3002/auth/callback
```

### 4. Verificar OAuth Provider
En **Authentication** → **Providers** → **Google**:
- ✅ Debe estar **Enabled**
- ✅ Client ID y Secret deben estar configurados

## 🔧 Cambios Realizados en el Código

### Archivo: `/src/lib/supabase.ts`
- ✅ URLs hardcodeadas para producción
- ✅ Redirect URL fijo: `https://ecucondor.com/auth/callback`

### Archivo: `/src/app/auth/callback/page.tsx`
- ✅ Cambiado `getSession()` por `exchangeCodeForSession()`
- ✅ Manejo correcto del callback OAuth

## 🧪 Prueba la Configuración

1. **Guarda los cambios** en el dashboard de Supabase
2. **Despliega** tu aplicación si es necesario
3. **Prueba el login** con Google desde https://ecucondor.com/login

## 📋 Checklist de Verificación

- [ ] Site URL: `https://ecucondor.com` (sin /dashboard)
- [ ] Redirect URL incluye: `https://ecucondor.com/auth/callback`
- [ ] Google OAuth está habilitado
- [ ] Código actualizado con `exchangeCodeForSession()`
- [ ] Aplicación desplegada

## 🚀 Después de la Configuración

El flujo debería ser:
1. Usuario hace clic en "Login with Google"
2. Redirecciona a Google OAuth
3. Google redirecciona a `https://ecucondor.com/auth/callback`
4. Código intercambia el code por session
5. Usuario redirecciona a `/dashboard`

**¡El error del `%0A` y el callback deberían estar solucionados!**