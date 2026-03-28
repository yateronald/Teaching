const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const AIVEN_CONFIG = {
    host: 'pg-3ac4bb34-yateronald-bcd4.b.aivencloud.com',
    port: 25952,
    database: 'defaultdb',
    user: 'avnadmin',
    password: 'AVNS_4fbPdY3X3q175YRDZAV',
    ssl: {
        rejectUnauthorized: false
    }
};

const LOCAL_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '10108924'
};

class DatabaseMigrator {
    constructor() {
        this.aivenClient = null;
        this.localClient = null;
        this.logFile = path.join(__dirname, 'migration.log');
        this.errorLog = path.join(__dirname, 'migration-errors.log');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(message);
        fs.appendFileSync(this.logFile, logMessage);
    }

    logError(message, error = null) {
        const timestamp = new Date().toISOString();
        const errorMessage = `[${timestamp}] ERROR: ${message}${error ? '\n' + error.stack : ''}\n`;
        console.error(`ERROR: ${message}`);
        if (error) console.error(error);
        fs.appendFileSync(this.errorLog, errorMessage);
    }

    async connect() {
        try {
            this.log('Connecting to AivenCloud PostgreSQL...');
            this.aivenClient = new Client(AIVEN_CONFIG);
            await this.aivenClient.connect();
            this.log('✓ Connected to AivenCloud PostgreSQL');

            this.log('Connecting to Local PostgreSQL...');
            this.localClient = new Client(LOCAL_CONFIG);
            await this.localClient.connect();
            this.log('✓ Connected to Local PostgreSQL');
        } catch (error) {
            this.logError('Failed to connect to databases', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.aivenClient) {
            await this.aivenClient.end();
            this.log('✓ Disconnected from AivenCloud PostgreSQL');
        }
        if (this.localClient) {
            await this.localClient.end();
            this.log('✓ Disconnected from Local PostgreSQL');
        }
    }

    async getTableList() {
        try {
            this.log('Fetching table list from AivenCloud...');
            const result = await this.aivenClient.query(`
                SELECT schemaname, tablename 
                FROM pg_tables 
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                ORDER BY schemaname, tablename
            `);
            
            const tables = result.rows.map(row => ({
                schema: row.schemaname,
                name: row.tablename,
                fullName: `${row.schemaname}.${row.tablename}`
            }));
            
            this.log(`Found ${tables.length} tables to migrate`);
            return tables;
        } catch (error) {
            this.logError('Failed to get table list', error);
            throw error;
        }
    }

    async getTableSchema(table) {
        try {
            const result = await this.aivenClient.query(`
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default,
                    numeric_precision,
                    numeric_scale
                FROM information_schema.columns 
                WHERE table_schema = $1 AND table_name = $2
                ORDER BY ordinal_position
            `, [table.schema, table.name]);

            return result.rows;
        } catch (error) {
            this.logError(`Failed to get schema for table ${table.fullName}`, error);
            throw error;
        }
    }

    async getTableConstraints(table) {
        try {
            const result = await this.aivenClient.query(`
                SELECT 
                    tc.constraint_name,
                    tc.constraint_type,
                    kcu.column_name,
                    ccu.table_schema AS foreign_table_schema,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    rc.update_rule,
                    rc.delete_rule
                FROM information_schema.table_constraints tc
                LEFT JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                LEFT JOIN information_schema.constraint_column_usage ccu 
                    ON ccu.constraint_name = tc.constraint_name
                LEFT JOIN information_schema.referential_constraints rc 
                    ON tc.constraint_name = rc.constraint_name
                WHERE tc.table_schema = $1 AND tc.table_name = $2
                ORDER BY tc.constraint_type, tc.constraint_name
            `, [table.schema, table.name]);

            return result.rows;
        } catch (error) {
            this.logError(`Failed to get constraints for table ${table.fullName}`, error);
            throw error;
        }
    }

    async getTableIndexes(table) {
        try {
            const result = await this.aivenClient.query(`
                SELECT 
                    i.indexname,
                    i.indexdef
                FROM pg_indexes i
                WHERE i.schemaname = $1 AND i.tablename = $2
                AND i.indexname NOT LIKE '%_pkey'
                ORDER BY i.indexname
            `, [table.schema, table.name]);

            return result.rows;
        } catch (error) {
            this.logError(`Failed to get indexes for table ${table.fullName}`, error);
            throw error;
        }
    }

    buildColumnDefinition(column) {
        let definition = `"${column.column_name}" ${column.data_type}`;
        
        // Handle character varying and other types with length
        if (column.character_maximum_length && ['character varying', 'varchar', 'char', 'character'].includes(column.data_type)) {
            definition += `(${column.character_maximum_length})`;
        }
        
        // Handle numeric precision and scale
        if (column.numeric_precision && ['numeric', 'decimal'].includes(column.data_type)) {
            if (column.numeric_scale !== null && column.numeric_scale !== undefined) {
                definition += `(${column.numeric_precision},${column.numeric_scale})`;
            } else {
                definition += `(${column.numeric_precision})`;
            }
        }
        
        // Handle NOT NULL
        if (column.is_nullable === 'NO') {
            definition += ' NOT NULL';
        }
        
        // Handle DEFAULT values - be more careful with defaults
        if (column.column_default && column.column_default !== null) {
            // Skip complex defaults that might cause issues
            if (!column.column_default.includes('nextval') && !column.column_default.includes('::')) {
                definition += ` DEFAULT ${column.column_default}`;
            }
        }
        
        return definition;
    }

    async createTable(table, columns, constraints) {
        try {
            this.log(`Creating table ${table.fullName}...`);
            
            // Build column definitions
            const columnDefs = columns.map(col => this.buildColumnDefinition(col));
            
            // Add primary key constraints
            const primaryKeys = constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
            if (primaryKeys.length > 0) {
                const pkColumns = primaryKeys.map(pk => pk.column_name).join(', ');
                columnDefs.push(`PRIMARY KEY (${pkColumns})`);
            }
            
            // Add unique constraints
            const uniqueConstraints = constraints.filter(c => c.constraint_type === 'UNIQUE');
            uniqueConstraints.forEach(uc => {
                columnDefs.push(`UNIQUE (${uc.column_name})`);
            });
            
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ${table.fullName} (
                    ${columnDefs.join(',\n    ')}
                )
            `;
            
            // Log the SQL for debugging
            this.log(`SQL for ${table.fullName}: ${createTableSQL}`);
            
            await this.localClient.query(createTableSQL);
            this.log(`✓ Created table ${table.fullName}`);
        } catch (error) {
            this.logError(`Failed to create table ${table.fullName}`, error);
            throw error;
        }
    }

    async addForeignKeys(table, constraints) {
        try {
            const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
            
            for (const fk of foreignKeys) {
                if (fk.foreign_table_name && fk.foreign_column_name) {
                    const alterSQL = `
                        ALTER TABLE ${table.fullName} 
                        ADD CONSTRAINT ${fk.constraint_name} 
                        FOREIGN KEY (${fk.column_name}) 
                        REFERENCES ${fk.foreign_table_schema}.${fk.foreign_table_name}(${fk.foreign_column_name})
                        ${fk.update_rule ? `ON UPDATE ${fk.update_rule}` : ''}
                        ${fk.delete_rule ? `ON DELETE ${fk.delete_rule}` : ''}
                    `;
                    
                    try {
                        await this.localClient.query(alterSQL);
                        this.log(`✓ Added foreign key ${fk.constraint_name} to ${table.fullName}`);
                    } catch (error) {
                        this.logError(`Failed to add foreign key ${fk.constraint_name} to ${table.fullName}`, error);
                        // Continue with other foreign keys
                    }
                }
            }
        } catch (error) {
            this.logError(`Failed to add foreign keys to table ${table.fullName}`, error);
        }
    }

    async createIndexes(table, indexes) {
        try {
            for (const index of indexes) {
                try {
                    // Replace schema references in index definition
                    let indexDef = index.indexdef.replace(/ON public\./g, `ON ${table.schema}.`);
                    
                    await this.localClient.query(indexDef);
                    this.log(`✓ Created index ${index.indexname} on ${table.fullName}`);
                } catch (error) {
                    this.logError(`Failed to create index ${index.indexname} on ${table.fullName}`, error);
                    // Continue with other indexes
                }
            }
        } catch (error) {
            this.logError(`Failed to create indexes for table ${table.fullName}`, error);
        }
    }

    async getTableDependencies(tables) {
        try {
            this.log('Analyzing table dependencies...');
            const dependencies = new Map();
            
            for (const table of tables) {
                const constraints = await this.getTableConstraints(table);
                const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
                
                const deps = foreignKeys
                    .filter(fk => fk.foreign_table_name)
                    .map(fk => `${fk.foreign_table_schema}.${fk.foreign_table_name}`);
                
                dependencies.set(table.fullName, deps);
            }
            
            return dependencies;
        } catch (error) {
            this.logError('Failed to analyze table dependencies', error);
            throw error;
        }
    }

    topologicalSort(tables, dependencies) {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        
        const visit = (tableName) => {
            if (visiting.has(tableName)) {
                this.log(`Warning: Circular dependency detected involving ${tableName}`);
                return;
            }
            
            if (visited.has(tableName)) {
                return;
            }
            
            visiting.add(tableName);
            
            const deps = dependencies.get(tableName) || [];
            for (const dep of deps) {
                if (dependencies.has(dep)) {
                    visit(dep);
                }
            }
            
            visiting.delete(tableName);
            visited.add(tableName);
            result.push(tableName);
        };
        
        for (const table of tables) {
            visit(table.fullName);
        }
        
        return result;
    }

    async migrateData(table) {
        try {
            this.log(`Migrating data for ${table.fullName}...`);
            
            // First, clear existing data to avoid conflicts
            await this.localClient.query(`DELETE FROM ${table.fullName}`);
            this.log(`Cleared existing data from ${table.fullName}`);
            
            // Get row count
            const countResult = await this.aivenClient.query(`SELECT COUNT(*) FROM ${table.fullName}`);
            const totalRows = parseInt(countResult.rows[0].count);
            
            if (totalRows === 0) {
                this.log(`✓ No data to migrate for ${table.fullName}`);
                return;
            }
            
            this.log(`Found ${totalRows} rows to migrate for ${table.fullName}`);
            
            // Migrate data in batches
            const batchSize = 1000;
            let offset = 0;
            
            while (offset < totalRows) {
                const dataResult = await this.aivenClient.query(`
                    SELECT * FROM ${table.fullName} 
                    ORDER BY 1 
                    LIMIT ${batchSize} OFFSET ${offset}
                `);
                
                if (dataResult.rows.length === 0) break;
                
                // Build insert statement
                const columns = dataResult.fields.map(f => f.name);
                const placeholders = dataResult.rows.map((_, rowIndex) => 
                    `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
                ).join(', ');
                
                const values = [];
                dataResult.rows.forEach(row => {
                    columns.forEach(col => {
                        values.push(row[col]);
                    });
                });
                
                const insertSQL = `
                    INSERT INTO ${table.fullName} (${columns.join(', ')}) 
                    VALUES ${placeholders}
                    ON CONFLICT DO NOTHING
                `;
                
                await this.localClient.query(insertSQL, values);
                
                offset += batchSize;
                this.log(`✓ Migrated ${Math.min(offset, totalRows)}/${totalRows} rows for ${table.fullName}`);
            }
            
            this.log(`✓ Completed data migration for ${table.fullName}`);
        } catch (error) {
            this.logError(`Failed to migrate data for ${table.fullName}`, error);
            throw error;
        }
    }

    async resetSequences(tables) {
        try {
            this.log('Resetting sequences...');
            
            for (const table of tables) {
                try {
                    // Find sequences for this table
                    const sequenceResult = await this.localClient.query(`
                        SELECT column_name, column_default
                        FROM information_schema.columns
                        WHERE table_schema = $1 AND table_name = $2
                        AND column_default LIKE 'nextval%'
                    `, [table.schema, table.name]);
                    
                    for (const seq of sequenceResult.rows) {
                        // Extract sequence name from default value
                        const match = seq.column_default.match(/nextval\('([^']+)'/);
                        if (match) {
                            const sequenceName = match[1];
                            
                            // Get max value from table
                            const maxResult = await this.localClient.query(`
                                SELECT COALESCE(MAX(${seq.column_name}), 0) as max_val 
                                FROM ${table.fullName}
                            `);
                            
                            const maxVal = maxResult.rows[0].max_val;
                            
                            // Reset sequence
                            await this.localClient.query(`
                                SELECT setval('${sequenceName}', ${maxVal + 1}, false)
                            `);
                            
                            this.log(`✓ Reset sequence ${sequenceName} to ${maxVal + 1}`);
                        }
                    }
                } catch (error) {
                    this.logError(`Failed to reset sequences for ${table.fullName}`, error);
                    // Continue with other tables
                }
            }
        } catch (error) {
            this.logError('Failed to reset sequences', error);
        }
    }

    async migrate() {
        try {
            this.log('=== Starting Database Migration ===');
            this.log(`From: ${AIVEN_CONFIG.host}:${AIVEN_CONFIG.port}/${AIVEN_CONFIG.database}`);
            this.log(`To: ${LOCAL_CONFIG.host}:${LOCAL_CONFIG.port}/${LOCAL_CONFIG.database}`);
            
            await this.connect();
            
            // Get all tables
            const tables = await this.getTableList();
            if (tables.length === 0) {
                this.log('No tables found to migrate');
                return;
            }
            
            // Get dependencies and sort tables
            const dependencies = await this.getTableDependencies(tables);
            const sortedTableNames = this.topologicalSort(tables, dependencies);
            const sortedTables = sortedTableNames.map(name => 
                tables.find(t => t.fullName === name)
            ).filter(Boolean);
            
            this.log(`Migration order: ${sortedTables.map(t => t.fullName).join(' -> ')}`);
            
            // Phase 1: Create tables and basic constraints
            this.log('\n=== Phase 1: Creating Tables ===');
            for (const table of sortedTables) {
                const columns = await this.getTableSchema(table);
                const constraints = await this.getTableConstraints(table);
                await this.createTable(table, columns, constraints);
            }
            
            // Phase 2: Migrate data
            this.log('\n=== Phase 2: Migrating Data ===');
            for (const table of sortedTables) {
                await this.migrateData(table);
            }
            
            // Phase 3: Add foreign keys
            this.log('\n=== Phase 3: Adding Foreign Keys ===');
            for (const table of sortedTables) {
                const constraints = await this.getTableConstraints(table);
                await this.addForeignKeys(table, constraints);
            }
            
            // Phase 4: Create indexes
            this.log('\n=== Phase 4: Creating Indexes ===');
            for (const table of sortedTables) {
                const indexes = await this.getTableIndexes(table);
                await this.createIndexes(table, indexes);
            }
            
            // Phase 5: Reset sequences
            this.log('\n=== Phase 5: Resetting Sequences ===');
            await this.resetSequences(sortedTables);
            
            this.log('\n=== Migration Completed Successfully ===');
            
        } catch (error) {
            this.logError('Migration failed', error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
}

// Run migration
async function main() {
    const migrator = new DatabaseMigrator();
    
    try {
        await migrator.migrate();
        console.log('\n✅ Migration completed successfully!');
        console.log(`📋 Check migration.log for details`);
        console.log(`❌ Check migration-errors.log for any errors`);
    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Check migration-errors.log for details');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseMigrator;