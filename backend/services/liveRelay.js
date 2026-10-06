// ============================================================
// Oral-exam relay for Vertex AI.
//
// With the Developer API the browser talks to Gemini Live directly, over an
// ephemeral token. Vertex AI has no such tokens, so on that engine the browser
// talks to this relay instead, with the same protocol, and the relay talks to
// Vertex with the server's key:
//  • the browser holds a ticket: random, single-use, valid one minute, bound to
//    its account (issued by POST /eo-simulation/:id/live-token);
//  • the session (model, voice, examiner instructions, tools) is the one the
//    server put in the ticket: the browser's own setup message is ignored;
//  • from the browser, only audio, platform cues and tool answers go through
//    (size and rate limited); the examiner's messages come back untouched;
//  • a session ends after MAX_SESSION_MS, and an account holds few at once.
// ============================================================
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');
const { safeMessage } = require('./aiModels');

const RELAY_PATH = '/api/eo-simulation/live-relay';
const TICKET_TTL_MS = 60_000;
const MAX_SESSION_MS = 12 * 60_000;    // the longest task is 4 min 30 s, plus reconnection margin
const MAX_MESSAGE_BYTES = 256 * 1024;  // an 80 ms audio frame is about 3.5 KB
const MAX_MESSAGES_PER_SECOND = 120;   // the browser sends ~13 audio frames a second
const MAX_SESSIONS_PER_USER = 2;
const MAX_TEXT = 4000;

const tickets = new Map(); // ticket → { userId, setup, upstream, expires }
const sessionsByUser = new Map(); // userId → open sessions

function prune() {
  const now = Date.now();
  for (const [t, entry] of tickets) if (entry.expires < now) tickets.delete(t);
}

/** A single-use ticket for one examiner session. `setup` is the full Live setup message. */
function issueTicket({ userId, setup, upstream }) {
  prune();
  const ticket = crypto.randomBytes(32).toString('base64url');
  tickets.set(ticket, { userId, setup, upstream, expires: Date.now() + TICKET_TTL_MS });
  return ticket;
}

/** The part of a browser message that may reach the examiner, or null. */
function sanitize(msg) {
  if (!msg || typeof msg !== 'object') return null;
  const r = msg.realtimeInput;
  if (r && typeof r === 'object') {
    const out = {};
    if (r.audio && typeof r.audio.data === 'string' && /^audio\/pcm/.test(String(r.audio.mimeType || ''))) {
      out.audio = { data: r.audio.data, mimeType: String(r.audio.mimeType).slice(0, 40) };
    }
    if (typeof r.text === 'string' && r.text) out.text = r.text.slice(0, MAX_TEXT);
    if (r.audioStreamEnd === true) out.audioStreamEnd = true;
    return Object.keys(out).length ? { realtimeInput: out } : null;
  }
  const calls = msg.toolResponse?.functionResponses;
  if (Array.isArray(calls) && calls.length) {
    return {
      toolResponse: {
        functionResponses: calls.slice(0, 8).map(f => ({
          ...(f?.id ? { id: String(f.id).slice(0, 128) } : {}),
          name: String(f?.name || '').slice(0, 64),
          response: { result: String(f?.response?.result ?? 'ok').slice(0, 200) },
        })),
      },
    };
  }
  return null;
}

// Codes a server may send in a close frame; the others (1005, 1006, 1015…) become 1011.
const sendableCode = (code) => ((code >= 1000 && code <= 1003) || (code >= 1007 && code <= 1011) || (code >= 3000 && code <= 4999) ? code : 1011);
// A close reason is at most 123 bytes; no project path or key ever reaches the browser.
const cleanReason = (reason) => Buffer.from(safeMessage(String(reason || '')).slice(0, 110)).subarray(0, 120).toString();

function relay(client, { userId, setup, upstream: target }) {
  sessionsByUser.set(userId, (sessionsByUser.get(userId) || 0) + 1);
  const upstream = new WebSocket(target.url, { headers: target.headers, perMessageDeflate: false, handshakeTimeout: 15_000 });
  const pending = [];
  let ready = false;
  let closed = false;
  let windowStart = Date.now();
  let windowCount = 0;

  const finish = (code, reason) => {
    if (closed) return;
    closed = true;
    clearTimeout(limit);
    sessionsByUser.set(userId, Math.max(0, (sessionsByUser.get(userId) || 1) - 1));
    if (!sessionsByUser.get(userId)) sessionsByUser.delete(userId);
    try { if (client.readyState === WebSocket.OPEN) client.close(sendableCode(code), cleanReason(reason)); else client.terminate(); } catch { /* gone */ }
    try { if (upstream.readyState === WebSocket.OPEN) upstream.close(1000); else upstream.terminate(); } catch { /* gone */ }
  };
  const limit = setTimeout(() => finish(1000, 'Session time limit reached'), MAX_SESSION_MS);

  upstream.on('open', () => upstream.send(JSON.stringify(setup)));
  upstream.on('message', (data, isBinary) => {
    if (!ready) {
      try {
        if (JSON.parse(data.toString('utf8'))?.setupComplete) {
          ready = true;
          pending.splice(0).forEach(m => upstream.send(m));
        }
      } catch { /* not JSON: forwarded as is */ }
    }
    if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
  });
  upstream.on('close', (code, reason) => finish(code, reason.toString() || 'Examiner session closed'));
  upstream.on('error', (err) => {
    console.warn('⚠️  Live relay: upstream error —', safeMessage(err));
    finish(1011, 'The examiner service is unavailable');
  });

  client.on('message', (data) => {
    const now = Date.now();
    if (now - windowStart >= 1000) { windowStart = now; windowCount = 0; }
    if (++windowCount > MAX_MESSAGES_PER_SECOND) return finish(1008, 'Too many messages');
    let msg;
    try { msg = JSON.parse(data.toString('utf8')); } catch { return; }
    if (msg?.setup) return; // the session is the server's (sent on upstream open)
    const out = sanitize(msg);
    if (!out) return;
    const text = JSON.stringify(out);
    if (ready && upstream.readyState === WebSocket.OPEN) upstream.send(text);
    else if (pending.length < 40) pending.push(text);
  });
  client.on('close', () => finish(1000, ''));
  client.on('error', () => finish(1011, ''));
}

/**
 * The relay's public address, on the host the request came in by: the API
 * address the front end is built with (VITE_API_BASE_URL), behind nginx in
 * production (`trust proxy` makes the protocol https there). Never hardcoded.
 */
const relayUrlFor = (req) => `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.get('host')}${RELAY_PATH}`;

/** Adds the relay to the HTTP server, next to Socket.IO (which keeps its own path). */
function attach(server, { isOriginAllowed = () => true } = {}) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES, perMessageDeflate: false });
  server.on('upgrade', (req, socket, head) => {
    let url;
    try { url = new URL(req.url, 'http://relay.local'); } catch { return; }
    if (url.pathname !== RELAY_PATH) return;
    const refuse = (status, text) => {
      try { socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`); } catch { /* gone */ }
      socket.destroy();
    };
    if (!isOriginAllowed(req.headers.origin)) return refuse(403, 'Forbidden');
    prune();
    const ticket = url.searchParams.get('access_token') || '';
    const entry = tickets.get(ticket);
    tickets.delete(ticket); // single use, even when refused below
    if (!entry || entry.expires < Date.now()) return refuse(401, 'Unauthorized');
    if ((sessionsByUser.get(entry.userId) || 0) >= MAX_SESSIONS_PER_USER) return refuse(429, 'Too Many Requests');
    wss.handleUpgrade(req, socket, head, (client) => relay(client, entry));
  });
  console.log(`🎙️ Live examiner relay ready on ${RELAY_PATH}`);
  return wss;
}

module.exports = { RELAY_PATH, relayUrlFor, issueTicket, attach, sanitize };
