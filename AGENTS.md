# JF3 Service Backend - NestJS

## Resumen del Proyecto

Backend de JF3 Delivery Services construido con NestJS. API RESTful para gestión de tiendas, productos, categorías y opciones de delivery.

---

## Tecnologías

- **Framework:** NestJS + TypeScript
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + bcrypt
- **Almacenamiento:** Cloudinary (imágenes)
- **Arquitectura:** Modular (Modules, Controllers, Services)

---

## Estructura de Carpetas

```
jf3-nest/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # App controller
│   ├── app.service.ts             # App service
│   ├── prisma/
│   │   └── prisma.service.ts      # Prisma client service
│   ├── modules/                   # Feature modules
│   │   ├── admin/                 # Autenticación y admin
│   │   ├── stores-categories/     # Categorías de tiendas
│   │   ├── stores/               # Tiendas
│   │   ├── products-categories/  # Categorías de productos
│   │   ├── products/             # Productos
│   │   ├── delivery-options/     # Opciones de delivery
│   │   └── search/               # Búsqueda
│   └── common/                    # Componentes compartidos
│       ├── services/             # Servicios (Cloudinary)
│       ├── decorators/
│       ├── filters/
│       ├── guards/
│       ├── interceptors/
│       └── pipes/
├── prisma/
│   ├── schema.prisma              # Esquema BD
│   └── migrations/                # Migraciones
├── test/
├── API.md                         # Documentación de API
├── package.json
└── .env                          # Variables de entorno
```

---

## Scripts Disponibles

| Script            | Comando                            | Descripción               |
| ----------------- | ---------------------------------- | ------------------------- |
| `build`           | `nest build`                       | Compilar TypeScript       |
| `start`           | `nest start`                       | Iniciar servidor          |
| `start:dev`       | `nest start --watch`               | Desarrollo con hot-reload |
| `start:prod`      | `node dist/main`                   | Producción                |
| `prisma:generate` | `prisma generate`                  | Generar Prisma client     |
| `prisma:migrate`  | `prisma migrate dev`               | Ejecutar migraciones      |
| `lint`            | `eslint`                           | Linting                   |
| `test`            | `jest`                             | Tests unitarios           |
| `test:e2e`        | `jest --config test/jest-e2e.json` | Tests E2E                 |

---

## Variables de Entorno

```env
# PostgreSQL Configuration
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Backend Configuration
PORT=3000

DATABASE_URL=

JWT_SECRET_KEY=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Modelos de Datos (Prisma)

1. **UserAdmin** - Tabla de usuario administrador
2. **StoresCategories** - Categorías de tiendas
3. **Stores** - Tiendas/aliados
4. **ProductsCategories** - Categorías de productos
5. **Products** - Productos
6. **DeliveryOptions** - Opciones de delivery

---

## Mejores Prácticas NestJS

### 1. Arquitectura

- `arch-feature-modules` - Organizar por feature, no por capa técnica
- `arch-module-sharing` - Exports e imports correctos, evitar providers duplicados
- `arch-single-responsibility` - Servicios enfocados, evitar "god services"
- `arch-use-repository-pattern` - Abstraer lógica de BD para testabilidad
- `arch-use-events` - Arquitectura event-driven para decoupling

### 2. Inyección de Dependencias

- `di-prefer-constructor-injection` - Constructor sobre property injection
- `di-scope-awareness` - Entender scopes singleton/request/transient
- `di-use-interfaces-tokens` - Usar injection tokens para interfaces

### 3. Manejo de Errores

- `error-use-exception-filters` - Manejo centralizado de excepciones
- `error-throw-http-exceptions` - Usar HTTP exceptions de NestJS
- `error-handle-async-errors` - Manejar errores async correctamente

### 4. Seguridad

- `security-auth-jwt` - Autenticación JWT segura
- `security-validate-all-input` - Validar con class-validator
- `security-use-guards` - Guards de autenticación y autorización
- `security-sanitize-output` - Prevenir ataques XSS
- `security-rate-limiting` - Implementar rate limiting

### 5. Rendimiento

- `perf-use-caching` - Implementar estrategias de caching
- `perf-optimize-database` - Optimizar queries de BD
- `perf-lazy-loading` - Lazy load modules para startup rápido

### 6. Testing

- `test-use-testing-module` - Usar utilidades de testing de NestJS
- `test-e2e-supertest` - E2E testing con Supertest
- `test-mock-external-services` - Mock de dependencias externas

### 7. Base de Datos

- `db-use-transactions` - Manejo de transacciones
- `db-avoid-n-plus-one` - Evitar problemas N+1
- `db-use-migrations` - Usar migrations para cambios de schema

### 8. API Design

- `api-use-dto-serialization` - DTOs y serialización de respuestas
- `api-use-interceptors` - Cross-cutting concerns
- `api-versioning` - Estrategias de versionado de API
- `api-use-pipes` - Transformación de input con pipes

---

## To-Do List

### Fase 1: Setup y Auth (Completado ✓)

- [x] Inicializar proyecto NestJS
- [x] Configurar Prisma
- [x] Crear modelo UserAdmin con createdAt
- [x] Configurar autenticación JWT

### Fase 2: Modelos de Datos (Completado ✓)

- [x] Migrar modelo Aliado → Stores
- [x] Crear modelo StoresCategories
- [x] Migrar modelo Category → ProductsCategories
- [x] Migrar modelo Product → Products
- [x] Migrar modelo DeliveryOptions

### Fase 3: Modulo Admin (Completado ✓)

- [x] Crear modulo admin
- [x] Crear servicio de registro de administrador
- [x] Crear servicio de login de administrador
- [x] Crear Guard de autenticación JWT
- [x] Crear servicio para el dashboard inicial (protegido con auth)
- [x] Implementar validación con class-validator
- [x] Agregar Exception Filters
- [x] Agregar LoggingInterceptor
- [x] Tests unitarios

### StoresCategories (Completado ✓)

- [x] Crear modulo de StoresCategories
- [x] Crear servicio para crear categoria de tienda (SOLO ADMIN)
- [x] Crear servicio para modificar categoria de tienda (SOLO ADMIN)
- [x] Crear servicio para eliminar categoria de tienda (SOLO ADMIN)
- [x] Crear servicio para obtener todas las categorias de tiendas
- [x] Crear servicio para obtener una categoria de tienda
- [x] Tests unitarios

### Stores (Tiendas) (Completado ✓)

- [x] Crear modulo de Stores
- [x] Crear servicio para crear tienda (SOLO ADMIN)
- [x] Crear servicio para modificar tienda (SOLO ADMIN)
- [x] Crear servicio para eliminar tienda (SOLO ADMIN)
- [x] Crear servicio para obtener todas las tiendas
- [x] Crear servicio para obtener una tienda por ID
- [x] Tests unitarios
- [x] Integración con Cloudinary (imágenes en base64)

### ProductsCategories (Categorías de Productos) (Completado ✓)

- [x] Crear modulo de ProductsCategories
- [x] Crear servicio para crear categoría de producto (SOLO ADMIN)
- [x] Crear servicio para modificar categoría de producto (SOLO ADMIN)
- [x] Crear servicio para eliminar categoría de producto (SOLO ADMIN)
- [x] Crear servicio para obtener todas las categorías de productos
- [x] Tests unitarios

### DeliveryOptions (Opciones de Delivery) (Completado ✓)

- [x] Crear modulo de DeliveryOptions
- [x] Crear servicio para crear opción de delivery (SOLO ADMIN)
- [x] Crear servicio para modificar opción de delivery (SOLO ADMIN)
- [x] Crear servicio para eliminar opción de delivery (SOLO ADMIN)
- [x] Crear servicio para obtener las opciones de delivery por StoreId
- [x] Tests unitarios

### Products (Productos) (Completado ✓)

- [x] Crear modulo de Products
- [x] Crear servicio para crear producto (SOLO ADMIN)
- [x] Crear servicio para modificar producto (SOLO ADMIN)
- [x] Crear servicio para eliminar producto (SOLO ADMIN)
- [x] Crear servicio para obtener productos por tienda
- [x] Integración con Cloudinary (múltiples imágenes en base64)
- [x] Tests unitarios

### Search (Búsqueda) (Completado ✓)

- [x] Crear modulo de Search
- [x] Buscar tiendas y productos
- [x] Filtrar por tipo (stores/products/all)
- [x] Paginación
- [x] Tests unitarios

### Optimizaciones Futuras (Pendiente)

- [x] Agregar paginación a: stores, products, products-categories, delivery-options, stores-categories
