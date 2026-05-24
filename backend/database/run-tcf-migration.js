require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        // 1. Categories
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_categories (
            id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL UNIQUE, description TEXT,
            icon VARCHAR(50), display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.run(`INSERT INTO tcf_categories (name, description, icon, display_order) VALUES
            ('Compréhension Écrite', 'Reading comprehension — TCF Canada', 'ReadOutlined', 1),
            ('Expression Écrite', 'Written expression — TCF Canada', 'EditOutlined', 2)
            ON CONFLICT (name) DO NOTHING`);
        console.log('✅ tcf_categories created + seeded');

        // 2. CE Series
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ce_series (
            id SERIAL PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL, description TEXT, duration_minutes INTEGER NOT NULL,
            total_questions INTEGER DEFAULT 0, total_points NUMERIC DEFAULT 0,
            cefr_thresholds JSONB NOT NULL DEFAULT '{"A1":0,"A2":0,"B1":0,"B2":0,"C1":0,"C2":0}',
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ce_series_category ON tcf_ce_series(category_id)');
        console.log('✅ tcf_ce_series created');

        // 3. CE Questions
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ce_questions (
            id SERIAL PRIMARY KEY, series_id INTEGER NOT NULL REFERENCES tcf_ce_series(id) ON DELETE CASCADE,
            question_order INTEGER NOT NULL, image_url TEXT, question_text TEXT NOT NULL,
            option_a TEXT NOT NULL, option_b TEXT NOT NULL, option_c TEXT NOT NULL, option_d TEXT NOT NULL,
            correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
            cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
            points NUMERIC NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ce_questions_series ON tcf_ce_questions(series_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ce_questions_series_order ON tcf_ce_questions(series_id, question_order)');
        console.log('✅ tcf_ce_questions created');

        // 4. CE Series Assignments
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ce_series_assignments (
            id SERIAL PRIMARY KEY, series_id INTEGER NOT NULL REFERENCES tcf_ce_series(id) ON DELETE CASCADE,
            student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CHECK ((student_id IS NOT NULL AND batch_id IS NULL) OR (student_id IS NULL AND batch_id IS NOT NULL))
        )`);
        await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ce_sa_student ON tcf_ce_series_assignments(series_id, student_id) WHERE student_id IS NOT NULL');
        await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ce_sa_batch ON tcf_ce_series_assignments(series_id, batch_id) WHERE batch_id IS NOT NULL');
        console.log('✅ tcf_ce_series_assignments created');

        // 5. Category Assignments
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_category_assignments (
            id SERIAL PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
            student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CHECK ((student_id IS NOT NULL AND batch_id IS NULL) OR (student_id IS NULL AND batch_id IS NOT NULL))
        )`);
        await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ca_student ON tcf_category_assignments(category_id, student_id) WHERE student_id IS NOT NULL');
        await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ca_batch ON tcf_category_assignments(category_id, batch_id) WHERE batch_id IS NOT NULL');
        console.log('✅ tcf_category_assignments created');

        // Verify
        const cats = await db.all('SELECT id, name FROM tcf_categories ORDER BY display_order');
        console.log('Categories:', cats.map(c => `${c.id}: ${c.name}`).join(', '));
        const tables = await db.all("SELECT tablename FROM pg_tables WHERE tablename LIKE 'tcf_%' ORDER BY tablename");
        console.log('TCF tables:', tables.map(t => t.tablename).join(', '));

        console.log('\n✅ All TCF tables created successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
