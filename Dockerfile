FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY dist ./dist
COPY tests ./tests  # Копируем тесты
COPY .env.prod .   # Используем production-конфиг

EXPOSE 5000
CMD ["npm", "run", "start:prod"]