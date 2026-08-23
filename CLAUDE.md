# JF3 Service Backend - NestJS

## Resumen del Proyecto

Backend de JF3 Delivery Services construido con NestJS. API RESTful para gestión de tiendas, productos, categorías, opciones de delivery, y el sistema de aliados/partners (registro, aprobación y panel propio).

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
│   │   ├── admin/                 # Autenticación admin + aprobación de partners (guard propio)
│   │   ├── partners/              # Registro, login y panel de aliados (guard propio)
│   │   ├── stores-categories/     # Categorías de tiendas
│   │   ├── stores/               # Tiendas
│   │   ├── products-categories/  # Categorías de productos
│   │   ├── products/             # Productos
│   │   ├── delivery-settings/     # Configuración global de delivery (precio por km)
│   │   └── search/               # Búsqueda
│   └── common/                    # Componentes compartidos
│       ├── services/             # cloudinary.service.ts
│       ├── filters/               # global-exception.filter.ts
│       └── interceptors/         # logging.interceptor.ts
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

| Script          | Comando                                     | Descripción                                     |
| --------------- | -------------------------------------------- | ------------------------------------------------ |
| `build`         | `nest build`                                 | Compilar TypeScript                              |
| `format`        | `prettier --write "src/**/*.ts" "test/**/*.ts"` | Formatear código                              |
| `start`         | `nest start`                                 | Iniciar servidor                                 |
| `start:dev`     | `nest start --watch`                         | Desarrollo con hot-reload                        |
| `start:debug`   | `nest start --debug --watch`                 | Desarrollo con debugger                          |
| `start:prod`    | `node dist/main`                             | Producción                                       |
| `start:migrate` | `prisma migrate deploy && node dist/main`    | Aplica migraciones y arranca (usado en Railway)  |
| `seed`          | `prisma db seed`                             | Planta el administrador inicial (idempotente)    |
| `seed:dev`      | `ts-node prisma/seed-dev.ts`                 | Planta data de prueba (solo desarrollo)          |
| `lint`          | `eslint "{src,apps,libs,test}/**/*.ts" --fix`| Linting                                          |
| `test`          | `jest`                                       | Tests unitarios                                  |
| `test:watch`    | `jest --watch`                               | Tests en modo watch                              |
| `test:cov`      | `jest --coverage`                            | Cobertura de tests                               |
| `test:e2e`      | `jest --config ./test/jest-e2e.json`         | Tests E2E                                        |

### Seed del administrador

`npm run seed` ejecuta `prisma/seed.ts` (registrado en `prisma.config.ts` bajo `migrations.seed`, que es donde Prisma 7 espera esa clave — ya no en `package.json`). Crea el único `UserAdmin` del sistema y evita tener que pasar por `POST /admin/register` en cada entorno nuevo.

Es **idempotente**: si ya existe un administrador no toca nada, así que volver a correrlo no pisa una contraseña que se haya cambiado después. Se puede encadenar al arranque en producción (`prisma migrate deploy && prisma db seed && node dist/main`) sin riesgo.

Credenciales por defecto, sobreescribibles con `ADMIN_SEED_USERNAME` / `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`:

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Email | `admin@admin.com` |
| Contraseña | `Admin123*` |

⚠️ Dos cosas que confunden y conviene tener presentes:

- **El login es por `username`, no por email.** `AdminService.login()` busca con `findUnique({ where: { username } })`. El formulario del panel muestra el campo como "Usuario" (su variable interna se llama `loginData.email`, pero viaja como `username`). Con el seed por defecto se entra con `admin`, no con `admin@admin.com`.
- **La contraseña por defecto cumple a propósito el `passwordRegex` del servicio** (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`), de ahí el `*` final. El seed escribe el hash directo sin pasar por esa validación y el login solo hace `bcrypt.compare`, así que técnicamente aceptaría cualquier cosa — pero una contraseña que `POST /admin/register` rechazaría sería una trampa esperando a quien intente recrear ese mismo admin por el endpoint. Si se sobreescribe con `ADMIN_SEED_PASSWORD`, conviene respetar el mismo formato.

Cambiar estas credenciales en cualquier entorno expuesto públicamente.

### Seed de data de prueba

`npm run seed:dev` ejecuta `prisma/seed-dev.ts` y planta el catálogo de desarrollo: 5 categorías de tienda, 6 tiendas, 11 categorías de producto, 23 productos, un partner aprobado y la configuración de delivery. Está **deliberadamente separado del seed de admin** — `prisma db seed` (el que se encadena al arranque en producción) no lo toca — y aborta si `NODE_ENV=production`, salvo que se pase `SEED_DEV_FORCE=1`.

Es idempotente por `slug`: cada tienda y cada producto sembrado lleva un slug fijo terminado en `SEED` + número (`pizzerSEED02`, `pizzamSEED04`), así que re-correrlo actualiza en lugar de duplicar. Ese sufijo también distingue a simple vista lo sembrado de lo creado a mano desde el panel.

Detalles que importan al probar contra esta data:

- **Todas las imágenes son una sola URL de Cloudinary** ya existente, para no depender de subir archivos. El `update` del upsert **no** toca `image`/`coverImage`: si alguien sube las imágenes de verdad desde el panel, re-correr el seed no las revierte al placeholder.
- **"Tienda Sin Ubicación" no tiene coordenadas a propósito.** Sirve para verificar que las tiendas sin `latitude`/`longitude` quedan ocultas del sitio público: `GET /stores` devuelve 5, `GET /stores?includeUnlocated=true` devuelve 6, y su producto ("Producto oculto") no aparece en el buscador.
- **Burger House cierra a las `00:00`**, que es el caso que ejercita la lógica de abierto/cerrado cuando el horario cruza la medianoche.
- Las 5 tiendas ubicadas están en Caracas a distancias distintas, para que las cotizaciones de `POST /delivery-settings/quote` den valores diferenciados.
- Partner de prueba, ya en estado `ACTIVE` (entra al panel sin pasar por la aprobación del admin): `partner@demo.com` / `Partner123`, sobreescribibles con `SEED_DEV_PARTNER_EMAIL` / `SEED_DEV_PARTNER_PASSWORD`. La tienda "Sabores del Ávila" es la suya; las demás no tienen partner.

No existen scripts `prisma:generate`/`prisma:migrate` en `package.json` — para desarrollo local usar `npx prisma generate` / `npx prisma migrate dev` directamente; en producción las migraciones se aplican vía `start:migrate`.

---

## Variables de Entorno

```env
# PostgreSQL Configuration
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Backend Configuration
PORT=3000
CORS_ORIGINS=

DATABASE_URL=

JWT_SECRET_KEY=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Modelos de Datos (Prisma)

1. **UserAdmin** - Usuario administrador (`username`, `email`, `password`, `role`)
2. **User** - Cuenta de autenticación del partner (`email`, `password`, `role` default `"PARTNER"`, `status` default `"PENDING_APPROVAL"`) — relación 1:1 con `StorePartner`
3. **StorePartner** - Datos de negocio del aliado (`businessName`, `phone`) — relación 1:1 con `User`, 1:N con `Stores`
4. **StoresCategories** - Categorías de tiendas
5. **Stores** - Tiendas/aliados (`slug` único opcional, `partnerId` opcional → `StorePartner`)
6. **ProductsCategories** - Categorías de productos
7. **Product** - Productos (`slug` único opcional)
8. **DeliverySettings** - Configuración global de delivery, registro único (`pricePerKm`, `minFee`)

### Visibilidad pública de tiendas

Las tiendas sin `latitude`/`longitude` quedan **ocultas del sitio público**: se filtran en `stores` (`findAll`/`findOne`/`findOneBySlug`), `products` (listados y detalle) y `search`. El criterio vive en `src/common/constants/located-store.ts`. El panel admin sigue viéndolas pasando `?includeUnlocated=true` en `GET /stores` y `GET /products`.

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
- `perf-always-use-pagination` - Siempre usar paginación en endpoints de lista (findAll) desde el inicio

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
- [x] Crear modelo DeliverySettings (reemplazó a DeliveryOptions/"Zonas delivery")

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

### DeliverySettings (Configuración global de Delivery) (Completado ✓)

- [x] Crear modulo de DeliverySettings (registro único, `pricePerKm`)
- [x] Crear servicio para obtener la configuración (público, crea el default si no existe)
- [x] Crear servicio para actualizar la configuración (SOLO ADMIN)
- [x] Tests unitarios
- [x] Reemplaza al antiguo modelo DeliveryOptions ("Zonas delivery" por tienda)

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

### Optimizaciones (Completado ✓)

- [x] Agregar paginación a: stores, products, products-categories, delivery-options, stores-categories

---

## Fase 4: Sistema de Aliados / StorePartners (Completado ✓)

### Arquitectura de Usuarios

Sistema multi-rol con tabla de auth centralizada y tablas específicas por rol:

```
users (Auth)           → id, email, password, role, status, created_at
store_partners (Aliados) → userId, storeId, businessName, phone
```

**Roles disponibles:** `admin`, `partner`
**Estados de cuenta:** `pending_approval`, `active`, `inactive`, `rejected`

### 4.1 Modelos de Datos - Users System

- [x] Crear tabla `User` genérica para autenticación (email, password, role, status)
- [x] Crear tabla `StorePartner` (relación 1:1 con User + datos del negocio + relación con Store)
- [x] Actualizar modelo `Stores` para agregar relación con StorePartner
- [x] Actualizar schema.prisma con relaciones

### 4.2 Módulo Auth (Generalizado)

- [x] Refactorizar auth existente para soportar múltiples roles
- [x] Crear servicio de registro genérico que cree usuario + tabla específica según rol
- [x] Crear servicio de login que retorne datos según tipo de usuario
- [x] Implementar JWT con payload incluyendo role y userId

### 4.3 Módulo Store Partners (Registro y Login)

- [x] Crear endpoint POST /partners/register (crea User + StorePartner con status pending_approval)
- [x] Crear endpoint POST /partners/login (retorna JWT si está approved)
- [x] Implementar validación de email único
- [x] Tests unitarios

### 4.4 Aprobación de Partners (Dashboard Admin)

- [x] Crear endpoint GET /admin/partners/pending (listar registros pendientes)
- [x] Crear endpoint PATCH /admin/partners/:id/approve (aprobar y permitir login)
- [x] Crear endpoint PATCH /admin/partners/:id/reject (rechazar registro)
- [x] Tests unitarios

### 4.5 Configuración de Tienda (Post-Aprobación)

- [x] Crear endpoint POST /partners/store (crear Store vinculada al partner aprobado)
- [x] Crear endpoint PUT /partners/store/:id (actualizar datos de tienda)
- [x] Crear endpoint GET /partners/store (obtener tienda del partner)
- [x] Guard: solo partners approved pueden acceder
- [x] Tests unitarios

### 4.6 Gestión de Productos (Partner)

- [x] Crear endpoint POST /partners/products (crear producto en su tienda)
- [x] Crear endpoint PUT /partners/products/:id (modificar producto)
- [x] Crear endpoint DELETE /partners/products/:id (eliminar producto)
- [x] Crear endpoint GET /partners/products (listar productos de su tienda)
- [x] Guard: verificar que el producto pertenece a su tienda
- [x] Tests unitarios

> Nota: el partner ya no gestiona delivery — el precio por km es una configuración global del admin (ver `DeliverySettings` más arriba). El antiguo apartado 4.7 "Gestión de Delivery Options (Partner)" (zonas de delivery por tienda) fue eliminado.

### 4.8 Gestión de Categorías de Productos (Partner)

- [x] Crear endpoint POST /partners/products-categories (crear categoría en su tienda)
- [x] Crear endpoint PUT /partners/products-categories/:id (modificar categoría)
- [x] Crear endpoint DELETE /partners/products-categories/:id (eliminar categoría)
- [x] Crear endpoint GET /partners/products-categories (listar categorías de su tienda)
- [x] Guard: verificar que la categoría pertenece a su tienda
- [x] Tests unitarios

### 4.9 Dashboard del Partner

- [x] Crear endpoint GET /partners/dashboard (stats básicas de su tienda)
- [x] Tests unitarios

---

## Fases Futuras (Pendiente)

### Sistema de Clientes

- Implementar tabla Client y módulo de autenticación
- Registro, login y perfil de clientes

### Sistema de Riders

- Implementar tabla Rider y módulo de autenticación
- Registro, login y gestión de disponibilidad

### Sistema de Pedidos

- Crear tablas Order y OrderItem
- Flujo completo de pedidos
