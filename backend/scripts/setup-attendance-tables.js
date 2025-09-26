const fs = require('fs');
const path = require('path');

// Import the database initialization
const PostgreSQLDatabase = require('../database/init-postgres');

async function setupAttendanceTables() {
    const db = new PostgreSQLDatabase();
    
    try {
        console.log('🔄 Connecting to database...');
        await db.initialize();
        
        console.log('📋 Reading attendance schema...');
        const schemaPath = path.join(__dirname, '..', 'database', 'attendance-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🔍 Schema content preview:');
        console.log(schema.substring(0, 200) + '...');
        
        // Split the schema into individual statements and filter properly
        const allStatements = schema
            .replace(/--.*$/gm, '') // Remove comments
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => 
                stmt.length > 0 && 
                !stmt.match(/^\s*$/)
            );
        
        console.log(`📊 Found ${allStatements.length} total statements`);
        allStatements.forEach((stmt, i) => {
            console.log(`   ${i + 1}: ${stmt.substring(0, 60)}...`);
        });
        
        // Separate CREATE TABLE statements from other statements
        const tableStatements = allStatements.filter(stmt => 
            stmt.startsWith('CREATE TABLE') || 
            stmt.startsWith('INSERT INTO')
        );
        
        // Get index statements separately
        const indexStatements = allStatements.filter(stmt => 
            stmt.startsWith('CREATE INDEX')
        );
        
        // Get view statements
        const viewStatements = allStatements.filter(stmt => 
            stmt.startsWith('CREATE VIEW')
        );
        
        console.log(`📊 Executing ${tableStatements.length} table creation statements...`);
        
        for (let i = 0; i < tableStatements.length; i++) {
            const statement = tableStatements[i];
            if (statement.trim()) {
                try {
                    console.log(`   ${i + 1}/${tableStatements.length}: ${statement.substring(0, 50)}...`);
                    await db.client.query(statement);
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`   ⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
                    } else {
                        console.error(`   ❌ Error executing statement: ${statement.substring(0, 100)}...`);
                        console.error(`   Error: ${error.message}`);
                        throw error;
                    }
                }
            }
        }
        
        console.log(`📊 Executing ${viewStatements.length} view creation statements...`);
        
        for (let i = 0; i < viewStatements.length; i++) {
            const statement = viewStatements[i];
            if (statement.trim()) {
                try {
                    console.log(`   ${i + 1}/${viewStatements.length}: ${statement.substring(0, 50)}...`);
                    await db.client.query(statement);
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`   ⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
                    } else {
                        console.error(`   ❌ Error executing view: ${statement.substring(0, 100)}...`);
                        console.error(`   Error: ${error.message}`);
                        // Don't throw for view errors, just log them
                    }
                }
            }
        }
        
        console.log(`📊 Executing ${indexStatements.length} index creation statements...`);
        
        for (let i = 0; i < indexStatements.length; i++) {
            const statement = indexStatements[i];
            if (statement.trim()) {
                try {
                    console.log(`   ${i + 1}/${indexStatements.length}: ${statement.substring(0, 50)}...`);
                    await db.client.query(statement);
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`   ⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
                    } else {
                        console.error(`   ❌ Error executing index: ${statement.substring(0, 100)}...`);
                        console.error(`   Error: ${error.message}`);
                        // Don't throw for index errors, just log them
                    }
                }
            }
        }
        
        console.log('✅ Attendance tables setup completed successfully!');
        
        // Verify tables were created
        console.log('🔍 Verifying tables...');
        const tables = await db.client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%attendance%' OR table_name = 'class_sessions'
            ORDER BY table_name
        `);
        
        console.log('📋 Created attendance-related tables:');
        tables.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to setup attendance tables:', error);
        process.exit(1);
    } finally {
        if (db.client) {
            await db.client.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the setup
if (require.main === module) {
    setupAttendanceTables();
}

module.exports = setupAttendanceTables;