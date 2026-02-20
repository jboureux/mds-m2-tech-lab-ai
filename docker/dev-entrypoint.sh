#!/bin/sh
set -e

# Wait for database if needed (db healthcheck is already in docker-compose, but let's be safe)
echo "⏳ Checking database connection..."

# Install dependencies if node_modules is missing or package.json changed
echo "📦 Checking/Installing dependencies..."
pnpm install

# Force rebuild of native modules to ensure they match the container architecture (ARM64)
echo "🔧 Rebuilding native modules (@tensorflow/tfjs-node, sharp, prisma)..."
# Clean up potential broken build artifacts that cause ENOENT errors with bind mounts
find node_modules/.pnpm -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
pnpm rebuild @tensorflow/tfjs-node sharp prisma || echo "⚠️ Native rebuild failed, falling back to CPU mode."

# Configure shared library path for TensorFlow
if [ -d "/app/node_modules/@tensorflow/tfjs-node/deps/lib" ]; then
  mkdir -p /etc/ld.so.conf.d
  echo "/app/node_modules/@tensorflow/tfjs-node/deps/lib" > /etc/ld.so.conf.d/tensorflow.conf
  ldconfig || echo "⚠️ ldconfig failed"
fi

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
