const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function analyzeSQLiteSchema() {
    const dbPath = path.join(__dirname, '../database/french_teaching.db');
    
    console.log('🔍 Analyzing SQLite database schema...');
    console.log(`Database path: ${dbPath}`);
    console.log('-----------------------------------');

    if (!fs.existsSync(dbPath)) {
        console.error('❌ SQLite database not found at:', dbPath);
        console.log('Make sure the backend server has been started at least once to create the database.');
        return;
    }

    const db = new sqlite3.Database(dbPath);
    
    try {
        // Get all tables
        const tables = await new Promise((resolve, reject) => {
            db.all(`
                SELECT name, sql 
                FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`📋 Found ${tables.length} tables:`);
        tables.forEach(table => console.log(`   - ${table.name}`));
        console.log('');

        const schemaAnalysis = {
            tables: {},
            indexes: {},
            totalTables: tables.length,
            analyzedAt: new Date().toISOString()
        };

        // Analyze each table
        for (const table of tables) {
            console.log(`🔍 Analyzing table: ${table.name}`);
            
            // Get table info (columns, types, constraints)
            const tableInfo = await new Promise((resolve, reject) => {
                db.all(`PRAGMA table_info(${table.name})`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Get foreign keys
            const foreignKeys = await new Promise((resolve, reject) => {
                db.all(`PRAGMA foreign_key_list(${table.name})`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Get indexes for this table
            const tableIndexes = await new Promise((resolve, reject) => {
                db.all(`PRAGMA index_list(${table.name})`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Get detailed index information
            const indexDetails = {};
            for (const index of tableIndexes) {
                const indexInfo = await new Promise((resolve, reject) => {
                    db.all(`PRAGMA index_info(${index.name})`, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
                indexDetails[index.name] = {
                    unique: index.unique === 1,
                    columns: indexInfo.map(col => col.name)
                };
            }

            // Count records
            const recordCount = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });

            schemaAnalysis.tables[table.name] = {
                originalSQL: table.sql,
                columns: tableInfo.map(col => ({
                    name: col.name,
                    type: col.type,
                    notNull: col.notnull === 1,
                    defaultValue: col.dflt_value,
                    primaryKey: col.pk === 1,
                    position: col.cid
                })),
                foreignKeys: foreignKeys.map(fk => ({
                    column: fk.from,
                    referencedTable: fk.table,
                    referencedColumn: fk.to,
                    onDelete: fk.on_delete,
                    onUpdate: fk.on_update
                })),
                indexes: indexDetails,
                recordCount: recordCount
            };

            console.log(`   📊 Columns: ${tableInfo.length}, Records: ${recordCount}, Indexes: ${Object.keys(indexDetails).length}`);
        }

        // Get all indexes (including those not tied to specific tables)
        const allIndexes = await new Promise((resolve, reject) => {
            db.all(`
                SELECT name, sql, tbl_name
                FROM sqlite_master 
                WHERE type='index' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        schemaAnalysis.indexes = allIndexes.reduce((acc, index) => {
            acc[index.name] = {
                table: index.tbl_name,
                sql: index.sql
            };
            return acc;
        }, {});

        // Save analysis to file
        const analysisPath = path.join(__dirname, '../database/sqlite-schema-analysis.json');
        fs.writeFileSync(analysisPath, JSON.stringify(schemaAnalysis, null, 2));
        
        console.log('\n📊 Schema Analysis Summary:');
        console.log(`   Total Tables: ${schemaAnalysis.totalTables}`);
        console.log(`   Total Indexes: ${Object.keys(schemaAnalysis.indexes).length}`);
        console.log(`   Analysis saved to: ${analysisPath}`);

        // Display detailed table information
        console.log('\n📋 Detailed Table Analysis:');
        for (const [tableName, tableData] of Object.entries(schemaAnalysis.tables)) {
            console.log(`\n🔹 ${tableName}:`);
            console.log(`   Records: ${tableData.recordCount}`);
            console.log(`   Columns: ${tableData.columns.length}`);
            
            // Show column details
            tableData.columns.forEach(col => {
                const constraints = [];
                if (col.primaryKey) constraints.push('PRIMARY KEY');
                if (col.notNull) constraints.push('NOT NULL');
                if (col.defaultValue) constraints.push(`DEFAULT ${col.defaultValue}`);
                
                console.log(`     - ${col.name}: ${col.type} ${constraints.join(' ')}`);
            });

            // Show foreign keys
            if (tableData.foreignKeys.length > 0) {
                console.log(`   Foreign Keys:`);
                tableData.foreignKeys.forEach(fk => {
                    console.log(`     - ${fk.column} → ${fk.referencedTable}.${fk.referencedColumn}`);
                });
            }

            // Show indexes
            if (Object.keys(tableData.indexes).length > 0) {
                console.log(`   Indexes:`);
                Object.entries(tableData.indexes).forEach(([indexName, indexData]) => {
                    const uniqueStr = indexData.unique ? ' (UNIQUE)' : '';
                    console.log(`     - ${indexName}: ${indexData.columns.join(', ')}${uniqueStr}`);
                });
            }
        }

        console.log('\n✅ Schema analysis completed successfully!');
        return schemaAnalysis;

    } catch (error) {
        console.error('❌ Schema analysis failed:', error.message);
        throw error;
    } finally {
        db.close();
    }
}

// Export for use in other scripts
module.exports = { analyzeSQLiteSchema };

// Run if called directly
if (require.main === module) {
    analyzeSQLiteSchema().catch(console.error);
}