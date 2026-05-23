FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# La variable se pasa solo a este comando (no persiste al runtime)
RUN DATABASE_URL="postgresql://p:p@p:5432/p" npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
