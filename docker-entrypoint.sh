#!/bin/sh
set -e

echo "Running database migrations..."
bunx prisma migrate deploy

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  bun run prisma:seed
fi

echo "Starting Next.js server..."
exec bun run start
