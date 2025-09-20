const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            // Create database directory if it doesn't exist
            const dbDir = path.join(__dirname);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Initialize SQLite database
            const dbPath = path.join(__dirname, 'french_teaching.db');
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    // Ensure foreign keys (and cascading deletes) are enforced for this connection
                    this.db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
                        if (pragmaErr) {
                            console.warn('Warning: could not enable SQLite foreign_keys:', pragmaErr.message);
                        }
                        this.createTables()
                            .then(() => this.ensureSchemaUpdates())
                            .then(() => resolve())
                            .catch(reject);
                    });
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split schema into table creation and index creation statements
            const allStatements = schema.split(';').filter(stmt => stmt.trim().length > 0);
            const tableStatements = allStatements.filter(stmt => 
                stmt.trim().toUpperCase().startsWith('CREATE TABLE')
            );
            const indexStatements = allStatements.filter(stmt => 
                stmt.trim().toUpperCase().startsWith('CREATE INDEX')
            );
            
            // First create all tables
            this.executeStatements(tableStatements)
                .then(() => {
                    // Then create all indexes
                    return this.executeStatements(indexStatements);
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    async ensureSchemaUpdates() {
        // Add new columns to schedules table if they don't exist
        const getColumns = (table) => new Promise((resolve, reject) => {
            this.db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(r => r.name));
            });
        });

        // Schedules table column checks
        const scheduleColumns = await getColumns('schedules');
        const scheduleMissing = (name) => !scheduleColumns.includes(name);

        const scheduleStatements = [];
        if (scheduleMissing('location_mode')) {
            scheduleStatements.push("ALTER TABLE schedules ADD COLUMN location_mode TEXT DEFAULT 'physical' NOT NULL");
        }
        if (scheduleMissing('location')) {
            scheduleStatements.push('ALTER TABLE schedules ADD COLUMN location TEXT');
        }
        if (scheduleMissing('link')) {
            scheduleStatements.push('ALTER TABLE schedules ADD COLUMN link TEXT');
        }
        if (scheduleMissing('status')) {
            scheduleStatements.push("ALTER TABLE schedules ADD COLUMN status TEXT DEFAULT 'scheduled' NOT NULL");
        }

        if (scheduleStatements.length > 0) {
            await this.executeStatements(scheduleStatements);
        }

        // Users table: password policy columns
        const userColumns = await getColumns('users');
        const userMissing = (name) => !userColumns.includes(name);
        const userStatements = [];
        if (userMissing('must_change_password')) {
            userStatements.push("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0 NOT NULL");
        }
        if (userMissing('password_changed_at')) {
            userStatements.push('ALTER TABLE users ADD COLUMN password_changed_at DATETIME');
        }
        if (userMissing('password_expires_at')) {
            userStatements.push('ALTER TABLE users ADD COLUMN password_expires_at DATETIME');
        }
        if (userStatements.length > 0) {
            await this.executeStatements(userStatements);
        }

        // Add timetable support for batches
        await this.ensureTimetableSchema();

        // Ensure email change requests schema exists
        await this.ensureEmailChangeSchema();

        // Ensure password reset requests schema exists
        await this.ensurePasswordResetSchema();

        // Ensure performance indexes exist (safe to run multiple times using IF NOT EXISTS)
        const performanceIndexes = [
            // Questions and options ordering
            'CREATE INDEX IF NOT EXISTS idx_questions_quiz_order ON questions(quiz_id, question_order)',
            'CREATE INDEX IF NOT EXISTS idx_question_options_question_order ON question_options(question_id, option_order)',
            // Quizzes filtering and ordering
            'CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status)',
            'CREATE INDEX IF NOT EXISTS idx_quizzes_status_created ON quizzes(status, created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_status ON quizzes(teacher_id, status)',
            'CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_created ON quizzes(teacher_id, created_at DESC)',
            // Quiz-batch assignments
            'CREATE INDEX IF NOT EXISTS idx_quiz_batches_batch ON quiz_batches(batch_id)',
            // Submissions filtering and ordering
            'CREATE INDEX IF NOT EXISTS idx_submissions_status ON quiz_submissions(status)',
            'CREATE INDEX IF NOT EXISTS idx_submissions_quiz_status ON quiz_submissions(quiz_id, status)',
            'CREATE INDEX IF NOT EXISTS idx_submissions_student_submitted ON quiz_submissions(student_id, submitted_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_submissions_quiz_submitted ON quiz_submissions(quiz_id, submitted_at DESC)',
            // Users lists by role and name ordering
            'CREATE INDEX IF NOT EXISTS idx_users_role_name ON users(role, first_name, last_name)',
            // Schedules and resources
            'CREATE INDEX IF NOT EXISTS idx_schedules_batch_start ON schedules(batch_id, start_time)',
            'CREATE INDEX IF NOT EXISTS idx_resources_teacher_created ON resources(teacher_id, created_at DESC)'
        ];

        try {
            await this.executeStatements(performanceIndexes);
        } catch (e) {
            console.warn('Warning ensuring performance indexes:', e.message);
        }
    }

    async executeStatements(statements) {
        return new Promise((resolve, reject) => {
            if (statements.length === 0) {
                resolve();
                return;
            }
            
            let completed = 0;
            const total = statements.length;
            
            statements.forEach((statement, index) => {
                this.db.run(statement.trim(), (err) => {
                    if (err && !err.message.includes('already exists')) {
                        console.error(`Error executing statement ${index + 1}:`, err.message);
                        console.error('Statement:', statement.trim());
                        reject(err);
                        return;
                    }
                    
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            });
        });
    }

    getDatabase() {
        return this.db;
    }

    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // Helper method to run queries with promises
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Helper method to get single row
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async ensureTimetableSchema() {
        // Create batch_timetables table for managing weekly schedules
        const timetableTableSql = `
            CREATE TABLE IF NOT EXISTS batch_timetables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                batch_id INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                timezone TEXT NOT NULL DEFAULT 'UTC',
                location_mode TEXT NOT NULL CHECK (location_mode IN ('online', 'physical')) DEFAULT 'physical',
                location TEXT,
                link TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
            )
        `;

        await this.executeStatements([timetableTableSql]);

        // Add timezone support to batches table
        const batchColumns = await this.all("PRAGMA table_info(batches)");
        const batchColumnNames = batchColumns.map(col => col.name);
        
        const batchUpdates = [];
        if (!batchColumnNames.includes('timezone')) {
            batchUpdates.push("ALTER TABLE batches ADD COLUMN timezone TEXT DEFAULT 'UTC'");
        }
        if (!batchColumnNames.includes('default_location_mode')) {
            batchUpdates.push("ALTER TABLE batches ADD COLUMN default_location_mode TEXT DEFAULT 'physical'");
        }
        if (!batchColumnNames.includes('default_location')) {
            batchUpdates.push("ALTER TABLE batches ADD COLUMN default_location TEXT");
        }
        if (!batchColumnNames.includes('default_link')) {
            batchUpdates.push("ALTER TABLE batches ADD COLUMN default_link TEXT");
        }

        if (batchUpdates.length > 0) {
            await this.executeStatements(batchUpdates);
        }

        // Create indexes for timetable queries
        const timetableIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_batch_timetables_batch ON batch_timetables(batch_id)',
            'CREATE INDEX IF NOT EXISTS idx_batch_timetables_day ON batch_timetables(day_of_week)',
            'CREATE INDEX IF NOT EXISTS idx_batch_timetables_batch_day ON batch_timetables(batch_id, day_of_week)',
            'CREATE INDEX IF NOT EXISTS idx_batch_timetables_active ON batch_timetables(is_active)'
        ];

        await this.executeStatements(timetableIndexes);
    }

    // Ensure email change requests table and indexes
    async ensureEmailChangeSchema() {
        const tableSql = `
            CREATE TABLE IF NOT EXISTS email_change_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                old_email TEXT NOT NULL,
                new_email TEXT NOT NULL,
                code TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                status TEXT NOT NULL CHECK (status IN ('pending','completed','cancelled','expired')) DEFAULT 'pending',
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await this.executeStatements([tableSql]);

        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_ecr_user_status ON email_change_requests(user_id, status)',
            'CREATE INDEX IF NOT EXISTS idx_ecr_expires ON email_change_requests(expires_at)',
            'CREATE INDEX IF NOT EXISTS idx_ecr_user_code ON email_change_requests(user_id, code)'
        ];
        await this.executeStatements(indexes);
    }

    // Helper method to get all rows
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Ensure password reset requests table and indexes
    async ensurePasswordResetSchema() {
        const tableSql = `
            CREATE TABLE IF NOT EXISTS password_reset_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                status TEXT NOT NULL CHECK (status IN ('pending','otp_verified','completed','cancelled','expired')) DEFAULT 'pending',
                expires_at DATETIME NOT NULL,
                reset_token_hash TEXT,
                reset_expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await this.executeStatements([tableSql]);

        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_prr_user_status ON password_reset_requests(user_id, status)',
            'CREATE INDEX IF NOT EXISTS idx_prr_expires ON password_reset_requests(expires_at)',
            'CREATE INDEX IF NOT EXISTS idx_prr_user_code ON password_reset_requests(user_id, code)'
        ];
        await this.executeStatements(indexes);
    }

    // Helper method to get all rows
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Database;