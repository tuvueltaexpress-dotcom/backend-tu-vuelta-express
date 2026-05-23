FROM node:22-alpine
WORKDIR /app

# Dependencia necesaria para binarios nativos en Alpine (ej. @swc/core usado por nest-cli)
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

# Compilar TypeScript → dist/
RUN npm run build

# Falla el build si dist/main.js no se generó (hace visible el error en los logs de Railway)
RUN test -f dist/main.js || (echo "ERROR: dist/main.js no existe. Revisa los logs del build." && exit 1)

# prisma generate necesita DATABASE_URL para validar el schema.
# EN BUILD-TIME Railway no inyecta vars, usamos placeholder.
# EN RUNTIME Railway sobreescribe este valor con la URL real de la DB.
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
