#!/usr/bin/env bash
# ==============================================================================
# BeesHub Farmland - Zero-Downtime Deployment Health Check
# Usage: ./health-check.sh <PORT> [MAX_ATTEMPTS] [DELAY_SECONDS]
# ==============================================================================

set -eo pipefail

PORT="${1:-3001}"
MAX_ATTEMPTS="${2:-20}"
DELAY="${3:-1}"

HEALTH_URL="http://127.0.0.1:${PORT}/api/health"
HOME_URL="http://127.0.0.1:${PORT}/"

echo "🔍 Initiating pre-flight health check on Port ${PORT}..."
echo "   Endpoint: ${HEALTH_URL}"
echo "   Max Attempts: ${MAX_ATTEMPTS} (Interval: ${DELAY}s)"

attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    echo -n "   [Attempt ${attempt}/${MAX_ATTEMPTS}] Checking health endpoint... "

    # 1. Test /api/health endpoint for 200 OK and JSON status
    HTTP_CODE=$(curl -s -o /tmp/health_check_response.json -w "%{http_code}" --max-time 3 "${HEALTH_URL}" || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        if grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' /tmp/health_check_response.json 2>/dev/null; then
            echo "PASSED (HTTP 200 OK)"
            
            # 2. Test main storefront route headers to ensure SSR / React doesn't throw 500
            echo -n "   Verifying storefront root route... "
            ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${HOME_URL}" || echo "000")
            
            if [ "$ROOT_CODE" = "200" ] || [ "$ROOT_CODE" = "307" ] || [ "$ROOT_CODE" = "308" ]; then
                echo "PASSED (HTTP ${ROOT_CODE})"
                echo "✅ Target worker on Port ${PORT} is fully healthy and ready for traffic."
                rm -f /tmp/health_check_response.json
                exit 0
            else
                echo "FAILED (Root returned HTTP ${ROOT_CODE})"
            fi
        else
            echo "FAILED (Unexpected payload)"
        fi
    else
        echo "FAILED (HTTP ${HTTP_CODE})"
    fi

    attempt=$((attempt + 1))
    sleep "$DELAY"
done

echo "❌ CRITICAL: Worker on Port ${PORT} failed health verification after ${MAX_ATTEMPTS} attempts."
rm -f /tmp/health_check_response.json
exit 1
