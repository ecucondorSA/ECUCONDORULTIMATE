# ECUCONDORULTIMATE

Proyecto con autenticación completa usando Supabase para login, registro, recuperación de contraseña y base de datos.

## Características

- ✅ Autenticación con Supabase
- ✅ Login de usuarios
- ✅ Registro de usuarios
- ✅ Recuperación de contraseña
- ✅ Base de datos con perfiles de usuario
- ✅ Row Level Security (RLS)
- ✅ Componentes de UI para autenticación

## Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Supabase:**
   - Crear un proyecto en [Supabase](https://supabase.com)
   - Copiar `.env.example` a `.env.local`
   - Completar las variables de entorno:
     ```
     NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
     SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
     ```

3. **Configurar la base de datos:**
   - Ejecutar el SQL en `database/schema.sql` en el editor SQL de Supabase
   - Esto creará las tablas, políticas RLS y triggers necesarios

## Estructura del proyecto

```
ECUCONDORULTIMATE/
├── components/
│   └── auth/
│       ├── AuthTabs.js          # Componente principal con pestañas
│       ├── LoginForm.js         # Formulario de login
│       ├── RegisterForm.js      # Formulario de registro
│       └── PasswordResetForm.js # Formulario de recuperación
├── lib/
│   └── supabase.js              # Cliente de Supabase y funciones auth
├── database/
│   └── schema.sql               # Esquema de base de datos
└── .env.example                 # Variables de entorno ejemplo
```

## Uso de los componentes

### AuthTabs
Componente principal que incluye todos los formularios de autenticación:

```javascript
import AuthTabs from './components/auth/AuthTabs'

function App() {
  const handleAuthSuccess = (data) => {
    console.log('Usuario autenticado:', data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthTabs onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}
```

### Funciones de autenticación
Disponibles en `lib/supabase.js`:

- `signUp(email, password)` - Registro de usuario
- `signIn(email, password)` - Inicio de sesión
- `signOut()` - Cerrar sesión
- `resetPassword(email)` - Recuperar contraseña
- `updatePassword(password)` - Actualizar contraseña
- `getUser()` - Obtener usuario actual

## Base de datos

El esquema incluye:

- **profiles**: Tabla de perfiles de usuario conectada a `auth.users`
- **RLS**: Políticas de seguridad a nivel de fila
- **Triggers**: Creación automática de perfiles al registrarse

## Características de seguridad

- Row Level Security habilitado
- Los usuarios solo pueden acceder a sus propios datos
- Validación de contraseñas (mínimo 6 caracteres)
- Confirmación por email para nuevos registros
- Recuperación segura de contraseña por email

## Configuración para Producción (Ecucondor.com)

### Google Cloud Console (Configuración manual requerida):

1. **Orígenes autorizados de JavaScript:**
   - `https://ecucondor.com`
   - `https://www.ecucondor.com`
   - `https://qfregiogzspihbglvpqs.supabase.co` (mantener)
   - `http://localhost:3000` (desarrollo)

2. **URIs de redireccionamiento autorizados:**
   - `https://qfregiogzspihbglvpqs.supabase.co/auth/v1/callback`
   - `https://ecucondor.com/auth/callback`
   - `https://www.ecucondor.com/auth/callback`

### Supabase Dashboard (Configuración manual requerida):

1. **Authentication → Settings:**
   - **Site URL:** `https://ecucondor.com`
   - **Redirect URLs:** 
     - `https://ecucondor.com/*`
     - `https://www.ecucondor.com/*`
     - `http://localhost:3000/*` (desarrollo)

2. **Authentication → Providers → Google:**
   - **Client ID:** Ver archivo `production-config.md`
   - **Client Secret:** Ver archivo `production-config.md`
   - **Skip nonce checks:** ❌ Deshabilitado (recomendado)

## Comandos disponibles

```bash
npm run test-auth    # Probar conexión con Supabase
npm run demo        # Demo de autenticación
npm run test-google # Verificar configuración de Google Auth
```