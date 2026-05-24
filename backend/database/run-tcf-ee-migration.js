require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        // 1. Seed EE category
        await db.run(`INSERT INTO tcf_categories (name, description, icon, display_order)
            VALUES ('Expression Écrite', 'Written expression — TCF Canada', 'FormOutlined', 4)
            ON CONFLICT (name) DO NOTHING`);
        console.log('✅ Expression Écrite category seeded');

        // 2. tcf_ee_years
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ee_years (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
            year INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(category_id, year)
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_years_category ON tcf_ee_years(category_id)');
        console.log('✅ tcf_ee_years created');

        // 3. tcf_ee_months
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ee_months (
            id SERIAL PRIMARY KEY,
            year_id INTEGER NOT NULL REFERENCES tcf_ee_years(id) ON DELETE CASCADE,
            month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
            month_name VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(year_id, month)
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_months_year ON tcf_ee_months(year_id)');
        console.log('✅ tcf_ee_months created');

        // 4. tcf_ee_combinaisons
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ee_combinaisons (
            id SERIAL PRIMARY KEY,
            month_id INTEGER NOT NULL REFERENCES tcf_ee_months(id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_combinaisons_month ON tcf_ee_combinaisons(month_id)');
        console.log('✅ tcf_ee_combinaisons created');

        // 5. tcf_ee_taches
        await db.run(`CREATE TABLE IF NOT EXISTS tcf_ee_taches (
            id SERIAL PRIMARY KEY,
            combinaison_id INTEGER NOT NULL REFERENCES tcf_ee_combinaisons(id) ON DELETE CASCADE,
            task_number INTEGER NOT NULL CHECK (task_number IN (1, 2, 3)),
            task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('message_court', 'narration', 'argumentation')),
            prompt_text TEXT NOT NULL,
            argument_text_1 TEXT,
            argument_text_2 TEXT,
            min_words INTEGER NOT NULL,
            max_words INTEGER NOT NULL,
            duration_minutes INTEGER NOT NULL,
            correction_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(combinaison_id, task_number)
        )`);
        await db.run('CREATE INDEX IF NOT EXISTS idx_tcf_ee_taches_combinaison ON tcf_ee_taches(combinaison_id)');
        console.log('✅ tcf_ee_taches created');

        // Verify
        const cats = await db.all('SELECT id, name FROM tcf_categories ORDER BY display_order');
        console.log('Categories:', cats.map(c => `${c.id}: ${c.name}`).join(', '));
        const tables = await db.all("SELECT tablename FROM pg_tables WHERE tablename LIKE 'tcf_ee%' ORDER BY tablename");
        console.log('TCF EE tables:', tables.map(t => t.tablename).join(', '));

        console.log('\n✅ All TCF EE tables created successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
