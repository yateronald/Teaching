#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# serve-real-404.sh
#
# Until now every unknown address (/anything-random/) got the home page with
# a 200 "OK" status: Google reports those as "soft 404" and may index them as
# copies of the home page. After this script:
#
#   · files and pre-rendered pages (/, /fr/, /tcf-canada-preparation/…)  → as before
#   · app, company sign-in, public meeting, availability & account routes → index.html, 200
#   · anything else                                                       → 404.html, status 404
#
# It changes the site's `location /` from  try_files $uri $uri/ /index.html;
# to  try_files $uri $uri/ =404;  and adds, just before it, the managed block
# that keeps all SPA addresses working plus `error_page 404 /404.html;`.
#
# The frontend build that contains 404.html must be deployed first.
# The original file is backed up; if nginx rejects the change, or if any
# address does not answer as expected afterwards, it is restored and nginx
# reloaded. Safe to run again whenever new routes are added.
#
# Usage (on the host that serves the website):
#   sudo bash serve-real-404.sh
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${DOMAIN:-www.learnfrenchwithnatives.com}"
MARKER="# serve-real-404"
BEGIN_MARKER="# BEGIN serve-real-404"
END_MARKER="# END serve-real-404"
REV_MARKER="# serve-real-404-rev: 3"
NGINX_DIRS="${NGINX_DIRS:-/etc/nginx/sites-enabled /etc/nginx/conf.d}"
BACKUP_DIR="/root/nginx-backups/$(date +%Y%m%d-%H%M%S)"
# Top-level addresses of the signed-in app (frontend/src/App.tsx). Everything
# under /app is included; the others are older addresses that redirect into it.
APP_ROUTES='app|login|force-change-password|dashboard|teacher-dashboard|student-dashboard|profile|batches|my-quizzes|my-results|my-marksheet|my-resources|my-schedule|student-quizzes|student-resources|student-schedule|teacher-batches|quiz-management|resources|schedules'
TRY_RE='^[[:space:]]*try_files[[:space:]]+\$uri[[:space:]]+\$uri/[[:space:]]+/index\.html[[:space:]]*;'

if [ "$EUID" -ne 0 ]; then
    echo "❌ Must run as root (sudo)."
    exit 1
fi

# ── 1. The site file that serves the website ──
SITE=""
for dir in $NGINX_DIRS; do
    [ -d "$dir" ] || continue
    for f in "$dir"/*; do
        [ -f "$f" ] || continue
        grep -qE "server_name[^;]*[[:space:]]${DOMAIN//./\\.}([[:space:];]|$)" "$f" || continue
        if grep -qF "$MARKER" "$f" || grep -qE "$TRY_RE" "$f"; then
            SITE="$(readlink -f "$f")"
            break 2
        fi
    done
done
if [ -z "$SITE" ]; then
    echo "❌ No site for ${DOMAIN} with 'try_files \$uri \$uri/ /index.html;' was found."
    echo "   Nothing was changed. The try_files lines nginx has today:"
    grep -rnE "^[[:space:]]*try_files" $NGINX_DIRS 2>/dev/null || true
    exit 1
fi

MODE=""
LOC_LINE=0
START_LINE=0
END_LINE=0
TRY_LINE=0

if grep -qF "$BEGIN_MARKER" "$SITE" && grep -qF "$END_MARKER" "$SITE"; then
    # State D: previously written with BEGIN/END markers — replace cleanly.
    MODE="replace"
    START_LINE="$(grep -nF "$BEGIN_MARKER" "$SITE" | head -1 | cut -d: -f1)"
    END_LINE="$(grep -nF "$END_MARKER" "$SITE" | head -1 | cut -d: -f1)"
    if [ "$START_LINE" -ge "$END_LINE" ] || [ $((END_LINE - START_LINE)) -gt 60 ]; then
        echo "❌ Could not safely locate existing managed block bounds in $SITE ($START_LINE..$END_LINE)."
        exit 1
    fi
    INDENT="$(sed -n "${START_LINE}p" "$SITE" | sed -E 's/^([[:space:]]*).*/\1/')"
elif grep -qF "$MARKER" "$SITE"; then
    # State B/C: legacy block without BEGIN/END markers — upgrade in place.
    MODE="replace"
    START_LINE="$(grep -nE "^[[:space:]]*# serve-real-404(: company sign-in|: the signed-in app answers)" "$SITE" | head -1 | cut -d: -f1 || true)"
    if [[ ! "$START_LINE" =~ ^[0-9]+$ ]]; then
        echo "❌ Found '$MARKER' in $SITE but could not identify the start of the existing block."
        exit 1
    fi
    END_LINE="$(awk -v s="$START_LINE" 'NR >= s && /^[[:space:]]*error_page[[:space:]]+404[[:space:]]+\/404\.html;/ { print NR; exit }' "$SITE")"
    MAIN_LOC_LINE="$(awk -v s="$START_LINE" 'NR >= s && /^[[:space:]]*location[[:space:]]+\/[[:space:]]*\{/ { print NR; exit }' "$SITE")"
    if [[ ! "$END_LINE" =~ ^[0-9]+$ ]] || [ "$START_LINE" -ge "$END_LINE" ] || [ $((END_LINE - START_LINE)) -gt 35 ]; then
        echo "❌ Could not safely locate the end of the legacy block in $SITE ($START_LINE..${END_LINE:-missing})."
        exit 1
    fi
    if [[ "$MAIN_LOC_LINE" =~ ^[0-9]+$ ]] && [ "$END_LINE" -ge "$MAIN_LOC_LINE" ]; then
        echo "❌ Existing block extends past 'location / {' in $SITE; aborting to avoid corrupting config."
        exit 1
    fi
    INDENT="$(sed -n "${START_LINE}p" "$SITE" | sed -E 's/^([[:space:]]*).*/\1/')"
else
    # State A: fresh nginx site file.
    MODE="fresh"
    if [ "$(grep -cE "$TRY_RE" "$SITE")" -ne 1 ]; then
        echo "❌ Expected one 'try_files ... /index.html' line in $SITE."
        exit 1
    fi
    if grep -qE "^[[:space:]]*error_page[[:space:]]+([0-9 ]+ )?404" "$SITE"; then
        echo "❌ $SITE already defines a custom 404."
        exit 1
    fi
    TRY_LINE="$(grep -nE "$TRY_RE" "$SITE" | cut -d: -f1)"
    LOC_LINE="$(head -n "$TRY_LINE" "$SITE" | grep -nE '^[[:space:]]*location[[:space:]]+/[[:space:]]*\{' | tail -1 | cut -d: -f1 || true)"
    if [[ ! "$LOC_LINE" =~ ^[0-9]+$ ]]; then
        echo "❌ Could not identify 'location / {' in $SITE."
        exit 1
    fi
    INDENT="$(sed -n "${LOC_LINE}p" "$SITE" | sed -E 's/^([[:space:]]*).*/\1/')"
fi
echo "→ Site file: $SITE ($MODE)"

# ── 2. The 404 page must already be deployed ──
ROOT="$(grep -E '^[[:space:]]*root[[:space:]]' "$SITE" | head -1 | awk '{print $2}' | tr -d ';')"
if [ -z "$ROOT" ] || [ ! -f "$ROOT/404.html" ]; then
    echo "❌ ${ROOT:-the site root}/404.html does not exist. Deploy the new frontend build first."
    exit 1
fi

# ── 3. Build managed SPA allowlist block and write new config to temp file ──
BLOCK_FILE="$(mktemp)"
TMP_OUT="$(mktemp)"
trap 'rm -f "$BLOCK_FILE" "$TMP_OUT"' EXIT

while IFS= read -r line; do
    if [ -z "$line" ]; then
        printf '\n'
    else
        printf '%s%s\n' "$INDENT" "$line"
    fi
done > "$BLOCK_FILE" <<EOF
$BEGIN_MARKER
$REV_MARKER
# Managed by deploy/serve-real-404.sh; re-run the script to update.
# Company sign-in (/o/<slug>)
location ~* "^/o/[a-z0-9-]{1,80}/?\$" {
    try_files \$uri /index.html;
}
# Unlisted public meeting & single-use demo availability links
location ~ "^/(meeting(/[^/]+)?|demo-availability/[^/]+)/?\$" {
    try_files \$uri /index.html;
}
# Non-prerendered Learn account, progress, mission & final-assessment routes
location ~ "^/learn/(sign-in|sign-up|forgot-password|account|subscription|complete-account|my-progress)/?\$" {
    try_files \$uri \$uri/ /index.html;
}
location ~ "^/fr/apprendre/(connexion|inscription|mot-de-passe-oublie|compte|abonnement|finaliser-compte|ma-progression)/?\$" {
    try_files \$uri \$uri/ /index.html;
}
location ~ "^/(learn/practice/reading|fr/apprendre/pratique/lecture)/mission/[a-zA-Z0-9_-]+/?\$" {
    try_files \$uri \$uri/ /index.html;
}
location ~ "^/(learn|fr/apprendre)/[^/]+/[^/]+/(final-assessment|evaluation-finale)/?\$" {
    try_files \$uri \$uri/ /index.html;
}
# Signed-in app & legacy redirects
location ~ ^/($APP_ROUTES)(/|\$) {
    try_files \$uri /index.html;
}
error_page 404 /404.html;
$END_MARKER
EOF

if [ "$MODE" = "replace" ]; then
    awk -v s="$START_LINE" -v e="$END_LINE" -v block="$BLOCK_FILE" '
    NR == s { while ((getline b < block) > 0) print b; close(block); next }
    NR > s && NR <= e { next }
    { print }
    ' "$SITE" > "$TMP_OUT"
else
    awk -v loc="$LOC_LINE" -v try="$TRY_LINE" -v marker="$MARKER" -v block="$BLOCK_FILE" '
    NR == loc { while ((getline b < block) > 0) print b; close(block); print "" }
    NR == try { sub(/\/index\.html[[:space:]]*;/, "=404;  " marker) }
    { print }
    ' "$SITE" > "$TMP_OUT"
fi

if cmp -s "$SITE" "$TMP_OUT"; then
    echo "✅ Nginx routes in $SITE are already up to date ($REV_MARKER)."
    exit 0
fi

# ── 4. Back up, apply change, validate & reload nginx ──
mkdir -p "$BACKUP_DIR"
cp -p "$SITE" "$BACKUP_DIR/"
restore() {
    cp -p "$BACKUP_DIR/$(basename "$SITE")" "$SITE"
    nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
    echo "↩ Restored the original $SITE"
}

cat "$TMP_OUT" > "$SITE"

echo "→ Changes:"
diff -u "$BACKUP_DIR/$(basename "$SITE")" "$SITE" | sed -n '3,$p' || true

echo "→ Validating nginx config…"
if ! nginx -t; then
    echo "❌ nginx rejected the change."
    restore
    exit 1
fi
systemctl reload nginx

# ── 5. Check every kind of address, asking nginx on this machine directly ──
echo "→ Checking…"
LOCAL=(--resolve "${DOMAIN}:443:127.0.0.1" -k -s -o /dev/null -w '%{http_code}' --max-time 15)
FAILED=0
UNREACHABLE=0
CHECKED=0
check() {
    local path="$1" want="$2" got
    CHECKED=$((CHECKED + 1))
    got="$(curl "${LOCAL[@]}" "https://${DOMAIN}${path}" || true)"
    if [ "$got" = "000" ]; then UNREACHABLE=$((UNREACHABLE + 1)); fi
    if [ "$got" = "$want" ]; then printf '   ✓ %-56s %s\n' "$path" "$got"
    else printf '   ✗ %-56s %s (expected %s)\n' "$path" "$got" "$want"; FAILED=$((FAILED + 1)); fi
}
check /                                                        200
check /fr/                                                     200
check /tcf-canada-preparation/                                 200
check /fr/preparation-tcf-canada/                              200
check /sitemap.xml                                             200
check /login                                                   200
check /o/company-sign-in                                       200
check /o/company-sign-in/                                      200
check /o/company-sign-in/extra                                 404
check /meeting                                                 200
check /meeting/                                                200
check /meeting/abc-defg-hij                                    200
check /meeting/abc-defg-hij/extra                              404
check /demo-availability/example-token                         200
check /demo-availability/                                      404
check /learn/sign-in/                                          200
check /learn/account/                                          200
check /learn/my-progress/                                      200
check /fr/apprendre/connexion/                                 200
check /fr/apprendre/compte/                                    200
check /learn/practice/reading/mission/le-cours-a-change-de-salle/ 200
check /learn/this-page-does-not-exist/                         404
check /app                                                     200
check /app/dashboard                                           200
check /app/meeting-join/example-room                           200
check /student-dashboard                                       200
check /this-page-does-not-exist/                               404
check /fr/cette-page-nexiste-pas/                              404

if [ "$UNREACHABLE" -eq "$CHECKED" ]; then
    echo "⚠ nginx could not be reached from this machine, so nothing was checked."
    echo "  The change is in place; check from your own computer:"
    echo "    curl -s -o /dev/null -w '%{http_code}\n' https://${DOMAIN}/this-page-does-not-exist/   (expect 404)"
    echo "    curl -s -o /dev/null -w '%{http_code}\n' https://${DOMAIN}/meeting                       (expect 200)"
    echo "  To undo: cp $BACKUP_DIR/$(basename "$SITE") $SITE && systemctl reload nginx"
    exit 0
fi
if [ "$FAILED" -ne 0 ]; then
    echo "❌ $FAILED address(es) did not answer as expected."
    restore
    exit 1
fi

echo "✅ Done. Managed SPA routes updated ($REV_MARKER); unknown addresses return 404 (backup: $BACKUP_DIR)"
