require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 028 (seats taken outside the site, display of the seats left).
// Needs migration 026 (marketing) first. Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const marketing = await db.get(
            "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotions'");
        if (!marketing) throw new Error('promotions is missing: run run-promotions-migration.js first.');

        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '028_promotion_seats.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'promotions' AND column_name IN ('seats_offline', 'seats_display') ORDER BY 1");
        if (cols.length !== 2) throw new Error('The new columns were not created');
        const counts = await db.get(
            "SELECT COUNT(*)::int AS campaigns, COUNT(*) FILTER (WHERE seats_display = 'never')::int AS hidden FROM promotions");
        console.log(`  promotions: ${cols.map(c => c.column_name).join(', ')} added — ${counts.campaigns} campaign(s), ${counts.hidden} with hidden seats`);

        console.log('\n✅ Migration 028 complete — seats taken outside the site are ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
