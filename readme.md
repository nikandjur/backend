  depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: always
Для postgres ты правильно добавил условие service_healthy, что гарантирует, что сервис будет ждать, пока PostgreSQL не станет доступен и готов к работе. Это полезно, чтобы не пытаться подключиться к базе данных, пока она не инициализировалась.

Для redis ты используешь условие service_started, что означает, что контейнер app будет ожидать, пока Redis начнет работать. Это подходящее решение, так как Redis не требует сложной инициализации.

healthcheck для этих сервисов помогает гарантировать, что они готовы к подключению, прежде чем контейнер app начнёт работу.

depends_on + healthcheck 

Важно: не забудь сделать его исполняемым:
chmod +x entrypoint.sh

Запуск проекта
Вариант 1: Полностью Docker
docker-compose -f docker-compose.dev.yml up


Вариант 2: Гибридный режим (рекомендуется)
# Запуск только БД и Redis в Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis
# Запуск бэкенда локально с hot-reload
npm run dev

Вариант 3: Product Полностью в Docker
# Сборка и запуск всех сервисов
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build


Работа с Docker
# Просмотр логов
docker-compose logs -f postgres

# Остановка всех сервисов
docker-compose down
# Остановка инфраструктуры
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Полный сброс (с удалением данных)
docker-compose down -v

Работа с БД
# Подключение к PostgreSQL
psql -h localhost -U postgres -d blogdb

# Применение миграций
npx prisma migrate dev

# Генерация клиента Prisma
npx prisma generate

npx prisma studio


Полная схема разработки
Запускаем только инфраструктуру в Docker:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis
Бэкенд запускаем локально с hot-reload:

npm run dev
Фронтенд (если есть) тоже локально:

cd ../frontend
npm run dev


Администрирование
# Пересоздание node_modules
rm -rf node_modules && npm install

# Production-сборка
Основные файлы окружения:

.env.dev - для разработки

.env.prod - для production

Порты по умолчанию:

Бэкенд: 5000

PostgreSQL: 5432

Redis: 6379

Решение проблем
Если порты заняты
# Проверка занятых портов
lsof -i :5432 # для PostgreSQL
lsof -i :6379 # для Redis

# Альтернативное решение - изменить порты в .env файлах
Если не подключается к БД
Проверьте правильность хоста в .env:

Для Docker: postgres:5432

Для локального: localhost:5432

Убедитесь что сервис запущен:

docker-compose ps
**********
# Выполните команду, чтобы получить список запущенных контейнеров:
docker ps
# Подключитесь к контейнеру
docker exec -it <container_name_or_id> redis-cli
docker exec -it backend-redis-1 redis-cli
# или через
docker-compose exec redis redis-cli

# Просмотр всех сессий
KEYS *sessions*
# Просмотр данных конкретной сессии :
GET sessions:648f1cc8-c5e1-4d8e-b5dd-6efc1afee029

