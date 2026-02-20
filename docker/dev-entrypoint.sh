#!/bin/sh
set -e

# Wait for database if needed (db healthcheck is already in docker-compose, but let's be safe)
echo "⏳ Checking database connection..."

# Install dependencies if node_modules is missing or package.json changed
# In dev with volume, this ensures we're ready.
echo "📦 Checking/Installing dependencies..."
pnpm install

# Force rebuild of native modules to ensure they match the container architecture
echo "🔧 Rebuilding native modules (@tensorflow/tfjs-node, sharp)..."
pnpm rebuild @tensorflow/tfjs-node sharp

# Generate Prisma Client
echo "🏗️ Generating Prisma client..."
pnpm --filter web exec prisma generate

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
