# LiveKit & Egress configuration — recording fix

The most likely reason recordings get stuck on **finalizing** and "fail to load video" is that the LiveKit egress finishes the file but the `egress_ended` webhook never reaches your backend, so the `meeting_recordings` row is never moved from `finalizing` → `ready`.

This document gives you the exact YAML pieces you need on the VPS — **only** what's actually valid in modern LiveKit (1.5+ / 1.7+).

> **NOTE:** Do NOT add `pli_throttle.low_quality / mid_quality / high_quality` or `reconnect_on_publish_error` to your config. Those keys do not exist in modern LiveKit and would be silently ignored.

---

## 1. `livekit.yaml` (LiveKit server itself)

```yaml
port: 7880
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true

keys:
  YOUR_API_KEY: YOUR_API_SECRET

# ── Webhook config — THIS is what fixes the "stuck on finalizing" problem ──
webhook:
  api_key: YOUR_API_KEY    # must match the key the backend uses to verify
  urls:
    - https://api.learnfrenchwithnatives.com/api/webhooks/livekit
```

After editing:

```bash
sudo systemctl restart livekit-server
# or, if running in docker:
docker restart livekit
```

Verify webhooks are firing:

```bash
docker logs livekit --since=5m | grep -i webhook
# you should see: "sending webhook" lines around egress_ended events
```

If you see `connection refused` or `dial tcp ... no route to host`, the egress can reach the public internet but not your backend. Confirm:

```bash
# from the VPS shell:
curl -X POST -H "Content-Type: application/json" -d '{}' \
  https://api.learnfrenchwithnatives.com/api/webhooks/livekit
# expect: 401 (signature missing) — that means the route is alive
# any other error means nginx or the backend is down
```

---

## 2. `egress.yaml` (LiveKit egress container)

```yaml
api_key: YOUR_API_KEY
api_secret: YOUR_API_SECRET
ws_url: wss://livekit.learnfrenchwithnatives.com   # public LiveKit URL

# Where to keep the rendered MP4s. This path must match the volume mount
# below. The backend's recordingService.js writes its `filepath` as an
# absolute path under <UPLOAD_PATH>/recordings, so the egress process must
# be able to write to that exact path.
log_level: info

# Use Chrome's hardware GPU when available — helps the encoder keep up
# with screen shares without dropping frames.
enable_chrome_sandbox: false
```

---

## 3. `docker-compose.yml` (the critical bit — volume mount)

The backend writes recordings to `<UPLOAD_PATH>/recordings/meeting-<id>-<ts>.mp4` on the host. The egress container has to write to the **same physical path** so the backend can read the file back via `fs.statSync`.

```yaml
services:
  livekit:
    image: livekit/livekit-server:latest
    network_mode: host
    restart: unless-stopped
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml:ro
    command: --config /etc/livekit.yaml

  livekit-egress:
    image: livekit/egress:latest
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN     # needed for Chrome sandbox
    network_mode: host
    environment:
      - EGRESS_CONFIG_FILE=/etc/egress.yaml
    volumes:
      - ./egress.yaml:/etc/egress.yaml:ro
      # ── THE CRITICAL LINE ──
      # The backend writes filepath = /var/www/teaching-api/backend/uploads/recordings/...
      # This volume makes that exact path inside the container resolve to the
      # exact same path on the host so node:fs.statSync works after the
      # webhook arrives.
      - /var/www/teaching-api/backend/uploads/recordings:/var/www/teaching-api/backend/uploads/recordings
```

> **Important:** the host path `/var/www/teaching-api/backend/uploads/recordings` is **mapped to itself inside the container** so the absolute path the backend computed (and stored in the DB row's `file_path`) is also valid for the egress writer. If you change the bind, also change `UPLOAD_PATH` in `backend/.env`.

After editing:

```bash
docker compose up -d
docker compose logs -f livekit-egress
# Try recording, you should see lines like:
#   "starting egress" → "ending egress" → "uploaded" / "saved"
```

---

## 4. Common error → fix

| Symptom | Diagnosis | Fix |
|---|---|---|
| Stuck on `finalizing` forever | webhook never reached backend | Check `webhook.urls` in livekit.yaml + curl test above |
| `Failed to load record video` | File doesn't exist where DB says it does | Check volume mount in docker-compose. Then run `node backend/database/_unblock-recording.js <meeting_id>` to clear the orphan |
| `permission denied` in egress logs | Recordings dir owned by host user, container runs as root | `sudo chmod 775 /var/www/teaching-api/backend/uploads/recordings` |
| `no space left on device` | Old recordings filling the disk | `node backend/services/recordingCleanupService.js` runs hourly; or manually `find ... -mtime +30 -delete` |
| `signature verification failed` | Backend's `LIVEKIT_API_KEY/SECRET` doesn't match `webhook.api_key` in livekit.yaml | Make sure the same key+secret is used in both places |

---

## 5. After the fix — restart everything

```bash
# stop both
docker compose down

# create the recordings dir if it doesn't exist
sudo mkdir -p /var/www/teaching-api/backend/uploads/recordings
sudo chmod 775 /var/www/teaching-api/backend/uploads/recordings

# bring everything back
docker compose up -d

# restart your node backend so it re-reads .env
sudo systemctl restart teaching-api
# or, if pm2:
pm2 restart teaching-api
```

Then start a meeting, record a few seconds, stop, and watch the recording move from `recording → finalizing → ready` within a couple of seconds. If it stays at `finalizing`, run `bash deploy/diagnose-recording.sh` for the report.
