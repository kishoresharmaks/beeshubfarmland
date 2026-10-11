#!/usr/bin/env bash
set -e

echo "🚀 Starting deployment..."

# Ensure filemode doesn't cause git issues
git config core.fileMode false

# Fetch and reset cleanly to latest main branch
echo "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build Next.js (postbuild automatically copies static and public folders)
echo "🔨 Building project..."
npm run build

# Restart PM2
echo "🔄 Reloading PM2 process..."
pm2 reload beeshub-web || pm2 restart beeshub-web

echo "✅ Deployment completed successfully!"
