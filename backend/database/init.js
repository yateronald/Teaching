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

        const columns = await getColumns('schedules');
        const missing = (name) => !columns.includes(name);

        const statements = [];
        if (missing('location_mode')) {
            statements.push("ALTER TABLE schedules ADD COLUMN location_mode TEXT DEFAULT 'physical' NOT NULL");
        }
        if (missing('location')) {
            statements.push('ALTER TABLE schedules ADD COLUMN location TEXT');
        }
        if (missing('link')) {
            statements.push('ALTER TABLE schedules ADD COLUMN link TEXT');
        }
        if (missing('status')) {
            statements.push("ALTER TABLE schedules ADD COLUMN status TEXT DEFAULT 'scheduled' NOT NULL");
        }

        if (statements.length > 0) {
            await this.executeStatements(statements);
        }

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