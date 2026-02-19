#!/bin/sh
set -e

# Run Prisma migrations if the migrations folder exists
if [ -d "apps/web/prisma/migrations" ] && [ -f "apps/web/prisma/schema.prisma" ]; then
  echo "🚀 Running database migrations (deploy)..."
  # Use the globally installed prisma CLI (from the runner stage)
  prisma migrate deploy --schema=apps/web/prisma/schema.prisma
else
  echo "⚠️ No migrations directory or schema found at apps/web/prisma. skipping migrations."
fi

# Execute the CMD (usually node apps/web/server.js)
echo "🏁 Starting production server..."
exec "$@"
