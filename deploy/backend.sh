#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║                  BACKEND DEPLOY SCRIPT (Teaching API)                ║
# ║   Node 20 · Express 5 · PostgreSQL · Brevo · LiveKit · PM2 · Nginx   ║
# ╠══════════════════════════════════════════════════════════════════════╣
# ║  USAGE:                                                              ║
# ║    sudo bash backend.sh                                              ║
# ║      → Idempotent install: clones if missing, otherwise updates,     ║
# ║        installs deps, starts under PM2, configures nginx + SSL.      ║
# ║                                                                      ║
# ║    sudo bash backend.sh fresh                                        ║
# ║      → DESTRUCTIVE wipe: deletes PM2 app, repo, nginx site, dist     ║
# ║        before reinstalling from scratch. Backs up .env first so      ║
# ║        secrets aren't lost.                                          ║
# ║                                                                      ║
# ║    sudo bash backend.sh update    → git pull + reinstall + restart   ║
# ║    sudo bash backend.sh restart   → pm2 restart only                 ║
# ║    sudo bash backend.sh logs      → tail PM2 logs                    ║
# ║    sudo bash backend.sh status    → PM2 + nginx status               ║
# ║    sudo bash backend.sh env       → edit .env (auto-reload after)    ║
# ║    sudo bash backend.sh show-env  → cat .env (sensitive!)            ║
# ║    sudo bash backend.sh nginx     → re-render & reload nginx         ║
# ║    sudo bash backend.sh ssl       → request/renew Let's Encrypt cert ║
# ║    sudo bash backend.sh health    → curl /api/health                 ║
# ║    sudo bash backend.sh wipe      → DESTRUCTIVE wipe, no reinstall   ║
# ╚══════════════════════════════════════════════════════════════════════╝
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════
# CONFIGURATION (edit these for your deployment)
# ════════════════════════════════════════════════════════════════════════
GIT_REPO="${GIT_REPO:-https://github.com/YOUR_USERNAME/YOUR_REPO.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"

# Layout on the server
DEPLOY_USER="${DEPLOY_USER:-deploy}"
REPO_DIR="${REPO_DIR:-/home/$DEPLOY_USER/apps/project}"
BACKEND_FOLDER="${BACKEND_FOLDER:-backend}"
BACKEND_DIR="$REPO_DIR/$BACKEND_FOLDER"
BACKEND_ENTRY="${BACKEND_ENTRY:-server.js}"

# Match server.js default and existing .env (PORT=5000)
BACKEND_PORT="${BACKEND_PORT:-5000}"
PM2_APP_NAME="${PM2_APP_NAME:-teaching-api}"

# Domain & SSL
API_DOMAIN="${API_DOMAIN:-api.learnfrenchwithnatives.com}"
APP_DOMAIN="${APP_DOMAIN:-learnfrenchwithnatives.com}"
SSL_EMAIL="${SSL_EMAIL:-support@learnfrenchwithnatives.com}"

# Backups
BACKUP_DIR="${BACKUP_DIR:-/home/$DEPLOY_USER/backups}"
ENV_BACKUP_DIR="$BACKUP_DIR/env"

# ════════════════════════════════════════════════════════════════════════
# COLORS / LOGGING
# ════════════════════════════════════════════════════════════════════════
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
CYAN=$'\033[0;36m'
BOLD=$'\033[1m'
NC=$'\033[0m'

log()     { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[ OK ]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[FAIL]${NC} $1" >&2; exit 1; }
section() { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${NC}"; }

# ════════════════════════════════════════════════════════════════════════
# ROOT CHECK + DEPLOY USER GUARD
# ════════════════════════════════════════════════════════════════════════
check_root() {
    if [ "${EUID}" -ne 0 ]; then
        error "Run with sudo: sudo bash $0 ${1:-}"
    fi
}

ensure_deploy_user() {
    if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
        log "Creating deploy user '$DEPLOY_USER'…"
        useradd -m -s /bin/bash "$DEPLOY_USER"
        success "User '$DEPLOY_USER' created"
    fi
    install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" \
        "/home/$DEPLOY_USER/apps" "$BACKUP_DIR" "$ENV_BACKUP_DIR"
}

run_as_deploy() {
    # Run a command as the deploy user from $BACKEND_DIR (or arg-supplied dir)
    local dir="${2:-$BACKEND_DIR}"
    su -s /bin/bash - "$DEPLOY_USER" -c "cd '$dir' && $1"
}

# ════════════════════════════════════════════════════════════════════════
# SYSTEM DEPENDENCIES
# ════════════════════════════════════════════════════════════════════════
install_dependencies() {
    section "Installing system dependencies"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y \
        git curl wget unzip jq dnsutils \
        nginx certbot python3-certbot-nginx \
        ufw build-essential ca-certificates \
        postgresql-client

    if ! command -v node >/dev/null 2>&1; then
        log "Installing Node.js 20…"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    success "Node.js: $(node -v) · npm: $(npm -v)"

    if ! command -v pm2 >/dev/null 2>&1; then
        log "Installing PM2…"
        npm install -g pm2
        # Hook PM2 into systemd so apps survive reboots, running as deploy user
        pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER" >/dev/null
    fi
    success "PM2: $(pm2 --version)"

    # Log rotation so disk doesn't fill from PM2 logs
    run_as_deploy "pm2 install pm2-logrotate >/dev/null 2>&1 || true" "/home/$DEPLOY_USER"
    run_as_deploy "pm2 set pm2-logrotate:max_size 20M >/dev/null 2>&1 || true" "/home/$DEPLOY_USER"
    run_as_deploy "pm2 set pm2-logrotate:retain 14 >/dev/null 2>&1 || true" "/home/$DEPLOY_USER"

    systemctl enable nginx >/dev/null
    systemctl start nginx

    log "Configuring UFW firewall…"
    ufw allow OpenSSH >/dev/null
    ufw allow 'Nginx Full' >/dev/null
    yes | ufw enable >/dev/null 2>&1 || true

    success "System dependencies ready"
}

# ════════════════════════════════════════════════════════════════════════
# .ENV TEMPLATE (only written if .env doesn't exist)
# ════════════════════════════════════════════════════════════════════════
write_env_template() {
    cat > "$BACKEND_DIR/.env" <<'ENVEOF'
NODE_ENV=production
PORT=5000

# ── App URLs ────────────────────────────────────────
FRONTEND_URL=https://learnfrenchwithnatives.com
ALLOWED_ORIGINS=

# ── Aiven PostgreSQL (server.js / init-postgres.js) ─
DATABASE_TYPE=postgresql
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_SSL=true

# ── Auth ────────────────────────────────────────────
JWT_SECRET=CHANGE_ME_GENERATE_A_LONG_RANDOM_STRING
JWT_EXPIRES_IN=24h

# ── Email (Brevo) ───────────────────────────────────
BREVO_API_KEY=
EMAIL_FROM="Learn French with Natives <support@learnfrenchwithnatives.com>"
EMAIL_FROM_NAME="Learn French with Natives"
EMAIL_LOGO_URL=https://learnfrenchwithnatives.com/assets/Logo.png

# ── LiveKit ─────────────────────────────────────────
LIVEKIT_URL=wss://livekit.learnfrenchwithnatives.com
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# ── Egress recordings paths ─────────────────────────
# Where the LiveKit egress process writes the MP4 (path it sees inside
# its container). The official LiveKit docker-compose bind-mounts:
#   /opt/livekit/recordings (host) → /home/egress/recordings (container)
EGRESS_RECORDINGS_DIR=/home/egress/recordings
# Host-side path of the same physical directory (for the backend to
# read the file back after egress finishes writing).
HOST_EGRESS_RECORDINGS_DIR=/opt/livekit/recordings

# ── kDrive (Infomaniak) for resource storage ────────
KDRIVE_TOKEN=
KDRIVE_ID=
KDRIVE_FOLDER_ID=

# ── Gemini AI (EE/EO simulation) ────────────────────
GEMINI_API_KEY=
GEMINI_API_KEY1=
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview

# ── Storage ─────────────────────────────────────────
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50mb
ENVEOF
    chown "$DEPLOY_USER:$DEPLOY_USER" "$BACKEND_DIR/.env"
    chmod 600 "$BACKEND_DIR/.env"
}

backup_env() {
    if [ -f "$BACKEND_DIR/.env" ]; then
        local stamp
        stamp="$(date +%Y%m%d_%H%M%S)"
        install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$ENV_BACKUP_DIR"
        cp "$BACKEND_DIR/.env" "$ENV_BACKUP_DIR/.env.$stamp"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_BACKUP_DIR/.env.$stamp"
        chmod 600 "$ENV_BACKUP_DIR/.env.$stamp"
        success ".env backed up to $ENV_BACKUP_DIR/.env.$stamp"
    fi
}

restore_latest_env() {
    local latest
    latest="$(ls -1t "$ENV_BACKUP_DIR"/.env.* 2>/dev/null | head -n1 || true)"
    if [ -n "$latest" ]; then
        cp "$latest" "$BACKEND_DIR/.env"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$BACKEND_DIR/.env"
        chmod 600 "$BACKEND_DIR/.env"
        success "Restored .env from $latest"
    fi
}

# ════════════════════════════════════════════════════════════════════════
# GIT SYNC
# ════════════════════════════════════════════════════════════════════════
clone_or_pull() {
    section "Syncing repository ($GIT_BRANCH)"
    install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$(dirname "$REPO_DIR")"
    if [ ! -d "$REPO_DIR/.git" ]; then
        log "Cloning $GIT_REPO …"
        run_as_deploy "git clone -b '$GIT_BRANCH' '$GIT_REPO' '$REPO_DIR'" "/home/$DEPLOY_USER"
    else
        log "Pulling latest changes …"
        run_as_deploy "git fetch origin && git reset --hard 'origin/$GIT_BRANCH' && git clean -fd" "$REPO_DIR"
    fi
    [ -d "$BACKEND_DIR" ] || error "Expected $BACKEND_DIR after clone — check BACKEND_FOLDER"
    success "Repository synced"
}

# ════════════════════════════════════════════════════════════════════════
# DESTRUCTIVE WIPE (used by 'fresh' and 'wipe')
# ════════════════════════════════════════════════════════════════════════
wipe_everything() {
    section "Wiping previous deployment"
    backup_env

    if pm2 -s show "$PM2_APP_NAME" >/dev/null 2>&1 || \
       run_as_deploy "pm2 -s show '$PM2_APP_NAME' >/dev/null 2>&1" "/home/$DEPLOY_USER"; then
        log "Stopping & deleting PM2 app '$PM2_APP_NAME' …"
        run_as_deploy "pm2 delete '$PM2_APP_NAME' || true" "/home/$DEPLOY_USER"
        run_as_deploy "pm2 save --force || true" "/home/$DEPLOY_USER"
    fi

    if [ -d "$REPO_DIR" ]; then
        log "Removing repo dir $REPO_DIR …"
        rm -rf "$REPO_DIR"
    fi

    for f in "/etc/nginx/sites-enabled/$API_DOMAIN" "/etc/nginx/sites-available/$API_DOMAIN"; do
        if [ -e "$f" ] || [ -L "$f" ]; then
            log "Removing nginx config $f"
            rm -f "$f"
        fi
    done

    if command -v nginx >/dev/null 2>&1; then
        nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
    fi

    success "Wipe complete (env backups kept in $ENV_BACKUP_DIR)"
}

# ════════════════════════════════════════════════════════════════════════
# INSTALL NODE MODULES
# ════════════════════════════════════════════════════════════════════════
install_backend() {
    section "Installing backend dependencies"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$REPO_DIR"

    local available
    available=$(df -P "$BACKEND_DIR" | awk 'NR==2 {print $4}')
    if [ "$available" -lt 512000 ]; then
        error "Less than 500 MB free at $BACKEND_DIR — clean up before installing"
    fi

    run_as_deploy "rm -rf node_modules package-lock.json && npm cache verify >/dev/null 2>&1 || true"
    run_as_deploy "npm install --no-audit --no-fund" \
        || error "npm install failed — see output above"
    success "Dependencies installed ($(run_as_deploy "ls node_modules | wc -l") packages)"
}

# ════════════════════════════════════════════════════════════════════════
# PM2 START / RELOAD
# ════════════════════════════════════════════════════════════════════════
start_backend() {
    section "Starting backend under PM2"
    install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$BACKEND_DIR/uploads" "$BACKEND_DIR/uploads/recordings"

    if run_as_deploy "pm2 -s show '$PM2_APP_NAME' >/dev/null 2>&1"; then
        log "App exists, reloading…"
        run_as_deploy "pm2 reload '$PM2_APP_NAME' --update-env"
    else
        log "Starting fresh PM2 app '$PM2_APP_NAME' on port $BACKEND_PORT…"
        run_as_deploy "pm2 start '$BACKEND_ENTRY' --name '$PM2_APP_NAME' --time --max-memory-restart 1G"
    fi
    run_as_deploy "pm2 save --force"

    sleep 4
    health_check
}

health_check() {
    log "Health check…"
    local response
    if response=$(curl -fsS --max-time 10 "http://localhost:$BACKEND_PORT/api/health" 2>&1); then
        success "Backend healthy → $response"
    else
        warn "Health endpoint not responding cleanly. Last logs:"
        run_as_deploy "pm2 logs '$PM2_APP_NAME' --lines 30 --nostream || true" "/home/$DEPLOY_USER"
    fi
}

# ════════════════════════════════════════════════════════════════════════
# NGINX RENDER
# ════════════════════════════════════════════════════════════════════════
configure_nginx() {
    section "Configuring nginx for $API_DOMAIN"
    local site_available="/etc/nginx/sites-available/$API_DOMAIN"
    cat > "$site_available" <<EOF
# Auto-generated by deploy/backend.sh — do not edit by hand.
upstream teaching_api_upstream {
    server 127.0.0.1:$BACKEND_PORT;
    keepalive 16;
}

server {
    listen 80;
    listen [::]:80;
    server_name $API_DOMAIN;

    # Allow large uploads.
    # • Bulk imports for TCF CO/CE/EE series can include 30-40 audio files
    #   (one per question) plus images, easily exceeding 100MB total.
    # • Recordings webhook payloads (LiveKit egress) can also be large.
    # 2G is a generous upper bound; multer enforces the real per-file limit
    # (50 MB) inside the application.
    client_max_body_size 2G;
    client_body_timeout 600s;
    client_header_timeout 60s;

    # Security headers — CORS is handled by Express itself
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Long timeouts for streaming endpoints (recordings, audio) and big uploads
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
    proxy_connect_timeout 60s;

    location / {
        proxy_pass http://teaching_api_upstream;
        proxy_http_version 1.1;

        # WebSocket / Socket.IO upgrade
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffering off;
        proxy_request_buffering off;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Map for proper Connection header on WebSocket upgrades
EOF

    # Add the connection_upgrade map ONCE in conf.d (idempotent)
    cat > /etc/nginx/conf.d/connection_upgrade.conf <<'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
EOF

    ln -sf "$site_available" "/etc/nginx/sites-enabled/$API_DOMAIN"
    rm -f /etc/nginx/sites-enabled/default

    nginx -t || error "nginx config invalid"
    systemctl reload nginx
    success "Nginx configured & reloaded"
}

# ════════════════════════════════════════════════════════════════════════
# SSL via Let's Encrypt (idempotent — certbot --nginx is safe to re-run)
# ════════════════════════════════════════════════════════════════════════
setup_ssl() {
    section "Setting up SSL for $API_DOMAIN"
    log "Checking DNS…"
    local resolved server_ip
    resolved="$(dig +short "$API_DOMAIN" | tail -n1)"
    server_ip="$(curl -fsS https://api.ipify.org || true)"
    if [ -n "$resolved" ] && [ -n "$server_ip" ] && [ "$resolved" = "$server_ip" ]; then
        success "DNS points to this server ($server_ip)"
    else
        warn "DNS does not point to this server. Expected $server_ip, got '$resolved'"
        warn "SSL issuance may fail — fix DNS first if it does."
    fi

    certbot --nginx \
        -d "$API_DOMAIN" \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --non-interactive \
        --redirect \
        || error "certbot failed"

    # Test renewal works
    certbot renew --dry-run >/dev/null 2>&1 || warn "Renewal dry-run failed — check certbot logs"
    success "SSL ready: https://$API_DOMAIN"
}

# ════════════════════════════════════════════════════════════════════════
# .ENV MANAGEMENT
# ════════════════════════════════════════════════════════════════════════
show_env() {
    section "Current .env ($BACKEND_DIR/.env)"
    if [ -f "$BACKEND_DIR/.env" ]; then
        cat "$BACKEND_DIR/.env"
    else
        warn ".env not found at $BACKEND_DIR/.env"
    fi
}

edit_env() {
    section "Editing .env"
    backup_env
    "${EDITOR:-nano}" "$BACKEND_DIR/.env"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$BACKEND_DIR/.env"
    chmod 600 "$BACKEND_DIR/.env"
    if run_as_deploy "pm2 -s show '$PM2_APP_NAME' >/dev/null 2>&1"; then
        run_as_deploy "pm2 reload '$PM2_APP_NAME' --update-env"
        success "PM2 app reloaded with new env"
    fi
}

# ════════════════════════════════════════════════════════════════════════
# STATUS / LOGS
# ════════════════════════════════════════════════════════════════════════
show_status() {
    section "PM2"
    run_as_deploy "pm2 list" "/home/$DEPLOY_USER" || true
    section "Nginx"
    systemctl --no-pager status nginx | head -n 8 || true
    section "Listening ports"
    ss -tlnp | grep -E "(:$BACKEND_PORT|:80|:443)" || true
}

show_logs() {
    section "PM2 logs ($PM2_APP_NAME)"
    run_as_deploy "pm2 logs '$PM2_APP_NAME' --lines 80" "/home/$DEPLOY_USER"
}

restart_only() {
    section "Restarting $PM2_APP_NAME"
    run_as_deploy "pm2 restart '$PM2_APP_NAME' --update-env"
    sleep 3
    health_check
}

run_health() {
    health_check
    if command -v curl >/dev/null 2>&1; then
        log "Public probe: https://$API_DOMAIN/api/health"
        curl -sS --max-time 10 "https://$API_DOMAIN/api/health" || warn "Public health probe failed"
        echo
    fi
}

# ════════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════════
summary() {
    echo
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                  DEPLOYMENT COMPLETE                     ║${NC}"
    echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "API URL"      "https://$API_DOMAIN"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "Health"       "https://$API_DOMAIN/api/health"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "PM2 app"      "$PM2_APP_NAME"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "Repo"         "$REPO_DIR"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "Run user"     "$DEPLOY_USER"
    printf "${GREEN}${BOLD}║${NC}  %-13s %-40s ${GREEN}${BOLD}║${NC}\n" "Backups"      "$ENV_BACKUP_DIR"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  sudo bash $0 logs"
    echo "  sudo bash $0 status"
    echo "  sudo bash $0 update     # pull + reinstall + restart"
    echo "  sudo bash $0 fresh      # destructive wipe + reinstall"
    echo
}

# ════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════
ACTION="${1:-install}"
check_root "$ACTION"

case "$ACTION" in
    install|"")
        section "BACKEND INSTALL (idempotent)"
        ensure_deploy_user
        install_dependencies
        clone_or_pull
        if [ ! -f "$BACKEND_DIR/.env" ]; then
            warn "No .env found — writing template"
            write_env_template
            restore_latest_env || true
            warn "Edit secrets now:"
            "${EDITOR:-nano}" "$BACKEND_DIR/.env"
        fi
        install_backend
        start_backend
        configure_nginx
        setup_ssl || warn "SSL step failed — run 'sudo bash $0 ssl' once DNS is correct."
        summary
        ;;

    fresh)
        section "BACKEND FRESH INSTALL (destructive)"
        echo -e "${YELLOW}This will DELETE the PM2 app, repo dir, and nginx site.${NC}"
        echo -e "${YELLOW}.env files in $ENV_BACKUP_DIR are preserved.${NC}"
        if [ "${FORCE:-0}" != "1" ]; then
            read -r -p "Type 'wipe' to continue: " confirm
            [ "$confirm" = "wipe" ] || error "Aborted by user"
        fi
        ensure_deploy_user
        install_dependencies
        wipe_everything
        clone_or_pull
        if [ ! -f "$BACKEND_DIR/.env" ]; then
            write_env_template
            restore_latest_env || true
            warn "Review env values:"
            "${EDITOR:-nano}" "$BACKEND_DIR/.env"
        fi
        install_backend
        start_backend
        configure_nginx
        setup_ssl || warn "SSL step failed — run 'sudo bash $0 ssl' once DNS is correct."
        summary
        ;;

    wipe)
        section "BACKEND WIPE ONLY"
        echo -e "${YELLOW}This will DELETE the PM2 app, repo dir, and nginx site (no reinstall).${NC}"
        if [ "${FORCE:-0}" != "1" ]; then
            read -r -p "Type 'wipe' to continue: " confirm
            [ "$confirm" = "wipe" ] || error "Aborted by user"
        fi
        wipe_everything
        success "Wipe done. Run 'sudo bash $0 install' to redeploy."
        ;;

    update)
        section "BACKEND UPDATE"
        backup_env
        clone_or_pull
        install_backend
        start_backend
        summary
        ;;

    restart)
        restart_only
        ;;

    logs)
        show_logs
        ;;

    status)
        show_status
        ;;

    health)
        run_health
        ;;

    env)
        edit_env
        ;;

    show-env)
        show_env
        ;;

    nginx)
        configure_nginx
        ;;

    ssl)
        setup_ssl
        ;;

    *)
        echo
        echo -e "${YELLOW}Usage:${NC}  sudo bash $0 [install|fresh|wipe|update|restart|logs|status|health|env|show-env|nginx|ssl]"
        echo
        echo "  install    (default) Idempotent install — clone-or-pull, install deps, start, nginx, SSL"
        echo "  fresh      Destructive wipe + reinstall (env is backed up first)"
        echo "  wipe       Destructive wipe only — no reinstall"
        echo "  update     git pull + reinstall + restart"
        echo "  restart    pm2 restart only"
        echo "  logs       Tail PM2 logs"
        echo "  status     PM2 + nginx + ports overview"
        echo "  health     Hit /api/health locally and publicly"
        echo "  env        Edit .env (auto-reloads PM2)"
        echo "  show-env   Cat .env (sensitive!)"
        echo "  nginx      Re-render nginx config"
        echo "  ssl        Run certbot --nginx for the API domain"
        echo
        echo "  Tip: prefix FORCE=1 to skip confirmation prompts on 'fresh' and 'wipe'."
        echo
        ;;
esac
