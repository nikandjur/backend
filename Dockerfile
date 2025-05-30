FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY prisma ./prisma 
RUN npx prisma generate 
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.prod ./

# Убедись, что prisma установлен глобально
RUN npm install -g prisma

# Копируем скрипт ожидания
COPY scripts/wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

RUN npm ci --only=production

EXPOSE 5000
CMD ["node", "dist/server.js"]