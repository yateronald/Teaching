require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyChatSchema() {
    console.log('🔧 Starting chat schema migration for Aiven PostgreSQL...\n');
    
    // Use Aiven credentials from .env
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: true,
            ca: fs.readFileSync(path.join(__dirname, '../cert/ca.pem')).toString()
        } : false
    };
    
    console.log(`📡 Connecting to: ${config.host}:${config.port}/${config.database}`);
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('✅ Database connection established\n');
        
        // Read the chat schema file
        const schemaPath = path.join(__dirname, 'chat-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('📄 Chat schema file loaded\n');
        
        console.log('📊 Executing schema...\n');
        
        // Split into statements
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));
        
        let created = { tables: 0, indexes: 0, functions: 0, triggers: 0, views: 0, skipped: 0 };
        
        for (const statement of statements) {
            const stmt = statement + ';';
            try {
                await client.query(stmt);
                
                // Track what was created
                if (stmt.toUpperCase().includes('CREATE TABLE')) {
                    created.tables++;
                    const match = stmt.match(/CREATE TABLE[^(]*\s+([a-z_]+)/i);
                    if (match) console.log(`  ✓ Table: ${match[1]}`);
                } else if (stmt.toUpperCase().includes('CREATE INDEX')) {
                    created.indexes++;
                } else if (stmt.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
                    created.functions++;
                    const match = stmt.match(/FUNCTION\s+([a-z_]+)/i);
                    if (match) console.log(`  ✓ Function: ${match[1]}`);
                } else if (stmt.toUpperCase().includes('CREATE TRIGGER')) {
                    created.triggers++;
                } else if (stmt.toUpperCase().includes('CREATE OR REPLACE VIEW')) {
                    created.views++;
                }
            } catch (error) {
                // Ignore "already exists" errors
                if (error.message.includes('already exists') || 
                    error.code === '42P07' ||  // relation already exists
                    error.code === '42710') {  // object already exists
                    created.skipped++;
                } else {
                    console.error(`\n❌ Error in statement:`);
                    console.error(stmt.substring(0, 200) + '...');
                    console.error(`Error: ${error.message}\n`);
                    // Continue with other statements
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`✅ Schema execution completed!`);
        console.log(`   Tables: ${created.tables}`);
        console.log(`   Indexes: ${created.indexes}`);
        console.log(`   Functions: ${created.functions}`);
        console.log(`   Triggers: ${created.triggers}`);
        console.log(`   Views: ${created.views}`);
        if (created.skipped > 0) {
            console.log(`   Skipped (already exists): ${created.skipped}`);
        }
        console.log('='.repeat(60) + '\n');
        
        // Verify tables
        console.log('🔍 Verifying chat tables...\n');
        const result = await client.query(`
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
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        if (result.rows.length === 9) {
            console.log('\n✅ All 9 chat tables verified!\n');
            console.log('🎉 Chat system is ready to use!\n');
            console.log('You can now restart your server with: npm start\n');
        } else {
            console.log(`\n⚠️  Warning: Expected 9 tables, found ${result.rows.length}\n`);
            if (result.rows.length < 9) {
                console.log('Missing tables - check for errors above\n');
            }
        }
        
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error('Error:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.hint) console.error('Hint:', error.hint);
        process.exit(1);
    } finally {
        await client.end();
        console.log('✅ Database connection closed\n');
    }
}

// Run migration
applyChatSchema()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Migration error:', error.message);
        process.exit(1);
    });