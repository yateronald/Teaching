/**
 * Real-time access and mode event stream for open website tabs (SSE).
 *
 * When an administrator switches the courses between Free and Premium, or
 * grants/revokes Premium or website access on an account or company, every
 * connected tab is notified right away so locked content closes without
 * waiting for a page reload or cache timer.
 */
const clients = new Set();

function send(client, event, data) {
    try {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        client.res.flush?.();
    } catch {
        client.cleanup?.();
    }
}

/** Registers an SSE response stream and returns an unsubscribe callback. */
function subscribe(res, { userId = null, orgId = null } = {}) {
    const client = { res, userId: userId ? Number(userId) : null, orgId: orgId ? Number(orgId) : null, timer: null, cleanup: null };
    const cleanup = () => {
        if (client.timer) { clearInterval(client.timer); client.timer = null; }
        clients.delete(client);
    };
    client.cleanup = cleanup;
    client.timer = setInterval(() => {
        try {
            res.write(': ping\n\n');
            res.flush?.();
        } catch {
            cleanup();
        }
    }, 25 * 1000);
    if (typeof client.timer.unref === 'function') client.timer.unref();
    clients.add(client);
    res.on('close', cleanup);
    return cleanup;
}

/** Notifies every open tab that the global courses mode changed. */
function broadcastMode(mode, updatedAt = new Date().toISOString()) {
    const payload = { mode, updated_at: updatedAt };
    for (const c of [...clients]) send(c, 'mode', payload);
}

/** Notifies open tabs belonging to one user to re-check their access. */
function notifyUser(userId, reason = 'access') {
    const uid = Number(userId);
    if (!uid) return;
    const payload = { reason, at: new Date().toISOString() };
    for (const c of [...clients]) {
        if (c.userId === uid) send(c, 'access', payload);
    }
}

/** Notifies open tabs belonging to members of one organization. */
function notifyOrg(orgId, reason = 'org_access') {
    const oid = Number(orgId);
    if (!oid) return;
    const payload = { reason, at: new Date().toISOString() };
    for (const c of [...clients]) {
        if (c.orgId === oid) send(c, 'access', payload);
    }
}

module.exports = { subscribe, broadcastMode, notifyUser, notifyOrg };
