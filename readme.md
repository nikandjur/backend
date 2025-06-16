docker exec -it postgres-dev psql -U postgres -d blogdb


docker inspect postgres-dev | grep -A 10 Mounts

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
docker-compose -f docker-compose.dev.yml down

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



Администрирование
# Пересоздание node_modules
rm -rf node_modules && npm install

# Production-сборка

Решение проблем
Если порты заняты
# Проверка занятых портов
lsof -i :5432 # для PostgreSQL
lsof -i :6379 # для Redis


docker-compose ps
**********
# Выполните команду, чтобы получить список запущенных контейнеров:
docker ps
# Подключитесь к контейнеру
docker exec -it <container_name_or_id> redis-cli
docker exec -it redis-dev redis-cli
# или через
docker-compose exec redis redis-cli

# Просмотр всех сессий
KEYS *sessions*
# Просмотр данных конкретной сессии :
GET sessions:648f1cc8-c5e1-4d8e-b5dd-6efc1afee029



docker stop redisinsight
docker rm redisinsight