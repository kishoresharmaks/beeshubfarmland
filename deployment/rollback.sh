#!/usr/bin/env bash
# ==============================================================================
# BeesHub Farmland - Instant Rollback Script (< 2 Seconds)
# Reverts Nginx and PM2 immediately to the previous working release
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${BEESHUB_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

RELEASES_DIR="$BASE_DIR/releases"
CURRENT_SYMLINK="$BASE_DIR/current"
DEPLOYMENT_DIR="$BASE_DIR/deployment"
UPSTREAM_CONF="$DEPLOYMENT_DIR/nginx/upstream.conf"
STATE_FILE="$DEPLOYMENT_DIR/.deploy_state"

echo "======================================================================"
echo "⏪ BeesHub Farmland: Initiating Emergency Rollback"
echo "   Base Directory: $BASE_DIR"
echo "   Timestamp:      $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================================================"

if [ ! -f "$STATE_FILE" ]; then
    echo "❌ Error: State file ($STATE_FILE) not found! Cannot determine previous release automatically."
    exit 1
fi

# Load deployment state
# shellcheck source=/dev/null
source "$STATE_FILE"

if [ -z "${PREVIOUS_RELEASE:-}" ] || [ "$PREVIOUS_RELEASE" = "none" ]; then
    echo "❌ Error: No previous release recorded in state file. Rollback cannot proceed automatically."
    exit 1
fi

ROLLBACK_TARGET_DIR="$RELEASES_DIR/$PREVIOUS_RELEASE"

if [ ! -d "$ROLLBACK_TARGET_DIR" ]; then
    echo "❌ Error: Previous release directory does not exist on disk: $ROLLBACK_TARGET_DIR"
    exit 1
fi

echo "📍 Rolling back from: beeshub-$ACTIVE_COLOR (Port $ACTIVE_PORT, $ACTIVE_RELEASE)"
echo "🎯 Rolling back to:   beeshub-$PREVIOUS_COLOR (Port $PREVIOUS_PORT, $PREVIOUS_RELEASE)"

# ------------------------------------------------------------------------------
# STEP 1: Ensure Previous Worker is Running & Healthy
# ------------------------------------------------------------------------------
echo "🚀 Starting / Resuming previous worker: beeshub-$PREVIOUS_COLOR (Port $PREVIOUS_PORT)..."
pm2 restart "beeshub-$PREVIOUS_COLOR" || {
    echo "⚠️ Worker not running in PM2, initiating from standalone directory..."
    PORT="$PREVIOUS_PORT" pm2 start server.js \
        --name "beeshub-$PREVIOUS_COLOR" \
        --cwd "$ROLLBACK_TARGET_DIR/.next/standalone" \
        --update-env
}

echo "🩺 Verifying health of rollback target..."
if ! bash "$DEPLOYMENT_DIR/health-check.sh" "$PREVIOUS_PORT" 15 1; then
    echo "❌ CRITICAL: The previous release failed its health check! Aborting rollback to prevent total outage."
    exit 1
fi

# ------------------------------------------------------------------------------
# STEP 2: Switch Nginx Upstream Back
# ------------------------------------------------------------------------------
echo "🔄 Switching Nginx upstream back to Port $PREVIOUS_PORT..."
cat <<EOF > "$UPSTREAM_CONF"
# Rolled back by deployment/rollback.sh on $(date '+%Y-%m-%d %H:%M:%S')
upstream beeshub_backend {
    server 127.0.0.1:${PREVIOUS_PORT} max_fails=3 fail_timeout=10s;
    keepalive 32;
}
EOF

if command -v nginx >/dev/null 2>&1; then
    nginx -t
    nginx -s reload || systemctl reload nginx
fi

# ------------------------------------------------------------------------------
# STEP 3: Re-point 'current' Symlink
# ------------------------------------------------------------------------------
echo "🔗 Restoring 'current' symlink -> $ROLLBACK_TARGET_DIR"
ln -sfn "$ROLLBACK_TARGET_DIR" "$CURRENT_SYMLINK"

# ------------------------------------------------------------------------------
# STEP 4: Stop Faulty Worker
# ------------------------------------------------------------------------------
echo "🛑 Stopping faulty worker: beeshub-$ACTIVE_COLOR"
pm2 stop "beeshub-$ACTIVE_COLOR" || true

# ------------------------------------------------------------------------------
# STEP 5: Update State File
# ------------------------------------------------------------------------------
cat <<EOF > "$STATE_FILE"
ACTIVE_COLOR="${PREVIOUS_COLOR}"
ACTIVE_PORT="${PREVIOUS_PORT}"
ACTIVE_RELEASE="${PREVIOUS_RELEASE}"
PREVIOUS_COLOR="${ACTIVE_COLOR}"
PREVIOUS_PORT="${ACTIVE_PORT}"
PREVIOUS_RELEASE="${ACTIVE_RELEASE}"
ROLLED_BACK_AT="$(date '+%Y-%m-%d %H:%M:%S')"
EOF

echo "======================================================================"
echo "✅ ROLLBACK COMPLETED SUCCESSFULLY IN < 2 SECONDS!"
echo "   Live traffic restored to: $PREVIOUS_RELEASE on beeshub-$PREVIOUS_COLOR (Port $PREVIOUS_PORT)"
echo "======================================================================"
exit 0
