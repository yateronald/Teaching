require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 030 (public learner accounts, email keys, Premium). Safe
// to run twice.
//
// One account per inbox is only enforced once no two existing accounts share
// an email key (for example the same Gmail address created twice, with and
// without a dot). If some do, they are listed here and the rule waits: merge or
// rename those accounts, then run this script again.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '030_learner_accounts.sql'), 'utf8');
        await db.run(sql);

        const tables = ['learn_pending_signups', 'learn_codes', 'learn_licenses', 'learn_access_log', 'learn_premium_requests', 'learn_content_log'];
        const found = await db.all(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)", [tables]);
        if (found.length !== tables.length) {
            const missing = tables.filter(t => !found.some(f => f.table_name === t));
            throw new Error(`Tables not created: ${missing.join(', ')}`);
        }

        const duplicates = await db.all(
            `SELECT email_key, array_agg(id ORDER BY id) AS ids, array_agg(email ORDER BY id) AS emails,
                    array_agg(role ORDER BY id) AS roles
               FROM users WHERE email_key IS NOT NULL
              GROUP BY email_key HAVING COUNT(*) > 1 ORDER BY email_key`);

        if (duplicates.length === 0) {
            await db.run('DROP INDEX IF EXISTS users_email_key_idx');
            await db.run('CREATE UNIQUE INDEX IF NOT EXISTS users_email_key_unique ON users (email_key)');
            console.log('  One account per email: enforced (no two accounts share an inbox).');
        } else {
            // Lookups stay fast meanwhile; the sign-up code refuses a taken key anyway.
            await db.run('CREATE INDEX IF NOT EXISTS users_email_key_idx ON users (email_key)');
            console.log(`\n⚠️  ${duplicates.length} inbox(es) have more than one account. The one-account-per-email`);
            console.log('   rule will be switched on once they are merged or renamed. Run this script again then.\n');
            for (const d of duplicates) {
                const rows = d.ids.map((id, i) => `#${id} ${d.emails[i]} (${d.roles[i]})`).join('  ·  ');
                console.log(`   ${d.email_key}:  ${rows}`);
            }
            console.log('');
        }

        const counts = await db.get(
            `SELECT (SELECT COUNT(*) FROM users WHERE role = 'learner')::int AS learners,
                    (SELECT COUNT(*) FROM learn_licenses WHERE revoked_at IS NULL)::int AS licenses`);
        console.log(`  ${counts.learners} website learner(s), ${counts.licenses} active Premium grant(s).`);
        console.log('\n✅ Migration 030 complete — website accounts and Premium are ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
