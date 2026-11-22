#!/usr/bin/env bash
# ==============================================================================
# BeesHub Farmland - Production Server One-Time Bootstrap Script
# Initializes the directory tree, sets permissions, and creates initial symlinks
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${BEESHUB_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

echo "======================================================================"
echo "🛠️ BeesHub Farmland: Setting Up Zero-Downtime Deployment Structure"
echo "   Base Directory: $BASE_DIR"
echo "======================================================================"

# 1. Create standard directories
echo "📁 Creating release and shared directories..."
mkdir -p "$BASE_DIR/releases"
mkdir -p "$BASE_DIR/shared/static_cache/_next/static"
mkdir -p "$BASE_DIR/shared/uploads"
mkdir -p "$BASE_DIR/shared/logs"
mkdir -p "$BASE_DIR/deployment/nginx"

# 2. Migrate existing .env if present
if [ ! -f "$BASE_DIR/shared/.env.production" ]; then
    if [ -f "$BASE_DIR/.env.local" ]; then
        echo "🔐 Migrating existing .env.local to shared/.env.production..."
        cp "$BASE_DIR/.env.local" "$BASE_DIR/shared/.env.production"
        chmod 600 "$BASE_DIR/shared/.env.production"
    elif [ -f "$BASE_DIR/.env" ]; then
        echo "🔐 Migrating existing .env to shared/.env.production..."
        cp "$BASE_DIR/.env" "$BASE_DIR/shared/.env.production"
        chmod 600 "$BASE_DIR/shared/.env.production"
    else
        echo "⚠️ Warning: Please create $BASE_DIR/shared/.env.production with production environment variables."
        touch "$BASE_DIR/shared/.env.production"
        chmod 600 "$BASE_DIR/shared/.env.production"
    fi
else
    echo "✅ shared/.env.production already exists."
fi

# 3. Create initial upstream configuration if missing
if [ ! -f "$BASE_DIR/deployment/nginx/upstream.conf" ]; then
    echo "🌐 Initializing default Nginx upstream configuration..."
    cat <<EOF > "$BASE_DIR/deployment/nginx/upstream.conf"
upstream beeshub_backend {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
    keepalive 32;
}
EOF
fi

# 4. Create initial state file
if [ ! -f "$BASE_DIR/deployment/.deploy_state" ]; then
    echo "📝 Initializing deployment state file..."
    cat <<EOF > "$BASE_DIR/deployment/.deploy_state"
ACTIVE_COLOR="blue"
ACTIVE_PORT="3001"
ACTIVE_RELEASE="bootstrap"
PREVIOUS_COLOR="green"
PREVIOUS_PORT="3002"
PREVIOUS_RELEASE="none"
DEPLOYED_AT="$(date '+%Y-%m-%d %H:%M:%S')"
EOF
fi

# 5. Set executable permissions on scripts
chmod +x "$BASE_DIR/deployment/deploy.sh" || true
chmod +x "$BASE_DIR/deployment/rollback.sh" || true
chmod +x "$BASE_DIR/deployment/health-check.sh" || true
chmod +x "$BASE_DIR/deploy.sh" || true

echo "======================================================================"
echo "✅ Server setup complete!"
echo "   Next steps:"
echo "   1. Link Nginx vhost: sudo ln -s $BASE_DIR/deployment/nginx/beeshub.conf /etc/nginx/sites-enabled/"
echo "   2. Test Nginx:       sudo nginx -t"
echo "   3. Reload Nginx:     sudo nginx -s reload"
echo "   4. Run deployment:   ./deploy.sh"
echo "======================================================================"
