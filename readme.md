# 🧠 BlogPsy API

> Бэкенд для блог-платформы с поддержкой пользователей, постов, комментариев, медиа-хранилища, асинхронной обработки задач и полной инфраструктурой.

BlogPsy API — это Node.js приложение, реализованное с использованием Express, Prisma ORM и Docker.  
Платформа полностью готова к production: реализован CI/CD, HTTPS, мониторинг, бэкапы и автоматический деплой.

---

## 🚀 Основные возможности 

- Регистрация и авторизация через **email-сессии**
- Верификация email
- Посты: создание, редактирование, удаление, поиск (FTS), лайки, просмотры
- Комментарии: добавление, модерация
- Топовые посты (рейтинг)
- Загрузка и обработка аватарок (через MinIO + Sharp)
- Асинхронная обработка задач (BullMQ): уведомления, обработка изображений
- Кеширование данных (Redis): счётчики, сессии
- Логирование запросов и медленных операций
- Метрики производительности (Prometheus)
- Визуализация метрик (Grafana)
- Полностью документированное API (Swagger UI)

---

## 🧩 Архитектура

| Стек              | Инструменты                                                   |
|------------------|----------------------------------------------------------------|
| Backend          | Node.js, Express, TypeScript                                   |
| ORM              | Prisma ORM                                                     |
| База данных      | PostgreSQL (с поддержкой Full Text Search)                     |
| Кэширование      | Redis (сессии, лайки, просмотры)                               |
| Хранилище файлов | MinIO (S3-совместимое)                                         |
| Контейнеризация  | Docker, Docker Compose                                         |
| Мониторинг       | Prometheus + Grafana                                           |
| CI/CD            | GitHub Actions                                        |
| Деплой           | VPS, Nginx, Let’s Encrypt                                      |

---

## 🗂 Структура проекта
src/
├── core/ ← Бизнес-логика (пользователи, посты, комментарии)
├── modules/ ← REST контроллеры и маршруты
├── services/ ← Вспомогательные сервисы (Redis, Email, Storage)
├── middleware/ ← Middleware для Express
├── docs/ ← Swagger документация
├── db.ts ← Настройка Prisma
└── app.ts ← Главный сервер


### Разделение слоёв:
- **Routes**: `src/modules/*`
- **Controllers**: `src/modules/*/controller.ts`
- **Services**: `src/core/*`
- **Models**: `prisma/schema.prisma` + `@prisma/client`

---

## 🔐 Авторизация

- Реализована через **session-based auth**
- Подтверждение email после регистрации
- JWT используется для токенов верификации
- Все эндпоинты требуют авторизации (кроме публичных)
- Проверка занятости email при регистрации

---

## 🌐 API Документация

Доступна по адресу:

🔗 [Swagger UI](https://api.blogpsy.ru/api-docs) 

---

## 📊 Мониторинг

- **Prisma Studio** (dev/prod): [http://5.129.200.126:5555](http://5.129.200.126:5555)
- **Swagger UI**: [https://api.blogpsy.ru/api-docs](https://api.blogpsy.ru/api-docs) 
- **Grafana**: [https://grafana.blogpsy.ru/dashboards](https://grafana.blogpsy.ru/dashboards) 
- **Prometheus**: [https://api.blogpsy.ru/prometheus/targets](https://api.blogpsy.ru/prometheus/targets) 

---

## 🚀 Как запустить локально

```bash
# Установите зависимости
npm install

# Поднимите БД и Redis
docker-compose -f docker-compose.dev.yml up -d

# Примените миграции
npx prisma migrate dev

# Запустите приложение
npm run dev

📁 Директория на VPS
/var/www/api.blogpsy.ru/
├── .env.prod
├── docker-compose.db.yml
├── docker-compose.app.yml
├── docker-compose.monitoring.yml
├── nginx/conf.d/blog.conf
└── deploy.sh

🧹 Резервное копирование
Ежедневные бэкапы PostgreSQL
Хранение бэкапов в MinIO
Восстановление через скрипт
📦 CI/CD Pipeline
Push в репозиторий → GitHub Actions
Автоматическая сборка Docker-образа
Отправка в Docker Hub
Деплой на VPS через Ansible
Перезапуск контейнеров

✅ TODO
Добавить оплату (Stripe)
Реализовать публикацию через Webhooks
Поддержка Markdown в постах
Фронтенд на React/Vercel
Генерация frontend-клиента через Orval
📞 Контакты
Telegram: @
Email: an.pochta@gmail.com