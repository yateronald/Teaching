const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

class DataMigrator {
    constructor(sqlitePath, postgresConfig) {
        this.sqlitePath = sqlitePath;
        this.postgresConfig = postgresConfig;
        this.sqliteDb = null;
        this.postgresClient = null;
    }

    async initialize() {
        // Initialize SQLite connection
        this.sqliteDb = new sqlite3.Database(this.sqlitePath);
        
        // Initialize PostgreSQL connection
        this.postgresClient = new Client(this.postgresConfig);
        await this.postgresClient.connect();
        
        console.log('✅ Database connections initialized');
    }

    async close() {
        if (this.sqliteDb) {
            this.sqliteDb.close();
        }
        if (this.postgresClient) {
            await this.postgresClient.end();
        }
    }

    async getSQLiteData(tableName) {
        return new Promise((resolve, reject) => {
            this.sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async insertPostgreSQLData(tableName, data) {
        if (data.length === 0) {
            console.log(`   ℹ️  No data to migrate for ${tableName}`);
            return;
        }

        const columns = Object.keys(data[0]);
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        const insertSQL = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
        
        console.log(`   📝 Inserting ${data.length} records into ${tableName}...`);
        
        let successCount = 0;
        let skipCount = 0;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const values = columns.map(col => {
                let value = row[col];
                
                // Handle special data type conversions
                if (value === null || value === undefined) {
                    return null;
                }
                
                // Convert SQLite boolean integers to PostgreSQL booleans for specific boolean columns
                if (typeof value === 'number' && (value === 0 || value === 1)) {
                    // Only convert to boolean for columns that are actually BOOLEAN in PostgreSQL
                    const booleanColumns = ['is_active', 'is_correct', 'randomize_questions', 'randomize_options', 'auto_submit'];
                    if (booleanColumns.includes(col)) {
                        return value === 1;
                    }
                    // For INTEGER columns like must_change_password, failed_login_attempts, keep as number
                }
                
                // Convert SQLite string booleans to PostgreSQL booleans
                if (typeof value === 'string') {
                    if (value === 'true' || value === 'false') {
                        return value === 'true';
                    }
                }
                
                return value;
            });
            
            try {
                await this.postgresClient.query(insertSQL, values);
                successCount++;
            } catch (error) {
                if (error.code === '23503') {
                    // Foreign key constraint violation - skip this record
                    console.warn(`   ⚠️  Skipping row ${i + 1} due to missing foreign key reference: ${error.detail}`);
                    skipCount++;
                    continue;
                } else {
                    console.error(`   ❌ Failed to insert row ${i + 1} in ${tableName}:`, error.message);
                    console.error('   Row data:', row);
                    throw error;
                }
            }
        }
        
        console.log(`   ✅ Successfully migrated ${successCount} records to ${tableName}`);
        if (skipCount > 0) {
            console.log(`   ⚠️  Skipped ${skipCount} records due to foreign key constraints`);
        }
    }

    async resetSequences(tableName, data) {
        if (data.length === 0) return;
        
        // Reset the sequence for SERIAL columns to continue from the highest migrated ID
        const maxId = Math.max(...data.map(row => row.id || 0));
        if (maxId > 0) {
            try {
                await this.postgresClient.query(`SELECT setval('${tableName}_id_seq', ${maxId})`);
                console.log(`   🔄 Reset sequence for ${tableName} to ${maxId}`);
            } catch (error) {
                console.warn(`   ⚠️  Could not reset sequence for ${tableName}:`, error.message);
            }
        }
    }

    async migrateTable(tableName) {
        console.log(`\n🔄 Migrating table: ${tableName}`);
        
        try {
            // Get data from SQLite
            const data = await this.getSQLiteData(tableName);
            console.log(`   📊 Found ${data.length} records in SQLite`);
            
            // Insert data into PostgreSQL
            await this.insertPostgreSQLData(tableName, data);
            
            // Reset sequences for auto-increment columns
            await this.resetSequences(tableName, data);
            
        } catch (error) {
            console.error(`❌ Failed to migrate ${tableName}:`, error.message);
            throw error;
        }
    }

    async verifyMigration() {
        console.log('\n🔍 Verifying data migration...');
        
        // Load schema analysis to get table list
        const analysisPath = path.join(__dirname, '../database/sqlite-schema-analysis.json');
        const schemaAnalysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        const verificationResults = {};
        
        for (const tableName of Object.keys(schemaAnalysis.tables)) {
            try {
                // Count records in SQLite
                const sqliteCount = await new Promise((resolve, reject) => {
                    this.sqliteDb.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
                        if (err) reject(err);
                        else resolve(row.count);
                    });
                });
                
                // Count records in PostgreSQL
                const postgresResult = await this.postgresClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                const postgresCount = parseInt(postgresResult.rows[0].count);
                
                verificationResults[tableName] = {
                    sqlite: sqliteCount,
                    postgres: postgresCount,
                    match: sqliteCount === postgresCount
                };
                
                const status = sqliteCount === postgresCount ? '✅' : '❌';
                console.log(`   ${status} ${tableName}: SQLite(${sqliteCount}) → PostgreSQL(${postgresCount})`);
                
            } catch (error) {
                console.error(`   ❌ Error verifying ${tableName}:`, error.message);
                verificationResults[tableName] = {
                    sqlite: 0,
                    postgres: 0,
                    match: false,
                    error: error.message
                };
            }
        }
        
        const totalTables = Object.keys(verificationResults).length;
        const successfulTables = Object.values(verificationResults).filter(r => r.match).length;
        
        console.log(`\n📊 Migration Verification Summary:`);
        console.log(`   Total tables: ${totalTables}`);
        console.log(`   Successfully migrated: ${successfulTables}`);
        console.log(`   Failed: ${totalTables - successfulTables}`);
        
        if (successfulTables === totalTables) {
            console.log('🎉 All data migrated successfully!');
        } else {
            console.log('⚠️  Some tables had migration issues. Please review the logs above.');
        }
        
        return verificationResults;
    }

    async migrateAllData() {
        console.log('🚀 Starting data migration from SQLite to PostgreSQL...');
        
        // Load schema analysis to get table order
        const analysisPath = path.join(__dirname, '../database/sqlite-schema-analysis.json');
        if (!fs.existsSync(analysisPath)) {
            throw new Error('Schema analysis file not found. Run analyze-sqlite-schema.js first.');
        }
        
        const schemaAnalysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        // Define migration order to respect foreign key dependencies
        const migrationOrder = [
            'users',           // No dependencies
            'batches',         // Depends on users
            'batch_students',  // Depends on batches, users
            'batch_timetables', // Depends on batches
            'class_schedules', // Depends on batches
            'quizzes',         // Depends on users
            'questions',       // Depends on quizzes
            'question_options', // Depends on questions
            'quiz_batches',    // Depends on quizzes, batches
            'quiz_submissions', // Depends on quizzes, users
            'student_answers', // Depends on quiz_submissions, questions
            'quiz_reminders_sent', // Depends on quizzes
            'resources',       // Depends on users, batches
            'schedules',       // Depends on batches
            'email_change_requests', // Depends on users
            'password_reset_requests', // Depends on users
            'migrations'       // No dependencies
        ];
        
        // Filter to only include tables that exist in the schema
        const tablesToMigrate = migrationOrder.filter(table => 
            schemaAnalysis.tables.hasOwnProperty(table)
        );
        
        console.log(`📋 Migrating ${tablesToMigrate.length} tables in dependency order...`);
        
        // Migrate each table
        for (const tableName of tablesToMigrate) {
            await this.migrateTable(tableName);
        }
        
        // Verify migration
        const verificationResults = await this.verifyMigration();
        
        console.log('\n🎉 Data migration completed!');
        return verificationResults;
    }
}

async function migrateData() {
    const sqlitePath = path.join(__dirname, '../database/french_teaching.db');
    const postgresConfig = {
        user: 'postgres',
        host: 'localhost',
        database: 'Teaching',
        password: '10108924',
        port: 5432,
    };
    
    if (!fs.existsSync(sqlitePath)) {
        console.error('❌ SQLite database not found at:', sqlitePath);
        console.log('Make sure the backend server has been started at least once to create the database.');
        return;
    }
    
    const migrator = new DataMigrator(sqlitePath, postgresConfig);
    
    try {
        await migrator.initialize();
        const results = await migrator.migrateAllData();
        
        console.log('\n📄 Migration completed. Summary saved to migration-results.json');
        fs.writeFileSync(
            path.join(__dirname, '../database/migration-results.json'),
            JSON.stringify(results, null, 2)
        );
        
    } catch (error) {
        console.error('❌ Data migration failed:', error.message);
        throw error;
    } finally {
        await migrator.close();
    }
}

// Export for use in other scripts
module.exports = { DataMigrator, migrateData };

// Run if called directly
if (require.main === module) {
    migrateData().catch(console.error);
}