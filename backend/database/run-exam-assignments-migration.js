require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        // Create tcf_exam_assignments table
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_exam_assignments (
            id SERIAL PRIMARY KEY,
            content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
                'category',
                'ce_series', 'co_series',
                'ee_year', 'ee_month', 'ee_combinaison',
                'eo_year', 'eo_month', 'eo_partie'
            )),
            content_id INTEGER NOT NULL,
            student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
            expires_at TIMESTAMP,
            assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CHECK (student_id IS NOT NULL OR batch_id IS NOT NULL)
        )`);
        console.log('✅ tcf_exam_assignments table created');

        // Unique indexes to prevent duplicates
        await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ea_student
            ON tcf_exam_assignments(content_type, content_id, student_id) WHERE student_id IS NOT NULL`);
        await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ea_batch
            ON tcf_exam_assignments(content_type, content_id, batch_id) WHERE batch_id IS NOT NULL`);

        // Query indexes
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ea_content ON tcf_exam_assignments(content_type, content_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ea_student_id ON tcf_exam_assignments(student_id) WHERE student_id IS NOT NULL');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ea_batch_id ON tcf_exam_assignments(batch_id) WHERE batch_id IS NOT NULL');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ea_expires ON tcf_exam_assignments(expires_at) WHERE expires_at IS NOT NULL');
        console.log('✅ Indexes created');

        // Verify
        const tables = await db.all("SELECT tablename FROM pg_tables WHERE tablename LIKE 'tcf_exam%' ORDER BY tablename");
        console.log('Tables:', tables.map(t => t.tablename).join(', '));

        const cols = await db.all(`
            SELECT column_name, data_type FROM information_schema.columns
            WHERE table_name = 'tcf_exam_assignments' ORDER BY ordinal_position
        `);
        console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
