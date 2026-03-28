const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

async function applyChatSchema() {
    console.log('🔧 Starting chat schema migration...\n');
    
    const database = new PostgreSQLDatabase();
    
    try {
        // Initialize database connection
        await database.initialize();
        console.log('✅ Database connection established\n');
        
        // Read the chat schema file
        const schemaPath = path.join(__dirname, 'chat-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('📄 Chat schema file loaded\n');
        
        // Split the schema into individual statements
        // PostgreSQL needs statements executed separately
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        console.log(`📊 Executing ${statements.length} SQL statements...\n`);
        
        // Execute each statement
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';
            
            try {
                await database.db.query(statement);
                successCount++;
                
                // Extract and display what was created/modified
                if (statement.includes('CREATE TABLE')) {
                    const match = statement.match(/CREATE TABLE[^(]*([a-z_]+)/i);
                    if (match) {
                        console.log(`  ✓ Created table: ${match[1]}`);
                    }
                } else if (statement.includes('CREATE INDEX')) {
                    const match = statement.match(/CREATE INDEX[^ON]*([a-z_]+)/i);
                    if (match) {
                        console.log(`  ✓ Created index: ${match[1]}`);
                    }
                } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
                    const match = statement.match(/CREATE OR REPLACE FUNCTION[^(]*([a-z_]+)/i);
                    if (match) {
                        console.log(`  ✓ Created function: ${match[1]}`);
                    }
                } else if (statement.includes('CREATE TRIGGER')) {
                    const match = statement.match(/CREATE TRIGGER[^ON]*([a-z_]+)/i);
                    if (match) {
                        console.log(`  ✓ Created trigger: ${match[1]}`);
                    }
                } else if (statement.includes('CREATE OR REPLACE VIEW')) {
                    const match = statement.match(/CREATE OR REPLACE VIEW[^AS]*([a-z_]+)/i);
                    if (match) {
                        console.log(`  ✓ Created view: ${match[1]}`);
                    }
                }
            } catch (error) {
                // Ignore "already exists" errors for idempotent operations
                if (error.code === '42P07' || // relation already exists
                    error.code === '42710' || // object already exists
                    error.message.includes('already exists')) {
                    console.log(`  ℹ Skipped (already exists): ${statement.substring(0, 50)}...`);
                } else {
                    errorCount++;
                    console.error(`  ✗ Error executing statement ${i + 1}:`);
                    console.error(`    ${statement.substring(0, 100)}...`);
                    console.error(`    Error: ${error.message}\n`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`✅ Migration completed!`);
        console.log(`   Successful: ${successCount} statements`);
        if (errorCount > 0) {
            console.log(`   Errors: ${errorCount} statements`);
        }
        console.log('='.repeat(60) + '\n');
        
        // Verify tables were created
        console.log('🔍 Verifying chat tables...\n');
        const tables = await database.db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'conversations',
                'conversation_participants',
                'messages',
                'message_attachments',
                'message_read_receipts',
                'user_status',
                'chat_notifications',
                'blocked_users',
                'message_reactions'
            )
            ORDER BY table_name
        `);
        
        console.log('Chat tables in database:');
        tables.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        if (tables.rows.length === 9) {
            console.log('\n✅ All 9 chat tables created successfully!\n');
        } else {
            console.log(`\n⚠️  Warning: Expected 9 tables, found ${tables.rows.length}\n`);
        }
        
        await database.close();
        console.log('✅ Database connection closed\n');
        console.log('🎉 Chat system is ready to use!\n');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await database.close();
        process.exit(1);
    }
}

// Run migration
applyChatSchema()
    .then(() => {
        console.log('Migration script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration script error:', error);
        process.exit(1);
    });