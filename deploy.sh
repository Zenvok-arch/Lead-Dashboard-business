#!/bin/bash
# Run this script ON YOUR SERVER after git pull to rebuild and restart everything.
# Usage: bash deploy.sh

set -e

echo "==> Pulling latest code..."
git pull

echo "==> Installing backend dependencies..."
cd backend && npm install && cd ..

echo "==> Installing & building frontend..."
cd frontend && npm install && npm run build && cd ..

echo "==> Restarting backend..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
else
    echo "PM2 not found. Please restart your backend manually (e.g. 'node backend/server.js')."
fi

echo ""
echo "✅ Deploy complete!"
