#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 1
done

echo "⏳ Waiting for Redis..."
until redis-cli -h "$REDIS_HOST" ping | grep PONG; do
  sleep 1
done

echo "🚀 Running prisma migrations..."
npx prisma migrate deploy

echo "💡 Starting app..."
exec node dist/server.js
