require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');
const fs = require('fs');
const path = require('path');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        const sqlPath = path.join(__dirname, 'migrations', '012_eo_simulation_partie.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the whole SQL file as one batch — PostgreSQL supports this
        const client = db.getDatabase();
        await client.query(sql);
        console.log('SQL executed.');

        // Verify
        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns 
             WHERE table_name = 'eo_simulations' AND column_name IN ('partie_id', 'tache1_tache_id')
             ORDER BY ordinal_position`
        );
        console.log('\nNew columns added:');
        cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

        console.log('\n✅ EO Partie migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
