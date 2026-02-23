# JF3 Service Backend - NestJS

## Resumen del Proyecto

Backend de JF3 Delivery Services migrado a NestJS. Mantiene la misma funcionalidad del proyecto Express original pero con arquitectura NestJS.

---

## Tecnologías

- **Framework:** NestJS + TypeScript
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + bcrypt
- **Arquitectura:** Modular (Modules, Controllers, Services)

---

## Estructura de Carpetas

```
jf3-nest/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── prisma/
│   │   └── prisma.service.ts      # Prisma client service
│   ├── modules/                   # Feature modules
│   │   ├── auth/
│   │   ├── user-admin/
│   │   ├── aliado/
│   │   ├── category/
│   │   ├── product/
│   │   ├── order/
│   │   ├── order-item/
│   │   ├── payment/
│   │   ├── paydates/
│   │   └── delivery/
│   ├── common/                    # Shared components
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   └── config/                    # Configuration
├── prisma/
│   ├── schema.prisma              # Esquema BD
│   └── migrations/                # Migraciones
├── test/
└── package.json
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

Los siguientes modelos se migrarán progresivamente del proyecto Express:

1. **UserAdmin** - Tabla de usuario administrador
2. **Stores** - tiendas/aliados
3. **StoresCategories** - tiendas/aliados
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

### Fase 1: Setup y Auth (Completado)

- [x] Inicializar proyecto NestJS
- [x] Configurar Prisma
- [x] Crear modelo UserAdmin con createdAt
- [x] Configurar autenticación JWT

### Fase 2: Módulos de Datos (Completado)

- [x] Migrar modelo Aliado que sera en este proyecto Stores
- [x] Crear modelo StoresCategories
- [x] Migrar modelo Category que ahora sera ProductsCategories
- [x] Migrar modelo Product que sera en este proyecto Products
- [x] Migrar modelo DeliveryOptions

### Fase 3: Modulo Admin (Completado)

- [x] Crea el modulo admin
- [x] Crea el servicio de registro de administrador
- [x] Crea el servicio de login de administrador
- [x] Crear Guard de autenticación JWT
- [x] Crea el servicio para el dashboard inicial (protegido con auth)
- [x] Implementar validación con class-validator (Refinamiento)
- [x] Agregar Exception Filters (Refinamiento)
- [x] Agregar Logging (Refinamiento)
- [x] Tests unitarios (Refinamiento)

### Refinamientos por cada modulo a trabajar

- [ ] Implementar validación con class-validator
- [ ] Agregar Guards de autenticación
- [ ] Agregar Exception Filters
- [ ] Agregar Logging
- [ ] Tests unitarios

---

## Notas

- El proyecto Express original está en `jf3-service/`
- El nuevo proyecto NestJS está en `jf3-nest/`
