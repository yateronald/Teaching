require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        // tcf_ee_simulations — stores each simulation attempt
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ee_simulations (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            combinaison_id INTEGER NOT NULL REFERENCES tcf_ee_combinaisons(id) ON DELETE CASCADE,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            submitted_at TIMESTAMP,
            time_used_seconds INTEGER,
            total_duration_seconds INTEGER,
            task1_answer TEXT,
            task2_answer TEXT,
            task3_answer TEXT,
            task1_score DECIMAL(4,1),
            task2_score DECIMAL(4,1),
            task3_score DECIMAL(4,1),
            task1_level VARCHAR(5),
            task2_level VARCHAR(5),
            task3_level VARCHAR(5),
            task1_feedback JSONB,
            task2_feedback JSONB,
            task3_feedback JSONB,
            average_score DECIMAL(4,1),
            overall_level VARCHAR(5),
            status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_sim_student ON tcf_ee_simulations(student_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_sim_combinaison ON tcf_ee_simulations(combinaison_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_sim_status ON tcf_ee_simulations(status)');
        console.log('✅ tcf_ee_simulations table created');

        // Verify
        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tcf_ee_simulations' ORDER BY ordinal_position`
        );
        console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));

        console.log('\n✅ EE Simulation migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
