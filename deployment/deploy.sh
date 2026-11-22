#!/usr/bin/env bash
# ==============================================================================
# BeesHub Farmland - Zero-Downtime Blue-Green Deployment Orchestrator
# Executes isolated builds, pre-flight health checks & zero-downtime Nginx switches
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${BEESHUB_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Standard Directories
RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
CURRENT_SYMLINK="$BASE_DIR/current"
STATIC_CACHE_DIR="$SHARED_DIR/static_cache"
DEPLOYMENT_DIR="$BASE_DIR/deployment"
UPSTREAM_CONF="$DEPLOYMENT_DIR/nginx/upstream.conf"
STATE_FILE="$DEPLOYMENT_DIR/.deploy_state"
LOGS_DIR="$SHARED_DIR/logs"

# Ensure all essential directories exist
mkdir -p "$RELEASES_DIR" "$SHARED_DIR" "$STATIC_CACHE_DIR" "$LOGS_DIR" "$SHARED_DIR/uploads"

echo "======================================================================"
echo "🚀 BeesHub Farmland: Starting Zero-Downtime Deployment"
echo "   Base Directory: $BASE_DIR"
echo "   Timestamp:      $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================================================"

# ------------------------------------------------------------------------------
# STEP 1: Determine Current Active Worker and Idle Target (Blue / Green)
# ------------------------------------------------------------------------------
ACTIVE_COLOR="blue"
ACTIVE_PORT="3001"
TARGET_COLOR="green"
TARGET_PORT="3002"

if [ -f "$STATE_FILE" ]; then
    # Load previous state
    # shellcheck source=/dev/null
    source "$STATE_FILE"
    if [ "${ACTIVE_COLOR:-blue}" = "green" ]; then
        ACTIVE_COLOR="green"
        ACTIVE_PORT="3002"
        TARGET_COLOR="blue"
        TARGET_PORT="3001"
    fi
fi

echo "📍 Current Active State: beeshub-$ACTIVE_COLOR (Port $ACTIVE_PORT)"
echo "🎯 Deployment Target:    beeshub-$TARGET_COLOR (Port $TARGET_PORT)"

# ------------------------------------------------------------------------------
# STEP 2: Create Isolated Release Directory
# ------------------------------------------------------------------------------
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_ID="release-$TIMESTAMP"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"

echo "📂 Creating new release workspace: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# ------------------------------------------------------------------------------
# STEP 3: Fetch Clean Source Code into Release Directory
# ------------------------------------------------------------------------------
echo "📥 Checking out latest source code from main branch..."
if [ -d "$BASE_DIR/.git" ]; then
    # Clone from local repo reference to save bandwidth and ensure exact clean tree
    git clone --depth 1 -b main "file://$BASE_DIR" "$RELEASE_DIR" || {
        # Fallback to direct git fetch/archive if local clone fails
        git --work-tree="$RELEASE_DIR" --git-dir="$BASE_DIR/.git" checkout -f main
    }
else
    # Remote clone if running outside repository root
    git clone --depth 1 -b main "https://github.com/kishoresharmaks/beeshubfarmland.git" "$RELEASE_DIR"
fi

cd "$RELEASE_DIR"

# ------------------------------------------------------------------------------
# STEP 4: Link Persistent Environment & Uploads
# ------------------------------------------------------------------------------
echo "🔗 Linking persistent environment and shared data..."
if [ -f "$SHARED_DIR/.env.production" ]; then
    ln -sfn "$SHARED_DIR/.env.production" "$RELEASE_DIR/.env.local"
elif [ -f "$BASE_DIR/.env.local" ]; then
    # First-time bootstrap: migrate existing .env.local to shared directory
    cp "$BASE_DIR/.env.local" "$SHARED_DIR/.env.production"
    chmod 600 "$SHARED_DIR/.env.production"
    ln -sfn "$SHARED_DIR/.env.production" "$RELEASE_DIR/.env.local"
else
    echo "⚠️ Warning: No .env.production found in $SHARED_DIR. Using release .env if available."
fi

# Ensure persistent uploads folder is symlinked into public
mkdir -p "$RELEASE_DIR/public"
ln -sfn "$SHARED_DIR/uploads" "$RELEASE_DIR/public/uploads"

# ------------------------------------------------------------------------------
# STEP 5: Install Dependencies (Isolated)
# ------------------------------------------------------------------------------
echo "📦 Installing dependencies (isolated in release directory)..."
npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund

# ------------------------------------------------------------------------------
# STEP 6: Compile Next.js Application
# ------------------------------------------------------------------------------
echo "🔨 Compiling Next.js standalone production build..."
npm run build

# Verify build artifact
if [ ! -f "$RELEASE_DIR/.next/standalone/server.js" ]; then
    echo "❌ CRITICAL: Standalone server.js not found in .next/standalone! Build failed."
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Ensure public and static assets are fully synced to standalone bundle
mkdir -p "$RELEASE_DIR/.next/standalone/public"
mkdir -p "$RELEASE_DIR/.next/standalone/.next/static"
cp -r "$RELEASE_DIR/public/"* "$RELEASE_DIR/.next/standalone/public/" 2>/dev/null || true
cp -r "$RELEASE_DIR/.next/static/"* "$RELEASE_DIR/.next/standalone/.next/static/" 2>/dev/null || true

# ------------------------------------------------------------------------------
# STEP 7: Cumulative Static Asset Retention (Eliminates Chunk 404s)
# ------------------------------------------------------------------------------
echo "🛡️ Syncing static chunks to cumulative cache (retaining previous chunks)..."
mkdir -p "$STATIC_CACHE_DIR/_next/static"
# Copy without deleting existing chunks so older browser tabs never fail
cp -rn "$RELEASE_DIR/.next/static/"* "$STATIC_CACHE_DIR/_next/static/" 2>/dev/null || true

# ------------------------------------------------------------------------------
# STEP 8: Start Target Release on Idle Port via PM2
# ------------------------------------------------------------------------------
echo "🚀 Starting target release on Port $TARGET_PORT (beeshub-$TARGET_COLOR)..."
PORT="$TARGET_PORT" pm2 start server.js \
    --name "beeshub-$TARGET_COLOR" \
    --cwd "$RELEASE_DIR/.next/standalone" \
    --output "$LOGS_DIR/${TARGET_COLOR}-out.log" \
    --error "$LOGS_DIR/${TARGET_COLOR}-error.log" \
    --update-env || {
    echo "⚠️ Worker already exists in PM2, restarting with updated release path..."
    PORT="$TARGET_PORT" pm2 restart "beeshub-$TARGET_COLOR" --update-env
}

# ------------------------------------------------------------------------------
# STEP 9: Pre-Flight Health Check
# ------------------------------------------------------------------------------
echo "🩺 Verifying application health on Port $TARGET_PORT..."
if ! bash "$DEPLOYMENT_DIR/health-check.sh" "$TARGET_PORT" 20 1; then
    echo "❌ HEALTH CHECK FAILED! Aborting deployment."
    echo "   Stopping unhealthy worker: beeshub-$TARGET_COLOR"
    pm2 stop "beeshub-$TARGET_COLOR" || true
    echo "   Removing failed release workspace: $RELEASE_DIR"
    rm -rf "$RELEASE_DIR"
    echo "🔒 The active worker (beeshub-$ACTIVE_COLOR on Port $ACTIVE_PORT) was NOT touched."
    echo "   No user traffic was affected. Deployment safely aborted."
    exit 1
fi

# ------------------------------------------------------------------------------
# STEP 10: Atomic Upstream Switch in Nginx
# ------------------------------------------------------------------------------
echo "🔄 Switching production traffic to Port $TARGET_PORT (beeshub-$TARGET_COLOR)..."

# Write atomic upstream configuration
cat <<EOF > "$UPSTREAM_CONF"
# Managed by deployment/deploy.sh on $(date '+%Y-%m-%d %H:%M:%S')
upstream beeshub_backend {
    server 127.0.0.1:${TARGET_PORT} max_fails=3 fail_timeout=10s;
    keepalive 32;
}
EOF

# Test Nginx syntax before reload
if command -v nginx >/dev/null 2>&1; then
    echo "   Testing Nginx configuration syntax..."
    nginx -t
    echo "   Reloading Nginx gracefully (zero dropped connections)..."
    nginx -s reload || systemctl reload nginx
else
    echo "ℹ️ Note: Nginx CLI not directly present in path (or running in container/LiteSpeed). Upstream file updated."
fi

# ------------------------------------------------------------------------------
# STEP 11: Update Active Release Symlink & Record State
# ------------------------------------------------------------------------------
echo "🔗 Updating current release symlink -> $RELEASE_DIR"
ln -sfn "$RELEASE_DIR" "$CURRENT_SYMLINK"

# Save persistent state for future deployments and instant rollback
cat <<EOF > "$STATE_FILE"
ACTIVE_COLOR="${TARGET_COLOR}"
ACTIVE_PORT="${TARGET_PORT}"
ACTIVE_RELEASE="${RELEASE_ID}"
PREVIOUS_COLOR="${ACTIVE_COLOR}"
PREVIOUS_PORT="${ACTIVE_PORT}"
PREVIOUS_RELEASE="${CURRENT_RELEASE:-none}"
DEPLOYED_AT="$(date '+%Y-%m-%d %H:%M:%S')"
EOF

# ------------------------------------------------------------------------------
# STEP 12: Graceful Drain of Old Worker
# ------------------------------------------------------------------------------
echo "⏳ Allowing 30-second graceful drain for in-flight requests on Port $ACTIVE_PORT..."
sleep 30

echo "🛑 Stopping retired worker: beeshub-$ACTIVE_COLOR"
pm2 stop "beeshub-$ACTIVE_COLOR" || true

# ------------------------------------------------------------------------------
# STEP 13: Retention Pruning (Keep Last 4 Releases)
# ------------------------------------------------------------------------------
echo "🧹 Pruning old releases (retaining last 4 releases)..."
cd "$RELEASES_DIR"
# List releases sorted by modification time, skip the newest 4, and remove older ones
# shellcheck disable=SC2012
ls -1dt release-* 2>/dev/null | tail -n +5 | while read -r old_release; do
    # Extra safety guard: never delete the currently active release
    if [ "$old_release" != "$RELEASE_ID" ] && [ -d "$old_release" ]; then
        echo "   Removing obsolete release: $old_release"
        rm -rf "$old_release"
    fi
done

echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "   Live Release: $RELEASE_ID on beeshub-$TARGET_COLOR (Port $TARGET_PORT)"
echo "   Zero downtime, zero chunk 404s, persistent uploads preserved."
echo "======================================================================"
exit 0
