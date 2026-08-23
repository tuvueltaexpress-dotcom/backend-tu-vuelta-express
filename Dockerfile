FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generar el cliente Prisma ANTES del build (TypeScript necesita los tipos generados)
RUN DATABASE_URL="postgresql://p:p@p:5432/p" npx prisma generate

# Compilar TypeScript con los tipos de Prisma ya disponibles
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

# Una sola definición del arranque, en package.json, para que el Dockerfile y
# el `start:migrate` que usa el panel de despliegue no se desincronicen.
# Incluye el seed del admin: es idempotente, así que en cada redeploy no hace
# nada, pero evita que un entorno recién creado quede sin administrador.
CMD ["npm", "run", "start:migrate"]
