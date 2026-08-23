# Guía de levantamiento en local — JF3 Delivery Services

Esta guía documenta cómo levantar `frontend/` y `jf3-nest/` en un entorno local con WSL, usando **Postgres en Docker** (no el Postgres nativo de WSL, ver sección de notas al final).

## Prerrequisitos

- Node.js `>=20.9.0` (recomendado usar la misma versión que Railway)
- Docker + Docker Compose (`docker --version`, `docker compose version`)
- Archivos `.env` ya configurados:
  - `jf3-nest/.env`
  - `frontend/.env.local`

Si no existen, copiarlos desde las variables descritas en `jf3-nest/CLAUDE.md` y `CLAUDE.md` (raíz).

---

## 1. Levantar la base de datos (Docker)

El archivo `jf3-nest/docker-compose.yml` define un contenedor de Postgres 16 para desarrollo local, expuesto en el puerto **5433** del host (para no chocar con un posible Postgres nativo en 5432).

```bash
cd jf3-nest
docker compose up -d
```

Verificar que esté arriba y aceptando conexiones:

```bash
docker ps --filter "name=jf3-postgres-dev"
docker exec jf3-postgres-dev pg_isready -U rauljariasz -d jf3_services_nestjs
```

`DATABASE_URL` en `jf3-nest/.env` debe apuntar a este contenedor:

```env
DATABASE_URL=postgresql://rauljariasz:admin@localhost:5433/jf3_services_nestjs
```

### Aplicar migraciones (solo la primera vez o tras un volumen nuevo)

```bash
cd jf3-nest
npx prisma migrate deploy
```

Esto crea todas las tablas (`UserAdmin`, `User`, `StorePartner`, `Stores`, `StoresCategories`, `Product`, `ProductsCategories`, `DeliveryOptions`) sin datos.

Para detener la base de datos sin perder los datos (el volumen `jf3_postgres_data` persiste):

```bash
docker compose stop
```

Para eliminarla completamente (incluye borrar los datos):

```bash
docker compose down -v
```

---

## 2. Levantar el backend (NestJS)

```bash
cd jf3-nest
npm install          # solo si no existe node_modules
npx prisma generate  # solo si no existe el client generado o cambió el schema
npm run start:dev
```

- Corre en el puerto definido por `PORT` en `.env` (por defecto `3005` en este setup local).
- Verificar:

```bash
curl http://localhost:3005/stores
```

Debe responder rápido (< 1s) con un JSON paginado, aunque esté vacío.

---

## 3. Levantar el frontend (Next.js)

```bash
cd frontend
npm install   # solo si no existe node_modules
npm run dev
```

- Corre en `http://localhost:3000`.
- `frontend/.env.local` debe apuntar al backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

---

## 4. Orden recomendado de arranque

```bash
# Terminal 1
cd jf3-nest && docker compose up -d

# Terminal 2
cd jf3-nest && npm run start:dev

# Terminal 3
cd frontend && npm run dev
```

Luego abrir `http://localhost:3000`.

---

## Notas y problemas conocidos

### No usar el Postgres nativo de WSL
En este entorno, el servicio `postgresql@14-main` de WSL quedaba con un proceso huérfano reteniendo `127.0.0.1:5432` tras suspender/reanudar WSL (en vez de apagarlo limpio), lo que colgaba **todas** las conexiones nuevas indefinidamente (incluso `pg_isready`). Por eso el proyecto usa Postgres en Docker (puerto 5433) para desarrollo local — es reproducible y se descarta/recrea sin arrastrar ese estado corrupto.

Si en algún momento se prefiere volver al Postgres nativo, hay que:
1. Verificar que no haya un postmaster huérfano: `sudo systemctl restart postgresql@14-main`
2. Confirmar con `pg_isready -h localhost -p 5432` que responde al instante.
3. Cambiar `DATABASE_URL` de vuelta a `localhost:5432`.

### `nest start --watch` no generaba `dist/main.js`
`nest-cli.json` tenía `"deleteOutDir": true`, lo que combinado con la compilación incremental de TypeScript (`tsconfig.json` con `"incremental": true`) producía un `.tsbuildinfo` desincronizado: TypeScript creía que los archivos de salida ya existían (según el caché) y omitía la escritura real, dejando `dist/` vacío o inexistente. Se cambió a `"deleteOutDir": false` para evitar el borrado que disparaba el bug. Si vuelve a pasar:

```bash
cd jf3-nest
rm -f tsconfig.build.tsbuildinfo
rm -rf dist
npx nest build
```

### Puerto del backend
El `.env` local tiene `PORT=3005` (no 3000), para no chocar con el frontend. Si se cambia, actualizar también `NEXT_PUBLIC_API_URL` en `frontend/.env.local` y `CORS_ORIGINS` en `jf3-nest/.env`.
