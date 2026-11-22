#!/usr/bin/env bash
# ==============================================================================
# BeesHub Farmland - Zero-Downtime Deployment Entry Point
# Delegates to deployment/deploy.sh (Release-Based Blue-Green Architecture)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/deployment/deploy.sh" ]; then
    chmod +x "$SCRIPT_DIR/deployment/deploy.sh" || true
    exec "$SCRIPT_DIR/deployment/deploy.sh" "$@"
else
    echo "❌ Error: deployment/deploy.sh not found in $SCRIPT_DIR/deployment/"
    exit 1
fi
