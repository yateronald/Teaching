require('dotenv').config();
const PostgreSQLDatabase = require('./database/init-postgres');

async function runMigration() {
    const database = new PostgreSQLDatabase();
    
    try {
        console.log('Connecting to database...');
        await database.initialize();
        
        // Ensure migrations table exists
        await database.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename TEXT NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Adding teacher assignment fields to demo_requests table...');
        
        // Check if columns already exist
        const checkColumns = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'demo_requests' 
            AND column_name IN ('teacher_id', 'meeting_link', 'teacher_reminder_sent', 'student_reminder_sent', 'contacted_at', 'demo_scheduled_at', 'notes');
        `;
        
        const existingColumns = await database.all(checkColumns);
        const existingColumnNames = existingColumns.map(row => row.column_name);
        
        // Add columns that don't exist
        if (!existingColumnNames.includes('teacher_id')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN teacher_id INTEGER REFERENCES users(id);
            `);
            console.log('Added teacher_id column');
        }
        
        if (!existingColumnNames.includes('meeting_link')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN meeting_link TEXT;
            `);
            console.log('Added meeting_link column');
        }
        
        if (!existingColumnNames.includes('teacher_reminder_sent')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN teacher_reminder_sent BOOLEAN DEFAULT FALSE;
            `);
            console.log('Added teacher_reminder_sent column');
        }
        
        if (!existingColumnNames.includes('student_reminder_sent')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN student_reminder_sent BOOLEAN DEFAULT FALSE;
            `);
            console.log('Added student_reminder_sent column');
        }

        if (!existingColumnNames.includes('contacted_at')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN contacted_at TIMESTAMP;
            `);
            console.log('Added contacted_at column');
        }

        if (!existingColumnNames.includes('demo_scheduled_at')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN demo_scheduled_at TIMESTAMP;
            `);
            console.log('Added demo_scheduled_at column');
        }

        if (!existingColumnNames.includes('notes')) {
            await database.run(`
                ALTER TABLE demo_requests 
                ADD COLUMN notes TEXT;
            `);
            console.log('Added notes column');
        }
        
        // Add indexes if they don't exist
        try {
            await database.run(`
                CREATE INDEX IF NOT EXISTS idx_demo_requests_teacher_id 
                ON demo_requests(teacher_id);
            `);
            console.log('Added index on teacher_id');
        } catch (err) {
            console.log('Index on teacher_id already exists or error:', err.message);
        }
        
        try {
            await database.run(`
                CREATE INDEX IF NOT EXISTS idx_demo_requests_demo_scheduled_at 
                ON demo_requests(demo_scheduled_at);
            `);
            console.log('Added index on demo_scheduled_at');
        } catch (err) {
            console.log('Index on demo_scheduled_at already exists or error:', err.message);
        }
        
        // Record migration
        await database.run(`
            INSERT INTO migrations (filename, applied_at) 
            VALUES ('add_teacher_assignment_to_demo_requests.sql', NOW())
            ON CONFLICT (filename) DO NOTHING;
        `);
        
        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (database && typeof database.close === 'function') {
            await database.close();
        }
    }
}

runMigration();