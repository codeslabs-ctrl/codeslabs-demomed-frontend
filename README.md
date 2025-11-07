# FemiMed Dashboard

Dashboard para la gestión de pacientes y consultas del historial médico.

## 🚀 Configuración Rápida

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Backend femimed-backend ejecutándose en puerto 3000

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Variables de Entorno

El proyecto utiliza archivos de configuración para manejar diferentes entornos:

#### Desarrollo (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // ... otras configuraciones
};
```

#### Producción (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.femimed.com/api',
  // ... otras configuraciones
};
```

### Configuración Centralizada

Todas las configuraciones están centralizadas en `src/app/config/app.config.ts`:

- **API Configuration**: URLs base y endpoints
- **Pagination**: Configuración de paginación
- **UI**: Configuraciones de interfaz
- **Validation**: Patrones de validación
- **Storage**: Claves de almacenamiento local

### Scripts Disponibles

```bash
# Desarrollo
npm start
ng serve

# Construcción
npm run build
ng build

# Producción
ng build --configuration production

# Testing
npm test
ng test
```

### Estructura del Proyecto

```
src/
├── app/
│   ├── config/           # Configuraciones centralizadas
│   ├── constants/        # Constantes de la aplicación
│   ├── models/           # Modelos de datos
│   ├── services/         # Servicios (API)
│   └── pages/            # Componentes de páginas
├── environments/         # Variables de entorno
└── assets/              # Recursos estáticos
```

### Configuración del Backend

El proyecto se conecta automáticamente al backend femimed-backend. Asegúrate de que esté ejecutándose en:
- **Desarrollo**: `http://localhost:3000`
- **Producción**: Configurar en `environment.prod.ts`

### Características

- ✅ Dashboard con estadísticas
- ✅ Gestión completa de pacientes (CRUD)
- ✅ Formularios con validación
- ✅ Búsqueda y filtros
- ✅ Paginación
- ✅ Diseño responsive
- ✅ Configuración centralizada
- ✅ Variables de entorno

### Tecnologías

- Angular 18
- TypeScript
- SCSS
- RxJS
- Angular Router
- Angular Forms
"# codeslabs-demomed-frontend" 
