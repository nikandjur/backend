#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t 2; do
  sleep 1
done

echo "⏳ Waiting for Redis..."
until redis-cli -h "$REDIS_HOST" ping; do
  sleep 1
done

echo "🚀 Applying database migrations..."
npx prisma migrate deploy

echo "💡 Starting application..."
exec node dist/server.js