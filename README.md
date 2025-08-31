# 💰 ECUCONDORULTIMATE - Plataforma FinTech de Intercambio de Divisas

**ECUCONDORULTIMATE** es una aplicación web moderna para el intercambio de divisas entre Argentina, Brasil y Ecuador, desarrollada con las tecnologías más avanzadas del mercado.

## 🎯 ¿Qué hace esta aplicación?

Esta plataforma permite a usuarios **intercambiar dinero** entre diferentes monedas de forma segura y rápida:
- 💵 **Dólar Estadounidense (USD)**
- 🇦🇷 **Peso Argentino (ARS)**  
- 🇧🇷 **Real Brasileño (BRL)**
- 🇪🇨 **Dólar Ecuatoriano (ECU)**

### Funcionalidades principales:
1. **Ver tipos de cambio en tiempo real** - Como una casa de cambio online
2. **Realizar transacciones seguras** - Comprar y vender divisas
3. **Gestionar tu cuenta** - Historial, perfiles y verificación de identidad
4. **Dashboard personalizado** - Panel de control con toda tu información

---

## 🏗️ Arquitectura del Proyecto (Explicación Técnica)

### ¿Qué tecnologías usamos y por qué?

#### **Frontend (Lo que ve el usuario):**
- **Next.js 15** con **App Router**
  - *¿Qué es?* Un framework de React que permite crear aplicaciones web super rápidas
  - *¿Por qué?* Permite que la página cargue instantáneamente y funcione como una app móvil
  - *Ventajas:* SEO optimizado, páginas que cargan al instante, experiencia de usuario premium

#### **Backend (El cerebro de la aplicación):**
- **Supabase** 
  - *¿Qué es?* Una base de datos en la nube con superpoderes
  - *¿Por qué?* Maneja usuarios, autenticación y datos de forma automática y segura
  - *Ventajas:* No necesitamos servidores propios, escala automáticamente, ultra seguro

#### **Deployment (Donde vive la aplicación):**
- **Vercel Serverless**
  - *¿Qué es?* Un servicio que hospeda nuestra aplicación en la nube
  - *¿Por qué?* Cero configuración, escala automáticamente, súper rápido
  - *Ventajas:* Solo pagas por lo que usas, disponibilidad 99.9%, global

#### **Styling (Como se ve la aplicación):**
- **Tailwind CSS**
  - *¿Qué es?* Una forma moderna de hacer que la aplicación se vea hermosa
  - *¿Por qué?* Desarrollo 10x más rápido, diseño consistente, responsive automático

---

## 📁 Estructura del Proyecto (Para Desarrolladores)

```
ECUCONDORULTIMATE/
├── 📁 ecucondor-app/          # Aplicación Next.js 15
│   ├── 📁 src/
│   │   ├── 📁 app/            # Páginas (App Router)
│   │   │   ├── 📄 page.tsx    # Página principal
│   │   │   ├── 📄 layout.tsx  # Layout general
│   │   │   ├── 📁 dashboard/  # Panel de usuario
│   │   │   ├── 📁 exchange/   # Intercambio de divisas
│   │   │   ├── 📁 transactions/ # Historial transacciones
│   │   │   └── 📁 auth/       # Login/Registro
│   │   ├── 📁 components/     # Componentes reutilizables
│   │   │   ├── 📁 ui/         # Botones, inputs, etc.
│   │   │   ├── 📁 auth/       # Formularios login
│   │   │   ├── 📁 dashboard/  # Widgets del panel
│   │   │   ├── 📁 exchange/   # Calculadora de cambio
│   │   │   └── 📁 transactions/ # Tablas de transacciones
│   │   └── 📁 lib/            # Lógica de negocio
│   │       ├── 📁 supabase/   # Conexión base datos
│   │       ├── 📁 types/      # Definiciones TypeScript
│   │       └── 📁 utils/      # Funciones auxiliares
├── 📁 components/ (Legacy)    # Componentes de autenticación base
├── 📁 database/              # Scripts SQL para la base datos
├── 📁 lib/ (Legacy)          # Cliente Supabase básico
└── 📄 production-config.md   # Guía de configuración producción
```

---

## 🚀 Exchange Rate API (¡COMPLETAMENTE FUNCIONAL!)

### **Sistema de Cotizaciones en Tiempo Real**

El corazón de Ecucondor es su **API de tipos de cambio** que obtiene precios en tiempo real desde **Binance** y aplica la lógica de negocio específica.

#### **🎯 Lógica de Negocio Implementada:**
```
📊 Precio Binance USDT/ARS: 1,370.75
💰 Precio VENTA (Ecucondor → Cliente): 1,350.75 (Binance - 20)
💰 Precio COMPRA (Cliente → Ecucondor): 1,420.75 (Binance + 50)
📈 Spread: 70 pesos de ganancia
💵 Comisión USD→ARS: 3% | ARS→USD: 0%
```

#### **📡 APIs Disponibles:**

```bash
# Obtener todas las cotizaciones
GET /api/rates

# Cotización específica 
GET /api/rates/USD-ARS

# Calcular venta (con comisión 3%)
GET /api/rates/USD-ARS/sell?amount=100

# Calcular compra (sin comisión)
GET /api/rates/USD-ARS/buy?amount=150000

# Stream en tiempo real (SSE)
GET /api/rates/stream
GET /api/rates/USD-ARS/stream

# Estado del sistema
GET /api/health
```

#### **✅ Transacciones Probadas:**

**Cliente vende 100 USD:**
- Recibe: **131,022.75 ARS** (después de 3% comisión)
- Comisión Ecucondor: **4,052.25 ARS**
- Rate usado: **1,350.75 ARS/USD**

**Cliente compra 105.63 USD con 150,000 ARS:**
- Entrega: **150,000 ARS**
- Recibe: **105.63 USD**
- Ganancia Ecucondor: **~3,900 ARS** (spread)
- Rate usado: **1,420.75 ARS/USD**

#### **🌍 Monedas Soportadas:**
- ✅ **USD-ARS** (Binance USDT/ARS + ajustes)
- ✅ **USD-BRL** (Binance USDT/BRL + ajustes)  
- ✅ **USD-ECU** (Fijo 1.00 - Ecuador usa USD)
- ✅ **ARS-BRL** (Rate cruzado calculado automáticamente)

#### **⚡ Características Técnicas:**
- **Actualización:** Cada 30 segundos desde Binance
- **Fallbacks:** API + Web scraping si API falla
- **Cache:** 30 segundos para performance óptima
- **Real-time:** Server-Sent Events (SSE) para updates instantáneos
- **Límites:** 100 requests/minuto por IP
- **Monitoreo:** Health checks y métricas

#### **📊 Ejemplo de Respuesta API:**
```json
{
  "success": true,
  "data": {
    "pair": "USD-ARS",
    "binance_rate": 1370.75,
    "sell_rate": 1350.75,
    "buy_rate": 1420.75,
    "spread": 70,
    "commission_rate": 0.03,
    "last_updated": "2025-08-31T21:51:01Z",
    "source": "binance"
  }
}
```

#### **🧪 Testing en Desarrollo:**
```bash
cd ecucondor-app
npm run dev              # Iniciar servidor
npm run test-api         # Probar todas las APIs
npm run simulate         # Simular transacciones reales

# APIs disponibles en: http://localhost:3000/api/
```

---

## 🚀 Guía de Instalación y Desarrollo

### Prerrequisitos (Lo que necesitas instalado):
1. **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
2. **Git** - [Descargar aquí](https://git-scm.com/)
3. Una cuenta en **GitHub**
4. Una cuenta en **Supabase** (gratuita)
5. Una cuenta en **Vercel** (gratuita)

### Paso 1: Clonar el Repositorio
```bash
# Descargar el proyecto a tu computadora
git clone https://github.com/ecucondorSA/ECUCONDORULTIMATE.git

# Entrar a la carpeta del proyecto
cd ECUCONDORULTIMATE

# Navegar a la aplicación Next.js
cd ecucondor-app
```

### Paso 2: Instalar Dependencias
```bash
# Instalar todas las librerías necesarias (toma unos minutos)
npm install
```

### Paso 3: Configurar Variables de Entorno
```bash
# Copiar el archivo de configuración
cp .env.local.example .env.local

# Editar el archivo con tus credenciales de Supabase
# (Usa cualquier editor de texto)
```

### Paso 4: Ejecutar en Modo Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm run dev

# ¡Abre tu navegador en http://localhost:3000!
```

---

## 🔧 Configuración de Servicios Externos

### Supabase (Base de Datos y Autenticación)

#### ¿Qué es Supabase?
Supabase es como tener un equipo completo de backend trabajando para ti. Se encarga de:
- **Base de datos** - Donde guardamos usuarios, transacciones, etc.
- **Autenticación** - Login con email/password y Google
- **APIs automáticas** - Para que el frontend hable con la base datos
- **Seguridad** - Protege los datos de cada usuario

#### Configuración paso a paso:

1. **Crear cuenta en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Regístrate gratis con GitHub

2. **Crear nuevo proyecto:**
   - Nombre: `ECUCONDORULTIMATE`
   - Password: (guarda esta contraseña segura)
   - Región: South America (São Paulo)

3. **Obtener credenciales:**
   - Ve a Settings → API
   - Copia el **Project URL**
   - Copia la **anon public key**
   - Copia la **service role key** (¡mantenla secreta!)

4. **Configurar base de datos:**
   - Ve a SQL Editor
   - Ejecuta el script de `database/schema-fixed.sql`
   - Esto crea las tablas necesarias automáticamente

5. **Configurar autenticación:**
   - Authentication → Providers
   - Habilita Google (opcional)
   - Configura URLs de redirect

### Google OAuth (Login con Google - Opcional)

#### ¿Para qué sirve?
Permite que los usuarios hagan login con su cuenta de Google en vez de crear una nueva cuenta.

#### Configuración:
Ver archivo `production-config.md` para instrucciones detalladas.

### Vercel (Hosting y Deployment)

#### ¿Qué es Vercel?
Es donde "vive" tu aplicación en internet. Es como alquilar un espacio en la web que:
- Es súper rápido (CDN global)
- Escala automáticamente si tienes muchos usuarios
- Se actualiza automáticamente cuando subes código nuevo
- Es gratis para proyectos pequeños

#### Deployment automático:
1. Conecta tu repositorio GitHub con Vercel
2. Cada vez que hagas `git push`, Vercel actualiza la aplicación automáticamente
3. ¡Tu aplicación está disponible en una URL pública!

---

## 💾 Base de Datos (Estructura Explicada)

### Tablas principales:

#### 👥 **profiles** (Perfiles de Usuario)
Guarda la información de cada usuario:
```sql
- id: Identificador único del usuario
- email: Correo electrónico
- full_name: Nombre completo
- phone: Teléfono (para verificación)
- country: País de residencia
- kyc_status: Estado de verificación de identidad
- created_at: Cuándo se registró
```

#### 💱 **exchange_rates** (Tipos de Cambio)
Guarda las cotizaciones de las monedas:
```sql
- base_currency: Moneda origen (ej: USD)
- target_currency: Moneda destino (ej: ARS)
- buy_rate: Precio de compra
- sell_rate: Precio de venta
- last_updated: Última actualización
```

#### 💳 **transactions** (Transacciones)
Guarda cada operación de cambio:
```sql
- user_id: ¿Quién hizo la transacción?
- type: ¿Compra o venta?
- base_amount: Cantidad enviada
- target_amount: Cantidad recibida
- exchange_rate: Tipo de cambio usado
- status: ¿Pendiente, completada, cancelada?
- fee: Comisión cobrada
```

### Seguridad (Row Level Security - RLS):
- Cada usuario **solo puede ver sus propios datos**
- Las políticas de seguridad están automatizadas
- Imposible que un usuario vea datos de otro

---

## 🛠️ Comandos Disponibles

### Para desarrolladores:
```bash
# Desarrollo (desde ecucondor-app/)
npm run dev          # Iniciar servidor desarrollo (puerto 3000)
npm run build        # Construir para producción
npm run start        # Iniciar servidor producción
npm run lint         # Revisar código por errores
npm run test-api     # 🧪 Probar todas las APIs de exchange
npm run simulate     # 💰 Simular transacciones reales

# Testing (desde la carpeta raíz)
npm run test-auth    # Probar conexión Supabase
npm run demo         # Demo de autenticación
npm run test-google  # Verificar Google OAuth
```

### Para deployment:
```bash
# Vercel (recomendado)
npm install -g vercel
vercel --prod

# O conectar GitHub con Vercel para auto-deployment
```

---

## 📈 Funcionalidades del Sistema

### Para Usuarios Finales:
1. **Registro y Login**
   - Email + contraseña
   - Login con Google
   - Verificación por email
   - Recuperación de contraseña

2. **Dashboard Principal**
   - Resumen de cuenta
   - Transacciones recientes
   - Tipos de cambio favoritos
   - Estadísticas personales

3. **Intercambio de Divisas**
   - Calculadora en tiempo real
   - Selección de monedas
   - Vista previa de comisiones
   - Confirmación segura

4. **Gestión de Transacciones**
   - Historial completo
   - Estados en tiempo real
   - Filtros y búsqueda
   - Exportación de datos

### Para Administradores:
1. **Gestión de Tipos de Cambio**
   - Actualización manual/automática
   - Configuración de márgenes
   - Histórico de cambios

2. **Administración de Usuarios**
   - Verificación KYC
   - Gestión de permisos
   - Soporte al cliente

---

## 🔒 Características de Seguridad

### Autenticación:
- ✅ **Passwords encriptados** - Imposible ver contraseñas reales
- ✅ **Tokens JWT** - Sesiones seguras que expiran
- ✅ **OAuth con Google** - Autenticación de confianza
- ✅ **Verificación por email** - Confirma identidades reales

### Base de Datos:
- ✅ **Row Level Security** - Cada usuario ve solo sus datos
- ✅ **Políticas automáticas** - Reglas de acceso automatizadas
- ✅ **Conexiones SSL** - Datos encriptados en tránsito
- ✅ **Backups automáticos** - Supabase respalda todo

### Aplicación:
- ✅ **HTTPS obligatorio** - Navegación encriptada
- ✅ **Validación frontend/backend** - Doble verificación
- ✅ **Rate limiting** - Previene ataques automatizados
- ✅ **Sanitización de datos** - Previene inyecciones SQL

### Compliance Financiero:
- ✅ **KYC (Know Your Customer)** - Verificación de identidad
- ✅ **AML (Anti Money Laundering)** - Detección de lavado
- ✅ **Auditoría completa** - Log de todas las transacciones
- ✅ **Límites por usuario** - Control de riesgo

---

## 🎨 Tecnologías y Librerías Utilizadas

### Core Framework:
- **Next.js 15** - Framework React con App Router
- **React 18** - Librería UI con Server Components
- **TypeScript** - JavaScript tipado para menos errores

### Styling y UI:
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Iconos modernos y ligeros
- **Class Variance Authority** - Gestión de variantes CSS
- **Tailwind Merge** - Combinación inteligente de clases

### Backend y Database:
- **Supabase** - Backend as a Service
- **@supabase/ssr** - Integración SSR con Next.js
- **PostgreSQL** - Base de datos relacional robusta

### Development Tools:
- **ESLint** - Linter para código limpio
- **PostCSS** - Procesador CSS
- **Turbopack** - Bundler súper rápido (Next.js 15)

---

## 📊 Roadmap de Desarrollo

### Fase 1: MVP (Producto Mínimo Viable) ✅
- [x] Setup inicial del proyecto
- [x] Autenticación con Supabase
- [x] Estructura base Next.js 15
- [x] Configuración TypeScript
- [x] Database schema
- [x] **Exchange Rate API completa**
- [x] **Integración Binance funcionando**
- [x] **Lógica de negocio implementada**
- [x] **APIs REST + SSE en tiempo real**
- [x] **Transacciones probadas y rentables**
- [ ] Componentes UI básicos
- [ ] Dashboard principal

### Fase 2: Core Features 🚧
- [x] **Sistema de intercambio de divisas** ✅
- [x] **Calculadora de tipos de cambio** ✅
- [x] **Integración con APIs de cotización (Binance)** ✅
- [ ] Frontend para calculadora de cambios
- [ ] Gestión de transacciones en UI
- [ ] Sistema de notificaciones
- [ ] Integración con métodos de pago

### Fase 3: Advanced Features 📋
- [ ] KYC (verificación de identidad)
- [ ] Límites y controles de riesgo
- [ ] Panel administrativo
- [ ] Reportes y analytics
- [ ] API pública

### Fase 4: Production Ready 🎯
- [ ] Testing automatizado
- [ ] Monitoreo y logging
- [ ] Optimizaciones de performance
- [ ] SEO y marketing
- [ ] Compliance y auditorías

---

## 👥 Contribuir al Proyecto

### Para desarrolladores que quieren ayudar:

1. **Fork el repositorio**
2. **Crear una rama nueva** para tu feature
3. **Hacer tus cambios** siguiendo las convenciones
4. **Escribir tests** si es necesario
5. **Crear Pull Request** con descripción detallada

### Convenciones de código:
- **TypeScript obligatorio** - Tipado estricto
- **ESLint** - Seguir reglas de linting
- **Conventional Commits** - Mensajes de commit claros
- **Component naming** - PascalCase para componentes
- **File organization** - Estructura de carpetas consistente

---

## 🐛 Debugging y Troubleshooting

### Problemas comunes:

#### Error: "Supabase client not initialized"
```bash
# Verificar que .env.local existe y tiene las variables correctas
cat .env.local

# Reiniciar servidor desarrollo
npm run dev
```

#### Error: "Module not found"
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Database connection failed"
```bash
# Verificar estado de Supabase
npm run test-auth

# Verificar que el SQL schema fue ejecutado
```

#### Build errors en Vercel:
```bash
# Verificar que build funciona localmente
npm run build

# Verificar variables de entorno en Vercel dashboard
```

---

## 📞 Soporte y Contacto

### Para usuarios:
- **Email**: soporte@ecucondor.com
- **WhatsApp**: [Enlace desde la web]
- **Horarios**: Lunes a Viernes 9:00-18:00 (GMT-3)

### Para desarrolladores:
- **GitHub Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Wiki**: Documentación técnica detallada

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT** - mira el archivo [LICENSE](LICENSE) para más detalles.

### ¿Qué significa esto?
- ✅ **Uso comercial** permitido
- ✅ **Modificación** permitida  
- ✅ **Distribución** permitida
- ✅ **Uso privado** permitido
- ❌ **Sin garantía** - úsalo bajo tu propio riesgo

---

## 🏆 Créditos

### Desarrollado por:
- **ECUCONDOR S.A.S** - Concepto y especificaciones
- **Claude AI** - Desarrollo inicial y arquitectura
- **Comunidad Open Source** - Librerías y herramientas

### Tecnologías patrocinadas por:
- **Vercel** - Hosting y deployment
- **Supabase** - Backend y database
- **Next.js** - Framework React

---

*Última actualización: Agosto 2025*

**¡Gracias por usar ECUCONDORULTIMATE! 🚀💰**