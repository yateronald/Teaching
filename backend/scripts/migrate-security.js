const Database = require('../database/init');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const database = new Database();
    
    try {
        await database.initialize();
        console.log('Database initialized successfully');
        
        // Read the migration SQL
        const migrationPath = path.join(__dirname, '../database/migrations/add_account_security.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await database.db.run(statement.trim());
                    console.log('Executed:', statement.trim().substring(0, 50) + '...');
                } catch (error) {
                    if (error.message.includes('duplicate column name')) {
                        console.log('Column already exists, skipping:', statement.trim().substring(0, 50) + '...');
                    } else {
                        throw error;
                    }
                }
            }
        }
        
        console.log('Migration completed successfully!');
        
        // Verify the migration
        const tableInfo = await database.db.all("PRAGMA table_info(users)");
        console.log('Users table columns:', tableInfo.map(col => col.name));
        
        const users = await database.db.all('SELECT id, username, is_active, failed_login_attempts FROM users LIMIT 5');
        console.log('Sample users after migration:', users);
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (database.db) {
            database.db.close();
        }
    }
}

runMigration();