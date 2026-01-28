#!/bin/bash
set -e

echo "🔨 Building TreinaManager for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build frontend
echo "🎨 Building frontend..."
pnpm run build

# Run database migrations (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  pnpm db:push || echo "⚠️  Database migrations skipped (database not ready yet)"
else
  echo "⚠️  DATABASE_URL not set, skipping migrations"
fi

echo "✅ Build complete!"
