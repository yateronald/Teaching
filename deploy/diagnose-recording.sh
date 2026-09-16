#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# diagnose-recording.sh
#
# Run this on the VPS that hosts both the backend AND the LiveKit egress
# container. It walks through every step of the recording pipeline and
# reports exactly where it's failing — no guessing.
#
# Usage:
#   sudo bash deploy/diagnose-recording.sh
#
# What it checks:
#   1. Recordings directory exists, writable, has space
#   2. The egress container is up and connected to LiveKit
#   3. Recent egress jobs and their statuses (from container logs)
#   4. Whether recent .mp4 files have been written to disk
#   5. Whether the webhook URL is reachable from the egress container
#   6. Most recent meeting_recordings rows from Postgres
# ════════════════════════════════════════════════════════════════════════
set +e  # don't bail on first failure — we want a full report

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

# Config — adjust if your paths differ.
RECORDINGS_DIR="${RECORDINGS_DIR:-/var/www/teaching-api/backend/uploads/recordings}"
EGRESS_CONTAINER="${EGRESS_CONTAINER:-livekit-egress}"
LIVEKIT_CONTAINER="${LIVEKIT_CONTAINER:-livekit}"
WEBHOOK_URL="${WEBHOOK_URL:-https://api.learnfrenchwithnatives.com/api/webhooks/livekit}"

section() { echo -e "\n${BLUE}━━━━ $1 ━━━━${NC}"; }
ok()      { echo -e "${GREEN}✓${NC} $1"; }
bad()     { echo -e "${RED}✗${NC} $1"; }
warn()    { echo -e "${YELLOW}!${NC} $1"; }

# 1. Recordings directory ────────────────────────────────────────────
section "Recordings directory"
if [ -d "$RECORDINGS_DIR" ]; then
    ok "Directory exists: $RECORDINGS_DIR"
    perms=$(stat -c '%a %U:%G' "$RECORDINGS_DIR" 2>/dev/null || stat -f '%p %u:%g' "$RECORDINGS_DIR")
    echo "  Permissions: $perms"
    if [ -w "$RECORDINGS_DIR" ]; then
        ok "Directory is writable by current user"
    else
        bad "Directory is NOT writable — egress writes will fail"
    fi
    free=$(df -h "$RECORDINGS_DIR" | tail -1 | awk '{print $4}')
    echo "  Free space: $free"
    files=$(ls -1 "$RECORDINGS_DIR" 2>/dev/null | wc -l)
    echo "  Files in directory: $files"
    echo "  Most recent 5:"
    ls -lt "$RECORDINGS_DIR" 2>/dev/null | head -6 | tail -5 | awk '{print "    "$0}'
else
    bad "Directory does not exist: $RECORDINGS_DIR"
    echo "  Create it with:"
    echo "    sudo mkdir -p $RECORDINGS_DIR"
    echo "    sudo chmod 775 $RECORDINGS_DIR"
fi

# 2. Egress container status ─────────────────────────────────────────
section "Egress container"
if command -v docker >/dev/null; then
    if docker ps --format '{{.Names}}' | grep -q "^${EGRESS_CONTAINER}$"; then
        ok "Container '$EGRESS_CONTAINER' is running"
        docker ps --filter "name=$EGRESS_CONTAINER" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        # Volume mounts
        echo "  Volume mounts:"
        docker inspect "$EGRESS_CONTAINER" --format '{{range .Mounts}}    {{.Source}} → {{.Destination}} ({{.Mode}}){{"\n"}}{{end}}'
    else
        bad "Container '$EGRESS_CONTAINER' is NOT running"
        echo "  All running containers:"
        docker ps --format '    {{.Names}} ({{.Image}})'
    fi
else
    warn "Docker not found — skipping container checks"
fi

# 3. Recent egress logs ──────────────────────────────────────────────
section "Recent egress logs (last 30 lines)"
if docker ps --format '{{.Names}}' | grep -q "^${EGRESS_CONTAINER}$"; then
    docker logs "$EGRESS_CONTAINER" --tail=30 2>&1 | sed 's/^/  /'

    section "Egress error/warn signals"
    errors=$(docker logs "$EGRESS_CONTAINER" --since=24h 2>&1 | grep -iE 'error|fail|denied|no space|warn' | tail -10)
    if [ -n "$errors" ]; then
        bad "Found errors/warnings in last 24h:"
        echo "$errors" | sed 's/^/  /'
    else
        ok "No recent error/warn lines in egress logs"
    fi
fi

# 4. LiveKit container webhook config ────────────────────────────────
section "LiveKit webhook configuration"
if docker ps --format '{{.Names}}' | grep -q "^${LIVEKIT_CONTAINER}$"; then
    echo "  Looking for webhook URLs configured in $LIVEKIT_CONTAINER..."
    docker exec "$LIVEKIT_CONTAINER" sh -c 'cat /etc/livekit.yaml 2>/dev/null || cat /livekit.yaml 2>/dev/null' 2>&1 | grep -A2 -i webhook | sed 's/^/  /' || warn "Could not read livekit.yaml inside container"
fi

# 5. Webhook reachability from egress ────────────────────────────────
section "Webhook reachability"
echo "  Trying $WEBHOOK_URL from the host..."
if curl -sS -o /dev/null -w "  HTTP %{http_code} from host\n" "$WEBHOOK_URL" --max-time 5; then
    ok "Webhook responds from host"
else
    bad "Webhook unreachable from host — backend is down or URL wrong"
fi
if docker ps --format '{{.Names}}' | grep -q "^${EGRESS_CONTAINER}$"; then
    echo "  Trying $WEBHOOK_URL from inside the egress container..."
    docker exec "$EGRESS_CONTAINER" sh -c "wget -qO- --timeout=5 '$WEBHOOK_URL' >/dev/null 2>&1 && echo 'reachable' || echo 'NOT reachable'" 2>&1 | sed 's/^/  /'
fi

# 6. Postgres recording rows ─────────────────────────────────────────
section "Recent meeting_recordings rows (last 10)"
if [ -f /var/www/teaching-api/backend/.env ]; then
    set -a
    # shellcheck disable=SC1091
    . /var/www/teaching-api/backend/.env
    set +a
fi
if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT id, meeting_id, status, file_size_bytes,
                EXTRACT(EPOCH FROM (NOW() - started_at))::int AS age_sec,
                error_message
         FROM meeting_recordings
         ORDER BY id DESC LIMIT 10;" 2>&1 | sed 's/^/  /'
else
    warn "DB credentials not in .env — skipping psql check"
fi

# 7. Summary ─────────────────────────────────────────────────────────
section "Summary"
echo "
  Common fixes:
   • Stuck on 'finalizing'      → webhook URL wrong or backend unreachable from egress
   • 'No space left on device'  → free up the disk where $RECORDINGS_DIR lives
   • 'permission denied'        → chmod 775 (or 777) the recordings dir
   • File written but row stuck → run: node backend/database/_unblock-recording.js <meeting_id>
   • To re-set webhook in livekit.yaml, see deploy/livekit-config-fix.md
"
