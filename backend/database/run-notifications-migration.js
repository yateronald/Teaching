require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');
const fs = require('fs');
const path = require('path');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', '013_notifications.sql'),
            'utf8'
        );
        const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
        for (const stmt of statements) {
            await db.run(stmt);
        }
        console.log('✅ Notifications migration applied');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await db.close?.();
        process.exit(0);
    }
}

run();
