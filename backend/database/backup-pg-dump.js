/**
 * backup-pg-dump.js
 *
 * Produces a portable PostgreSQL backup of the live Aiven database that you
 * can restore into ANY other PostgreSQL instance (Aiven, Neon, Render, RDS,
 * a local docker pg, etc.).
 *
 * Per run, it writes three files into backend/database/backups/:
 *
 *   schema-backup-<timestamp>.schema.sql   →  DDL only (CREATE TABLE/INDEX/FK)
 *   schema-backup-<timestamp>.data.sql     →  DATA only (COPY commands)
 *   schema-backup-<timestamp>.full.dump    →  Custom-format archive (binary)
 *
 * The plain .sql files can be applied with:
 *   psql "$NEW_DATABASE_URL" -f schema-backup-<timestamp>.schema.sql
 *   psql "$NEW_DATABASE_URL" -f schema-backup-<timestamp>.data.sql
 *
 * Or, restore from the binary archive (recommended — supports parallel
 * restore and selective table restore):
 *   pg_restore -d "$NEW_DATABASE_URL" --no-owner --no-privileges \
 *              schema-backup-<timestamp>.full.dump
 *
 * Run:
 *   cd backend
 *   node database/backup-pg-dump.js
 *
 * Requirements:
 *   - pg_dump on PATH (`pg_dump --version` should work). On Windows, install
 *     PostgreSQL from https://www.postgresql.org/download/windows/ and the
 *     `pg_dump.exe` will live in `C:\Program Files\PostgreSQL\<ver>\bin\`.
 *   - DB_HOST/DB_PORT/DB_USER/DB_NAME/DB_PASSWORD in backend/.env (already
 *     present for the live Aiven connection). The Aiven CA cert at
 *     backend/cert/ca.pem is automatically used for SSL verification.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, 'backups');
const CERT_PATH = path.join(__dirname, '..', 'cert', 'ca.pem');

function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
    );
}

function humanSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildEnv() {
    const env = { ...process.env };
    // pg_dump reads PG* env vars natively — no need to put password on CLI.
    env.PGHOST = process.env.DB_HOST;
    env.PGPORT = process.env.DB_PORT;
    env.PGUSER = process.env.DB_USER;
    env.PGDATABASE = process.env.DB_NAME;
    env.PGPASSWORD = process.env.DB_PASSWORD;

    // Aiven requires SSL with verification against their CA. pg_dump uses
    // libpq, which honors PGSSLMODE / PGSSLROOTCERT.
    const isAiven = (process.env.DB_HOST || '').includes('aivencloud.com');
    if (isAiven || process.env.DB_SSL === 'true') {
        env.PGSSLMODE = 'verify-ca';
        if (fs.existsSync(CERT_PATH)) {
            env.PGSSLROOTCERT = CERT_PATH;
        } else {
            // Fall back to require (encryption only, no cert verification)
            env.PGSSLMODE = 'require';
            console.warn(`⚠  CA cert not found at ${CERT_PATH} — falling back to PGSSLMODE=require`);
        }
    }
    return env;
}

function runPgDump(args, outFile, env, label) {
    return new Promise((resolve, reject) => {
        const out = fs.createWriteStream(outFile);
        const proc = spawn('pg_dump', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });

        let stderr = '';
        proc.stdout.pipe(out);
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
            // pg_dump is quiet by default unless --verbose is passed; nothing to log here.
        });

        proc.on('error', (err) => {
            out.destroy();
            reject(new Error(`Failed to spawn pg_dump: ${err.message}`));
        });
        proc.on('close', (code) => {
            out.end(() => {
                if (code === 0) {
                    const size = fs.statSync(outFile).size;
                    console.log(`✅ ${label.padEnd(8)} → ${path.relative(process.cwd(), outFile)}  (${humanSize(size)})`);
                    resolve();
                } else {
                    reject(new Error(`pg_dump (${label}) exited with code ${code}\n${stderr}`));
                }
            });
        });
    });
}

function runPgDumpFile(args, env, label) {
    // For -Fc which writes to -f directly (binary). Stderr captured for errors.
    return new Promise((resolve, reject) => {
        const proc = spawn('pg_dump', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });

        let stderr = '';
        proc.stdout.on('data', () => {}); // discard
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        proc.on('error', (err) => reject(new Error(`Failed to spawn pg_dump: ${err.message}`)));
        proc.on('close', (code) => {
            if (code === 0) {
                // Find the -f arg to report size
                const fileIdx = args.indexOf('-f');
                if (fileIdx >= 0 && args[fileIdx + 1]) {
                    const f = args[fileIdx + 1];
                    const size = fs.existsSync(f) ? fs.statSync(f).size : 0;
                    console.log(`✅ ${label.padEnd(8)} → ${path.relative(process.cwd(), f)}  (${humanSize(size)})`);
                }
                resolve();
            } else {
                reject(new Error(`pg_dump (${label}) exited with code ${code}\n${stderr}`));
            }
        });
    });
}

async function main() {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const env = buildEnv();
    const stamp = timestamp();
    const base = path.join(OUT_DIR, `schema-backup-${stamp}`);
    const schemaFile = `${base}.schema.sql`;
    const dataFile = `${base}.data.sql`;
    const dumpFile = `${base}.full.dump`;

    console.log(`🐘 Dumping ${env.PGUSER}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`);
    if (env.PGSSLROOTCERT) console.log(`🔒 SSL: verify-ca with ${path.relative(process.cwd(), env.PGSSLROOTCERT)}`);
    console.log('');

    const t0 = Date.now();

    // 1. Schema-only DDL — perfect for diffing or recreating an empty target.
    await runPgDump(
        [
            '--schema-only',
            '--no-owner',
            '--no-privileges',
            '--no-comments',
            '--schema=public',
        ],
        schemaFile,
        env,
        'schema'
    );

    // 2. Data-only — COPY-format inserts. Re-runnable into the schema above.
    await runPgDump(
        [
            '--data-only',
            '--no-owner',
            '--no-privileges',
            '--column-inserts',     // Use INSERTs with column names (more portable than COPY)
            '--disable-triggers',   // Allow inserts to bypass FK ordering during restore
            '--schema=public',
        ],
        dataFile,
        env,
        'data'
    );

    // 3. Full custom-format archive — restored with pg_restore. Recommended.
    await runPgDumpFile(
        [
            '-Fc',
            '--no-owner',
            '--no-privileges',
            '--schema=public',
            '-f', dumpFile,
        ],
        env,
        'full'
    );

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('');
    console.log(`⏱  Done in ${elapsed}s`);
    console.log('');
    console.log('Restore into another Postgres:');
    console.log(`  pg_restore -d "<NEW_DATABASE_URL>" --no-owner --no-privileges "${path.relative(process.cwd(), dumpFile)}"`);
    console.log('  # …or, plain SQL files:');
    console.log(`  psql "<NEW_DATABASE_URL>" -f "${path.relative(process.cwd(), schemaFile)}"`);
    console.log(`  psql "<NEW_DATABASE_URL>" -f "${path.relative(process.cwd(), dataFile)}"`);
}

main().catch((err) => {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
});
