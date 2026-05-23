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

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
