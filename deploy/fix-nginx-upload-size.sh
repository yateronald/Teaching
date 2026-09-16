#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# fix-nginx-upload-size.sh
#
# Patches the live nginx config on the API host to allow large multipart
# uploads. Run this on the VPS when bulk-import is failing with 413
# (Request Entity Too Large) before the request reaches Express.
#
# Usage:
#   sudo bash deploy/fix-nginx-upload-size.sh                    # uses default domain
#   sudo bash deploy/fix-nginx-upload-size.sh api.example.com    # custom domain
#
# This is a temporary fix. The permanent fix is built into
# deploy/backend.sh — `sudo bash deploy/backend.sh nginx` will re-render
# the full site config from the script.
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${1:-api.learnfrenchwithnatives.com}"
SITE_FILE="/etc/nginx/sites-available/${DOMAIN}"

if [ ! -f "$SITE_FILE" ]; then
    echo "❌ nginx site file not found: $SITE_FILE"
    echo "   List available sites:"
    ls -1 /etc/nginx/sites-available/ || true
    exit 1
fi

if [ "$EUID" -ne 0 ]; then
    echo "❌ Must run as root (sudo)."
    exit 1
fi

echo "→ Patching $SITE_FILE"
cp "$SITE_FILE" "${SITE_FILE}.bak.$(date +%Y%m%d-%H%M%S)"

# Replace any existing client_max_body_size directive with 2G; if missing,
# inject one inside the first server { } block.
if grep -q "client_max_body_size" "$SITE_FILE"; then
    sed -i -E 's/client_max_body_size[[:space:]]+[^;]+;/client_max_body_size 2G;/g' "$SITE_FILE"
else
    sed -i '0,/server_name/{/server_name/a\    client_max_body_size 2G;
}' "$SITE_FILE"
fi

# Replace any existing client_body_timeout, or add one
if grep -q "client_body_timeout" "$SITE_FILE"; then
    sed -i -E 's/client_body_timeout[[:space:]]+[^;]+;/client_body_timeout 600s;/g' "$SITE_FILE"
else
    sed -i '0,/client_max_body_size/{/client_max_body_size/a\    client_body_timeout 600s;
}' "$SITE_FILE"
fi

# Bump proxy_read_timeout/proxy_send_timeout to 600s if smaller
sed -i -E 's/proxy_read_timeout[[:space:]]+[0-9]+s?;/proxy_read_timeout 600s;/g' "$SITE_FILE"
sed -i -E 's/proxy_send_timeout[[:space:]]+[0-9]+s?;/proxy_send_timeout 600s;/g' "$SITE_FILE"

echo "→ Validating nginx config…"
nginx -t

echo "→ Reloading nginx…"
systemctl reload nginx

echo "✅ Done. New limits:"
grep -E "client_max_body_size|client_body_timeout|proxy_read_timeout|proxy_send_timeout" "$SITE_FILE" | sort -u
