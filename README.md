# EcuCondor Ultimate

Una aplicación web moderna que muestra las tasas y servicios financieros de EcuCondor, construida con Next.js, TypeScript y Tailwind CSS.

## Características

- **Tasas de Depósito**: Muestra las tasas actuales para cuentas de ahorro y CDTs
- **Tasas de Crédito**: Información sobre préstamos personales, hipotecarios, vehiculares y empresariales
- **Productos de Inversión**: Detalles sobre fondos de inversión y seguros
- **Diseño Responsivo**: Optimizado para dispositivos móviles y de escritorio
- **Interfaz Moderna**: UI/UX atractiva con Tailwind CSS

## Cómo empezar

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

1. Clona este repositorio:
```bash
git clone <url-del-repositorio>
cd ECUCONDORULTIMATE
```

2. Instala las dependencias:
```bash
pnpm i
# o
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
pnpm dev
# o
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Personalización

### Editar Tasas y Productos

Para modificar las tasas y productos financieros, edita el archivo `src/data/rates.ts`:

- **Tasas de Depósito**: Modifica el array `depositRates`
- **Tasas de Crédito**: Modifica el array `creditRates`
- **Productos de Inversión**: Modifica el array `investmentProducts`
- **Información de la Empresa**: Modifica el objeto `companyInfo`

### Editar la Página Principal

Para cambiar el diseño o contenido de la página principal, edita `src/app/page.tsx`.

### Estilos

Los estilos se manejan con Tailwind CSS. Puedes personalizar el tema en `tailwind.config.ts`.

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
├── data/
│   └── rates.ts             # Datos de tasas y productos
└── components/               # Componentes reutilizables (futuro)
```

## Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Construir para producción
- `pnpm start` - Servidor de producción
- `pnpm lint` - Ejecutar ESLint

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **React 18** - Biblioteca de UI

## Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

EcuCondor - info@ecucondor.com

Enlace del proyecto: [https://github.com/tu-usuario/ECUCONDORULTIMATE](https://github.com/tu-usuario/ECUCONDORULTIMATE)
