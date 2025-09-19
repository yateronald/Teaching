const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseBetterSQLite3 {
    constructor() {
        this.db = null;
    }

    async initialize() {
        try {
            // Create database directory if it doesn't exist
            const dbDir = path.join(__dirname);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Initialize SQLite database
            const dbPath = path.join(__dirname, 'french_teaching.db');
            this.db = new Database(dbPath);
            
            // Enable foreign keys
            this.db.pragma('foreign_keys = ON');
            
            await this.createTables();
            await this.ensureSchemaUpdates();
            
            console.log('Database initialized successfully with better-sqlite3');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    async createTables() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);
            
            for (const statement of statements) {
                try {
                    this.db.exec(statement);
                } catch (error) {
                    // Ignore table already exists errors
                    if (!error.message.includes('already exists')) {
                        console.error('Error executing statement:', statement);
                        throw error;
                    }
                }
            }
        }
    }

    async ensureSchemaUpdates() {
        const migrationsDir = path.join(__dirname, 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            return;
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            try {
                const migrationPath = path.join(migrationsDir, file);
                const migration = fs.readFileSync(migrationPath, 'utf8');
                
                // Split migration into individual statements
                const statements = migration
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0);
                
                for (const statement of statements) {
                    try {
                        this.db.exec(statement);
                    } catch (error) {
                        // Ignore column already exists errors and other non-critical errors
                        if (!error.message.includes('already exists') && 
                            !error.message.includes('duplicate column name')) {
                            console.warn(`Migration warning for ${file}:`, error.message);
                        }
                    }
                }
                
                console.log(`Applied migration: ${file}`);
            } catch (error) {
                console.error(`Error applying migration ${file}:`, error);
            }
        }
    }

    // Wrapper methods to maintain compatibility with sqlite3 API
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(sql);
                const result = stmt.run(params);
                resolve({ lastID: result.lastInsertRowid, changes: result.changes });
            } catch (error) {
                reject(error);
            }
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(sql);
                const result = stmt.get(params);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(sql);
                const result = stmt.all(params);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    getDatabase() {
        return this;
    }

    async close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DatabaseBetterSQLite3;