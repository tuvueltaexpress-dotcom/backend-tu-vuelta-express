FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# prisma generate necesita validar el schema, que requiere DATABASE_URL.
# En build-time Railway no inyecta vars, así que usamos un placeholder.
# En runtime Railway sobreescribe esta variable con el valor real.
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
