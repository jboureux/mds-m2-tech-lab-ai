#!/bin/sh
set -e

# Wait for database if needed
echo "⏳ Checking database connection..."

# Install dependencies
echo "📦 Checking/Installing dependencies..."
pnpm install

# Generate Prisma Client
echo "🏗️ Generating Prisma client..."
pnpm --filter web exec prisma generate || echo "⚠️ Prisma generation failed."

# Execute migrations if the migrations folder exists, otherwise push the schema
if [ -d "apps/web/prisma/migrations" ]; then
  echo "🚀 Running Prisma migrations (deploy)..."
  pnpm --filter web exec prisma migrate deploy
else
  echo "🚀 Syncing database schema (db push)..."
  pnpm --filter web exec prisma db push
fi

# Start the application
echo "🏁 Starting development server..."
exec "$@"
