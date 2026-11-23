#!/usr/bin/env node
// Incremental, parallel uploader from frontend/public/learn/{audio,img,texts}
// to Cloudflare R2 using S3-compatible AWS SigV4 with zero external packages.
//
// Usage:
//   node scripts/sync-r2-media.mjs [--dry-run] [--verify] [--delete] [--concurrency=32] [--prefix=learn/img]

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const PUBLIC_ROOT = path.join(FRONTEND_ROOT, 'public');
const MEDIA_FOLDERS = ['learn/audio', 'learn/img', 'learn/texts'];

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.dat': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    verify: false,
    del: false,
    concurrency: 32,
    prefix: '',
  };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--verify') opts.verify = true;
    else if (arg === '--delete') opts.del = true;
    else if (arg.startsWith('--concurrency=')) {
      const n = Number(arg.slice('--concurrency='.length));
      if (Number.isFinite(n) && n >= 1 && n <= 128) opts.concurrency = Math.floor(n);
    } else if (arg.startsWith('--prefix=')) {
      opts.prefix = arg.slice('--prefix='.length).replace(/^\/+|\/+$/g, '');
    }
  }
  return opts;
}

async function loadEnvFiles() {
  const merged = {};
  const candidates = [
    path.resolve(FRONTEND_ROOT, '..', 'backend', '.env'),
    path.resolve(FRONTEND_ROOT, '..', '.env.r2'),
    path.resolve(FRONTEND_ROOT, '.env.r2'),
  ];
  for (const file of candidates) {
    let raw;
    try {
      raw = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      merged[m[1]] = val;
    }
  }
  return { ...merged, ...process.env };
}

function encodeRfc3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function signRequest({ method, host, bucket, key = '', query = {}, body = Buffer.alloc(0), accessKey, secretKey }) {
  const region = 'auto';
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);

  const keySegments = key ? key.split('/').filter(Boolean).map(encodeRfc3986) : [];
  const canonicalUri = `/${[encodeRfc3986(bucket), ...keySegments].join('/')}`;

  const canonicalQuery = Object.keys(query)
    .filter(k => query[k] !== undefined && query[k] !== null && query[k] !== '')
    .sort()
    .map(k => `${encodeRfc3986(k)}=${encodeRfc3986(String(query[k]))}`)
    .join('&');

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${host}${canonicalUri}${canonicalQuery ? `?${canonicalQuery}` : ''}`;
  return {
    url,
    headers: {
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      Authorization: authorization,
    },
  };
}

function unescapeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function xmlTag(block, tag) {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block);
  return m ? unescapeXml(m[1]) : '';
}

async function fetchWithRetry(url, init, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) {
        const text = await res.text().catch(() => '');
        lastErr = new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 160)}` : ''}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }
    if (i < attempts - 1) {
      const delay = 400 * Math.pow(2, i) + Math.floor(Math.random() * 200);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function listRemoteObjects(cfg, prefix) {
  const remote = new Map();
  let token = '';
  let pages = 0;

  while (true) {
    pages++;
    const query = { 'list-type': '2', 'max-keys': '1000' };
    if (prefix) query.prefix = prefix;
    if (token) query['continuation-token'] = token;

    const req = signRequest({ method: 'GET', host: cfg.host, bucket: cfg.bucket, query, accessKey: cfg.accessKey, secretKey: cfg.secretKey });
    const res = await fetchWithRetry(req.url, { method: 'GET', headers: req.headers });
    const xml = await res.text();
    if (!res.ok) {
      throw new Error(`ListObjectsV2 failed (HTTP ${res.status}): ${xml.slice(0, 300)}`);
    }

    const blocks = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) || [];
    for (const block of blocks) {
      const key = xmlTag(block, 'Key');
      const size = Number(xmlTag(block, 'Size') || 0);
      const etag = xmlTag(block, 'ETag').replace(/"/g, '').toLowerCase();
      if (key) remote.set(key, { size, etag });
    }

    const truncated = xmlTag(xml, 'IsTruncated') === 'true';
    token = truncated ? xmlTag(xml, 'NextContinuationToken') : '';
    if (!truncated || !token) break;
  }

  return { remote, pages };
}

async function collectLocalFiles(prefix) {
  const files = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        const key = path.relative(PUBLIC_ROOT, full).split(path.sep).join('/');
        if (prefix && !key.startsWith(prefix)) continue;
        const st = await fs.stat(full);
        files.push({ localPath: full, key, size: st.size });
      }
    }
  }

  for (const folder of MEDIA_FOLDERS) {
    await walk(path.join(PUBLIC_ROOT, folder));
  }
  return files.sort((a, b) => a.key.localeCompare(b.key));
}

function contentTypeFor(key) {
  const ext = path.extname(key).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

async function runPool(items, concurrency, fn) {
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const item = items[idx++];
      await fn(item);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
}

async function verifyLiveSamples(publicUrl, localFiles) {
  const picks = [];
  for (const ext of ['.webp', '.mp3', '.dat']) {
    const sample = localFiles.find(f => f.key.endsWith(ext));
    if (sample) picks.push(sample);
  }
  if (!picks.length) {
    console.log('No local media samples found to verify.');
    return;
  }

  console.log(`\n▸ Verifying ${picks.length} live sample URLs from ${publicUrl}…`);
  for (const sample of picks) {
    const url = `${publicUrl}/${sample.key}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Origin: 'https://www.learnfrenchwithnatives.com' },
    });
    const buf = await res.arrayBuffer();
    const ct = res.headers.get('content-type');
    const cc = res.headers.get('cache-control');
    const acao = res.headers.get('access-control-allow-origin');
    console.log(`  GET ${url} -> ${res.status} (${buf.byteLength} B) | type=${ct} | cache=${cc} | cors=${acao}`);
    if (!res.ok) throw new Error(`Verify failed for ${url}: HTTP ${res.status}`);
    if (buf.byteLength !== sample.size) {
      throw new Error(`Size mismatch for ${url}: expected ${sample.size}, got ${buf.byteLength}`);
    }
  }
}

async function main() {
  const t0 = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  const env = await loadEnvFiles();

  const accessKey = env.R2_ACCESS_KEY_ID || env.Access_Key_ID || '';
  const secretKey = env.R2_SECRET_ACCESS_KEY || env.Secret_Access_Key || '';
  const accountId = env.R2_ACCOUNT_ID || 'd2ae60cfb55c3a4f1e701c6f83334407';
  const bucket = env.R2_BUCKET || 'lfwn-media';
  const publicUrl = (env.R2_PUBLIC_URL || 'https://media.learnfrenchwithnatives.com').replace(/\/+$/, '');
  const host = `${accountId}.r2.cloudflarestorage.com`;

  if (!accessKey || !secretKey) {
    console.error('✗ Missing R2 credentials. Set R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY or Access_Key_ID/Secret_Access_Key in backend/.env or .env.r2');
    process.exit(1);
  }

  const cfg = { accessKey, secretKey, bucket, host };

  console.log(`▸ Scanning local media in public/learn/{audio,img,texts}${opts.prefix ? ` (prefix: ${opts.prefix})` : ''}…`);
  const localFiles = await collectLocalFiles(opts.prefix);
  const totalBytes = localFiles.reduce((s, f) => s + f.size, 0);
  console.log(`  Found ${localFiles.length} local files (${(totalBytes / (1024 * 1024)).toFixed(1)} MB)`);

  console.log(`▸ Listing remote objects in R2 bucket "${bucket}"…`);
  const { remote, pages } = await listRemoteObjects(cfg, opts.prefix || 'learn/');
  console.log(`  Found ${remote.size} remote objects (${pages} page${pages === 1 ? '' : 's'})`);

  const toUpload = [];
  let skipped = 0;

  await runPool(localFiles, Math.max(8, opts.concurrency), async (file) => {
    const existing = remote.get(file.key);
    if (existing && existing.size === file.size) {
      const buf = await fs.readFile(file.localPath);
      const md5 = crypto.createHash('md5').update(buf).digest('hex');
      if (existing.etag === md5) {
        skipped++;
        return;
      }
    }
    toUpload.push(file);
  });

  const localKeys = new Set(localFiles.map(f => f.key));
  const extraRemote = opts.del ? [...remote.keys()].filter(k => !localKeys.has(k)) : [];

  const uploadBytes = toUpload.reduce((s, f) => s + f.size, 0);
  console.log(`  Plan: ${toUpload.length} to upload (${(uploadBytes / (1024 * 1024)).toFixed(1)} MB), ${skipped} unchanged (skipped)${opts.del ? `, ${extraRemote.length} stale remote to delete` : ''}`);

  if (opts.dryRun) {
    toUpload.slice(0, 20).forEach(f => console.log(`  [dry-run] PUT ${f.key} (${f.size} B)`));
    if (toUpload.length > 20) console.log(`  …and ${toUpload.length - 20} more.`);
    if (opts.verify) await verifyLiveSamples(publicUrl, localFiles);
    return;
  }

  let uploaded = 0;
  let uploadedBytes = 0;
  const failures = [];
  const uploadStart = Date.now();

  if (toUpload.length > 0) {
    console.log(`▸ Uploading ${toUpload.length} files (${opts.concurrency} workers)…`);
    await runPool(toUpload, opts.concurrency, async (file) => {
      try {
        const body = await fs.readFile(file.localPath);
        const contentType = contentTypeFor(file.key);
        const cacheControl = 'public, max-age=31536000, immutable';
        const req = signRequest({
          method: 'PUT',
          host: cfg.host,
          bucket: cfg.bucket,
          key: file.key,
          body,
          accessKey: cfg.accessKey,
          secretKey: cfg.secretKey,
        });
        const res = await fetchWithRetry(req.url, {
          method: 'PUT',
          headers: {
            ...req.headers,
            'Content-Type': contentType,
            'Cache-Control': cacheControl,
          },
          body,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }
        uploaded++;
        uploadedBytes += body.length;
        if (uploaded % 250 === 0 || uploaded === toUpload.length) {
          const elapsed = Math.max(0.1, (Date.now() - uploadStart) / 1000);
          const rate = uploaded / elapsed;
          const eta = rate > 0 ? Math.round((toUpload.length - uploaded) / rate) : 0;
          console.log(`  ${uploaded}/${toUpload.length} uploaded (${(uploadedBytes / (1024 * 1024)).toFixed(1)} MB · ${elapsed.toFixed(0)}s${uploaded < toUpload.length ? ` · ~${eta}s left` : ''})`);
        }
      } catch (err) {
        failures.push({ key: file.key, error: err.message });
      }
    });
  }

  if (opts.del && extraRemote.length > 0 && failures.length === 0) {
    console.log(`▸ Deleting ${extraRemote.length} stale remote objects…`);
    await runPool(extraRemote, opts.concurrency, async (key) => {
      try {
        const req = signRequest({
          method: 'DELETE',
          host: cfg.host,
          bucket: cfg.bucket,
          key,
          accessKey: cfg.accessKey,
          secretKey: cfg.secretKey,
        });
        const res = await fetchWithRetry(req.url, { method: 'DELETE', headers: req.headers });
        if (!res.ok && res.status !== 204 && res.status !== 404) {
          throw new Error(`DELETE HTTP ${res.status}`);
        }
      } catch (err) {
        failures.push({ key, error: err.message });
      }
    });
  }

  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
  if (failures.length > 0) {
    console.error(`✗ ${failures.length} file(s) failed:`);
    failures.slice(0, 15).forEach(f => console.error(`  - ${f.key}: ${f.error}`));
    process.exit(1);
  }

  console.log(`✓ R2 sync complete in ${totalSec}s: ${uploaded} uploaded, ${skipped} skipped, 0 failed.`);

  if (opts.verify) {
    await verifyLiveSamples(publicUrl, localFiles);
  }
}

main().catch(err => {
  console.error('✗ R2 sync failed:', err.message);
  process.exit(1);
});
