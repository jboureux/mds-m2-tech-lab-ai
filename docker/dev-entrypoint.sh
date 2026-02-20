#!/bin/sh
set -e

# Wait for database if needed
echo "⏳ Checking database connection..."

# Install dependencies
echo "📦 Checking/Installing dependencies..."
pnpm install

# Force rebuild of native modules to ensure they match ARM64 architecture
# We use npm rebuild as it's more direct for native modules
echo "🔧 Rebuilding native modules (@tensorflow/tfjs-node, sharp, prisma)..."
find node_modules/.pnpm -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
npm rebuild @tensorflow/tfjs-node sharp prisma --build-from-source || echo "⚠️ Native rebuild failed, will try to continue..."

# Configure shared library path for TensorFlow
# This is CRITICAL for the .node file to find its .so dependencies
export TF_LIB_DIR="/app/node_modules/@tensorflow/tfjs-node/deps/lib"
if [ -d "$TF_LIB_DIR" ]; then
  echo "💉 Configuring LD_LIBRARY_PATH for TensorFlow..."
  export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:$TF_LIB_DIR"
  # Also try system-wide registration as fallback
  mkdir -p /etc/ld.so.conf.d
  echo "$TF_LIB_DIR" > /etc/ld.so.conf.d/tensorflow.conf
  ldconfig || true
fi

# Generate Prisma Client
echo "🏗️ Generating Prisma client..."
pnpm --filter web exec prisma generate

# Execute migrations
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
