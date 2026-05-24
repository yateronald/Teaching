/**
 * backup-schema.js
 *
 * Connects to the live Aiven PostgreSQL database (using credentials from
 * backend/.env) and dumps a complete schema snapshot to local files:
 *
 *   - schema-backup-<timestamp>.json   →  machine-readable, full detail
 *   - schema-backup-<timestamp>.md     →  human-readable summary
 *
 * What it captures, per table (public schema only):
 *   • columns:        name, data_type, udt_name, character_maximum_length,
 *                     numeric_precision, numeric_scale, is_nullable,
 *                     column_default, ordinal_position
 *   • primary key:    constraint name + ordered column list
 *   • foreign keys:   local cols → referenced table.cols + on_update/on_delete
 *   • unique keys:    constraint name + ordered column list
 *   • check constraints: name + clause
 *   • indexes:        name, definition (full CREATE INDEX statement)
 *   • row count:      live SELECT COUNT(*) at backup time
 *
 * Run:
 *   cd backend
 *   node database/backup-schema.js
 *
 * Output goes to:  backend/database/backups/
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const PostgreSQLDatabase = require('./init-postgres');

const OUT_DIR = path.join(__dirname, 'backups');
const SCHEMA = 'public';

function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
    );
}

async function fetchTables(db) {
    const rows = await db.all(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = $1 AND table_type = 'BASE TABLE'
         ORDER BY table_name`,
        [SCHEMA]
    );
    return rows.map((r) => r.table_name);
}

async function fetchColumns(db, table) {
    return db.all(
        `SELECT
             column_name,
             ordinal_position,
             data_type,
             udt_name,
             character_maximum_length,
             numeric_precision,
             numeric_scale,
             is_nullable,
             column_default
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [SCHEMA, table]
    );
}

async function fetchPrimaryKey(db, table) {
    const rows = await db.all(
        `SELECT tc.constraint_name, kcu.column_name, kcu.ordinal_position
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema    = kcu.table_schema
         WHERE tc.table_schema = $1
           AND tc.table_name   = $2
           AND tc.constraint_type = 'PRIMARY KEY'
         ORDER BY kcu.ordinal_position`,
        [SCHEMA, table]
    );
    if (rows.length === 0) return null;
    return {
        name: rows[0].constraint_name,
        columns: rows.map((r) => r.column_name),
    };
}

async function fetchForeignKeys(db, table) {
    const rows = await db.all(
        `SELECT
             tc.constraint_name,
             kcu.column_name,
             kcu.ordinal_position,
             ccu.table_name  AS foreign_table_name,
             ccu.column_name AS foreign_column_name,
             rc.update_rule,
             rc.delete_rule
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema    = kcu.table_schema
         JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
             AND ccu.table_schema    = tc.table_schema
         JOIN information_schema.referential_constraints rc
              ON rc.constraint_name  = tc.constraint_name
             AND rc.constraint_schema = tc.table_schema
         WHERE tc.table_schema = $1
           AND tc.table_name   = $2
           AND tc.constraint_type = 'FOREIGN KEY'
         ORDER BY tc.constraint_name, kcu.ordinal_position`,
        [SCHEMA, table]
    );

    const grouped = new Map();
    for (const r of rows) {
        if (!grouped.has(r.constraint_name)) {
            grouped.set(r.constraint_name, {
                name: r.constraint_name,
                columns: [],
                referenced_table: r.foreign_table_name,
                referenced_columns: [],
                on_update: r.update_rule,
                on_delete: r.delete_rule,
            });
        }
        const fk = grouped.get(r.constraint_name);
        fk.columns.push(r.column_name);
        fk.referenced_columns.push(r.foreign_column_name);
    }
    return Array.from(grouped.values());
}

async function fetchUniqueConstraints(db, table) {
    const rows = await db.all(
        `SELECT tc.constraint_name, kcu.column_name, kcu.ordinal_position
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema    = kcu.table_schema
         WHERE tc.table_schema = $1
           AND tc.table_name   = $2
           AND tc.constraint_type = 'UNIQUE'
         ORDER BY tc.constraint_name, kcu.ordinal_position`,
        [SCHEMA, table]
    );

    const grouped = new Map();
    for (const r of rows) {
        if (!grouped.has(r.constraint_name)) {
            grouped.set(r.constraint_name, { name: r.constraint_name, columns: [] });
        }
        grouped.get(r.constraint_name).columns.push(r.column_name);
    }
    return Array.from(grouped.values());
}

async function fetchCheckConstraints(db, table) {
    return db.all(
        `SELECT cc.constraint_name, cc.check_clause
         FROM information_schema.check_constraints cc
         JOIN information_schema.table_constraints tc
              ON tc.constraint_name = cc.constraint_name
             AND tc.constraint_schema = cc.constraint_schema
         WHERE tc.table_schema = $1
           AND tc.table_name   = $2
           AND tc.constraint_type = 'CHECK'
         ORDER BY cc.constraint_name`,
        [SCHEMA, table]
    );
}

async function fetchIndexes(db, table) {
    return db.all(
        `SELECT indexname AS name, indexdef AS definition
         FROM pg_indexes
         WHERE schemaname = $1 AND tablename = $2
         ORDER BY indexname`,
        [SCHEMA, table]
    );
}

async function fetchRowCount(db, table) {
    try {
        // Use a quoted identifier defensively in case any table name needs it
        const r = await db.get(`SELECT COUNT(*)::bigint AS cnt FROM "${table}"`);
        return Number(r.cnt);
    } catch (err) {
        return { error: err.message };
    }
}

function buildMarkdown(snapshot) {
    const lines = [];
    lines.push(`# Database schema backup`);
    lines.push('');
    lines.push(`- **Generated**: ${snapshot.generated_at}`);
    lines.push(`- **Database**: \`${snapshot.database.name}\` @ \`${snapshot.database.host}:${snapshot.database.port}\``);
    lines.push(`- **Schema**: \`${snapshot.database.schema}\``);
    lines.push(`- **Tables**: ${snapshot.tables.length}`);
    const totalRows = snapshot.tables.reduce(
        (sum, t) => sum + (typeof t.row_count === 'number' ? t.row_count : 0),
        0
    );
    lines.push(`- **Total rows**: ${totalRows.toLocaleString()}`);
    lines.push('');
    lines.push('## Table of contents');
    lines.push('');
    for (const t of snapshot.tables) {
        const safe = t.name.replace(/_/g, '\\_');
        const anchor = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        lines.push(`- [\`${safe}\`](#${anchor}) — ${typeof t.row_count === 'number' ? t.row_count : '?'} rows, ${t.columns.length} cols`);
    }
    lines.push('');

    for (const t of snapshot.tables) {
        lines.push(`## \`${t.name}\``);
        lines.push('');
        lines.push(`**Rows:** ${typeof t.row_count === 'number' ? t.row_count : JSON.stringify(t.row_count)}`);
        lines.push('');
        lines.push('### Columns');
        lines.push('');
        lines.push('| # | Name | Type | Nullable | Default |');
        lines.push('|---|------|------|----------|---------|');
        for (const c of t.columns) {
            const typeStr = c.character_maximum_length
                ? `${c.data_type}(${c.character_maximum_length})`
                : c.numeric_precision && c.data_type === 'numeric'
                    ? `${c.data_type}(${c.numeric_precision},${c.numeric_scale ?? 0})`
                    : c.data_type;
            const def = c.column_default ? `\`${String(c.column_default).replace(/\|/g, '\\|')}\`` : '';
            lines.push(`| ${c.ordinal_position} | \`${c.column_name}\` | \`${typeStr}\` | ${c.is_nullable} | ${def} |`);
        }
        lines.push('');

        if (t.primary_key) {
            lines.push(`**Primary key:** \`${t.primary_key.name}\` → (${t.primary_key.columns.map(c => `\`${c}\``).join(', ')})`);
            lines.push('');
        }

        if (t.foreign_keys.length) {
            lines.push('### Foreign keys');
            lines.push('');
            for (const fk of t.foreign_keys) {
                lines.push(
                    `- \`${fk.name}\`: (${fk.columns.map(c => `\`${c}\``).join(', ')}) → ` +
                    `\`${fk.referenced_table}\`(${fk.referenced_columns.map(c => `\`${c}\``).join(', ')}) ` +
                    `*(ON UPDATE ${fk.on_update}, ON DELETE ${fk.on_delete})*`
                );
            }
            lines.push('');
        }

        if (t.unique_constraints.length) {
            lines.push('### Unique constraints');
            lines.push('');
            for (const uc of t.unique_constraints) {
                lines.push(`- \`${uc.name}\`: (${uc.columns.map(c => `\`${c}\``).join(', ')})`);
            }
            lines.push('');
        }

        if (t.check_constraints.length) {
            lines.push('### Check constraints');
            lines.push('');
            for (const cc of t.check_constraints) {
                lines.push(`- \`${cc.constraint_name}\`: \`${cc.check_clause}\``);
            }
            lines.push('');
        }

        if (t.indexes.length) {
            lines.push('### Indexes');
            lines.push('');
            for (const idx of t.indexes) {
                lines.push(`- \`${idx.name}\``);
                lines.push('  ```sql');
                lines.push(`  ${idx.definition};`);
                lines.push('  ```');
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('');
    }
    return lines.join('\n');
}

async function main() {
    const startedAt = Date.now();
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    // Build the same connection config as the live server, but DO NOT call
    // PostgreSQLDatabase.initialize() — that would run idempotent migrations
    // (CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN…) which we want to
    // avoid during a read-only schema backup.
    const config = new PostgreSQLDatabase().getConfig();
    const client = new Client(config);
    console.log('🔌 Connecting to PostgreSQL…');
    await client.connect();

    // Tiny shim so the rest of the script can keep using db.all / db.get.
    const database = {
        all: async (sql, params = []) => (await client.query(sql, params)).rows,
        get: async (sql, params = []) => (await client.query(sql, params)).rows[0],
        close: async () => client.end(),
    };

    const ping = await client.query('SELECT current_database() AS name, current_user AS usr, version() AS v');
    const dbInfo = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: ping.rows[0].name,
        user: ping.rows[0].usr,
        schema: SCHEMA,
        server_version: ping.rows[0].v,
    };
    console.log(`✅ Connected to ${dbInfo.user}@${dbInfo.host}:${dbInfo.port}/${dbInfo.name}`);

    const tables = await fetchTables(database);
    console.log(`📋 Found ${tables.length} tables in schema "${SCHEMA}"`);

    const snapshot = {
        generated_at: new Date().toISOString(),
        database: dbInfo,
        tables: [],
    };

    let i = 0;
    for (const t of tables) {
        i++;
        process.stdout.write(`  (${i}/${tables.length}) ${t} … `);
        const [columns, primary_key, foreign_keys, unique_constraints, check_constraints, indexes, row_count] =
            await Promise.all([
                fetchColumns(database, t),
                fetchPrimaryKey(database, t),
                fetchForeignKeys(database, t),
                fetchUniqueConstraints(database, t),
                fetchCheckConstraints(database, t),
                fetchIndexes(database, t),
                fetchRowCount(database, t),
            ]);
        snapshot.tables.push({
            name: t,
            row_count,
            columns,
            primary_key,
            foreign_keys,
            unique_constraints,
            check_constraints,
            indexes,
        });
        console.log(
            `${columns.length} cols, ${typeof row_count === 'number' ? row_count : '?'} rows, ` +
            `${foreign_keys.length} fks, ${indexes.length} indexes`
        );
    }

    const stamp = timestamp();
    const jsonFile = path.join(OUT_DIR, `schema-backup-${stamp}.json`);
    const mdFile = path.join(OUT_DIR, `schema-backup-${stamp}.md`);
    fs.writeFileSync(jsonFile, JSON.stringify(snapshot, null, 2), 'utf8');
    fs.writeFileSync(mdFile, buildMarkdown(snapshot), 'utf8');

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log('');
    console.log(`💾 JSON written: ${path.relative(process.cwd(), jsonFile)}`);
    console.log(`📝 MD   written: ${path.relative(process.cwd(), mdFile)}`);
    console.log(`⏱  Done in ${elapsed}s`);

    await database.close();
}

main().catch((err) => {
    console.error('❌ Backup failed:', err);
    process.exit(1);
});
