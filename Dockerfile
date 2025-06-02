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

# Убедись, что prisma установлен глобально
RUN npm install -g prisma

RUN npm ci --only=production

EXPOSE 5000
CMD ["node", "dist/server.js"]