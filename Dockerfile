# Используем официальный Node.js образ
FROM node:20.17-alpine

# Установка рабочей директории
WORKDIR /app

# Копируем package.json и lock-файлы
COPY package*.json ./

# Копируем prisma схему до установки зависимостей
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma клиент
RUN npm run postinstall

# Копируем исходный код (после зависимостей для кеширования)
COPY . .

# Собираем проект
RUN npm run build

# Указываем порт
EXPOSE 5000

# Запуск
CMD ["node", "dist/server.js"]
