const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class SQLiteToPostgreSQLConverter {
    constructor() {
        this.typeMapping = {
            'INTEGER': 'INTEGER',
            'INTEGER PRIMARY KEY': 'SERIAL PRIMARY KEY',
            'INTEGER PRIMARY KEY AUTOINCREMENT': 'SERIAL PRIMARY KEY',
            'TEXT': 'TEXT',
            'VARCHAR(50)': 'VARCHAR(50)',
            'VARCHAR(100)': 'VARCHAR(100)',
            'VARCHAR(200)': 'VARCHAR(200)',
            'VARCHAR(255)': 'VARCHAR(255)',
            'DATETIME': 'TIMESTAMP',
            'BOOLEAN': 'BOOLEAN',
            'REAL': 'NUMERIC',
            'DECIMAL(5,2)': 'DECIMAL(5,2)',
            'BLOB': 'BYTEA',
            'NUMERIC': 'NUMERIC',
            'FLOAT': 'REAL'
        };

        this.defaultMapping = {
            'CURRENT_TIMESTAMP': 'CURRENT_TIMESTAMP',
            'TRUE': 'TRUE',
            'FALSE': 'FALSE'
        };
    }

    convertDataType(sqliteType) {
        // Handle special cases first
        if (sqliteType.includes('PRIMARY KEY AUTOINCREMENT')) {
            return 'SERIAL PRIMARY KEY';
        }
        if (sqliteType.includes('PRIMARY KEY')) {
            return 'SERIAL PRIMARY KEY';
        }
        
        return this.typeMapping[sqliteType] || sqliteType;
    }

    convertDefaultValue(defaultValue) {
        if (!defaultValue) return null;
        
        // Remove quotes from string defaults
        if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
            return defaultValue;
        }
        
        return this.defaultMapping[defaultValue] || defaultValue;
    }

    generatePostgreSQLSchema(schemaAnalysis) {
        let sql = `-- PostgreSQL Schema for French Teaching Platform
-- Generated from SQLite schema analysis
-- Migration Date: ${new Date().toISOString()}

-- Enable UUID extension (for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;

        // Generate table creation statements
        const tables = schemaAnalysis.tables;
        const tableOrder = this.getTableCreationOrder(tables);

        sql += '-- Table creation statements\n';
        for (const tableName of tableOrder) {
            const table = tables[tableName];
            sql += this.generateTableSQL(tableName, table);
            sql += '\n';
        }

        // Generate indexes AFTER all tables are created
        sql += '\n-- Indexes for performance optimization\n';
        for (const tableName of tableOrder) {
            const table = tables[tableName];
            const indexSQL = this.generateIndexSQL(tableName, table);
            if (indexSQL.trim()) {
                sql += indexSQL;
                sql += '\n';
            }
        }

        return sql;
    }

    getTableCreationOrder(tables) {
        // Define dependency order to avoid foreign key constraint issues
        const dependencyOrder = [
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

        // Return tables in dependency order, with any missing tables at the end
        const allTables = Object.keys(tables);
        const orderedTables = dependencyOrder.filter(table => allTables.includes(table));
        const remainingTables = allTables.filter(table => !dependencyOrder.includes(table));
        
        return [...orderedTables, ...remainingTables];
    }

    generateTableSQL(tableName, table) {
        let sql = `-- Table: ${tableName}\n`;
        sql += `CREATE TABLE ${tableName} (\n`;

        const columnDefinitions = [];

        // Process columns
        for (const column of table.columns) {
            let columnDef = `    ${column.name}`;
            
            // Convert data type - handle primary key specially
            if (column.primaryKey) {
                columnDef += ` SERIAL PRIMARY KEY`;
            } else {
                let dataType = this.convertDataType(column.type);
                columnDef += ` ${dataType}`;

                // Handle constraints for non-primary key columns
                if (column.notNull) {
                    columnDef += ' NOT NULL';
                }

                // Handle default values
                if (column.defaultValue) {
                    const defaultVal = this.convertDefaultValue(column.defaultValue);
                    if (defaultVal) {
                        columnDef += ` DEFAULT ${defaultVal}`;
                    }
                }
            }

            columnDefinitions.push(columnDef);
        }

        sql += columnDefinitions.join(',\n');

        // Add foreign key constraints
        if (table.foreignKeys && table.foreignKeys.length > 0) {
            sql += ',\n';
            const fkConstraints = table.foreignKeys.map(fk => {
                let constraint = `    CONSTRAINT fk_${tableName}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencedTable}(${fk.referencedColumn})`;
                
                if (fk.onDelete && fk.onDelete !== 'NO ACTION') {
                    constraint += ` ON DELETE ${fk.onDelete}`;
                }
                if (fk.onUpdate && fk.onUpdate !== 'NO ACTION') {
                    constraint += ` ON UPDATE ${fk.onUpdate}`;
                }
                
                return constraint;
            });
            sql += fkConstraints.join(',\n');
        }

        // Add unique constraints from SQLite autoindex
        const uniqueConstraints = this.extractUniqueConstraints(table.indexes);
        if (uniqueConstraints.length > 0) {
            sql += ',\n';
            sql += uniqueConstraints.map(constraint => 
                `    CONSTRAINT ${constraint.name} UNIQUE (${constraint.columns.join(', ')})`
            ).join(',\n');
        }

        sql += '\n);\n\n';

        return sql;
    }

    extractUniqueConstraints(indexes) {
        const uniqueConstraints = [];
        
        for (const [indexName, indexData] of Object.entries(indexes)) {
            if (indexData.unique && indexName.startsWith('sqlite_autoindex_')) {
                // Convert SQLite autoindex to PostgreSQL unique constraint
                const constraintName = indexName.replace('sqlite_autoindex_', 'uk_');
                uniqueConstraints.push({
                    name: constraintName,
                    columns: indexData.columns
                });
            }
        }
        
        return uniqueConstraints;
    }

    generateIndexSQL(tableName, table) {
        let sql = '';
        
        for (const [indexName, indexData] of Object.entries(table.indexes)) {
            // Skip SQLite autoindexes (they become unique constraints)
            if (indexName.startsWith('sqlite_autoindex_')) {
                continue;
            }

            const uniqueClause = indexData.unique ? 'UNIQUE ' : '';
            const columns = indexData.columns.join(', ');
            
            sql += `CREATE ${uniqueClause}INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns});\n`;
        }
        
        return sql;
    }

    async executeSchema(postgresConfig, schemaSQL) {
        const client = new Client(postgresConfig);
        
        try {
            await client.connect();
            console.log('✅ Connected to PostgreSQL');

            // Split schema into individual statements, preserving CREATE TABLE blocks
            const statements = this.parseSchemaStatements(schemaSQL);

            console.log(`📝 Executing ${statements.length} schema statements...`);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (!statement.trim()) continue;
                
                try {
                    await client.query(statement);
                    const preview = statement.length > 50 ? statement.substring(0, 50) + '...' : statement;
                    console.log(`✅ Statement ${i + 1}/${statements.length}: ${preview}`);
                } catch (error) {
                    console.error(`❌ Statement ${i + 1}/${statements.length}: FAILED`);
                    console.error('Statement:', statement.substring(0, 200) + '...');
                    console.error('Error:', error.message);
                    throw error;
                }
            }

            console.log('✅ Schema creation completed successfully!');

        } catch (error) {
            console.error('❌ Schema execution failed:', error.message);
            throw error;
        } finally {
            await client.end();
        }
    }

    parseSchemaStatements(schemaSQL) {
        const statements = [];
        const lines = schemaSQL.split('\n');
        let currentStatement = '';
        let inCreateTable = false;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith('--')) {
                continue;
            }
            
            // Handle CREATE EXTENSION
            if (trimmedLine.startsWith('CREATE EXTENSION')) {
                if (currentStatement.trim()) {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                }
                statements.push(trimmedLine);
                continue;
            }
            
            // Handle CREATE TABLE start
            if (trimmedLine.startsWith('CREATE TABLE')) {
                if (currentStatement.trim()) {
                    statements.push(currentStatement.trim());
                }
                currentStatement = line;
                inCreateTable = true;
                continue;
            }
            
            // Handle CREATE INDEX
            if (trimmedLine.startsWith('CREATE')) {
                if (currentStatement.trim()) {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                }
                statements.push(trimmedLine);
                continue;
            }
            
            // Add line to current statement
            currentStatement += '\n' + line;
            
            // Check for end of CREATE TABLE
            if (inCreateTable && trimmedLine.endsWith(');')) {
                statements.push(currentStatement.trim());
                currentStatement = '';
                inCreateTable = false;
            }
        }
        
        // Add any remaining statement
        if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
        }
        
        return statements.filter(stmt => stmt.trim().length > 0);
    }
}

async function convertAndCreateSchema() {
    console.log('🔄 Converting SQLite schema to PostgreSQL...');
    
    // Load SQLite schema analysis
    const analysisPath = path.join(__dirname, '../database/sqlite-schema-analysis.json');
    if (!fs.existsSync(analysisPath)) {
        console.error('❌ Schema analysis file not found. Run analyze-sqlite-schema.js first.');
        return;
    }

    const schemaAnalysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    console.log(`📊 Loaded analysis for ${schemaAnalysis.totalTables} tables`);

    // Convert schema
    const converter = new SQLiteToPostgreSQLConverter();
    const postgresSchema = converter.generatePostgreSQLSchema(schemaAnalysis);

    // Save PostgreSQL schema
    const schemaPath = path.join(__dirname, '../database/postgres-schema.sql');
    fs.writeFileSync(schemaPath, postgresSchema);
    console.log(`💾 PostgreSQL schema saved to: ${schemaPath}`);

    // PostgreSQL connection configuration
    const postgresConfig = {
        user: 'postgres',
        host: 'localhost',
        database: 'Teaching',
        password: '10108924',
        port: 5432,
    };

    console.log('\n🚀 Executing schema in PostgreSQL...');
    await converter.executeSchema(postgresConfig, postgresSchema);

    console.log('\n🎉 Schema conversion and creation completed successfully!');
    console.log('Next steps:');
    console.log('1. Verify table structures in PostgreSQL');
    console.log('2. Run data migration script');
    console.log('3. Update application configuration');
}

// Export for use in other scripts
module.exports = { SQLiteToPostgreSQLConverter, convertAndCreateSchema };

// Run if called directly
if (require.main === module) {
    convertAndCreateSchema().catch(console.error);
}