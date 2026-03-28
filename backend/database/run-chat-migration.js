require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🔧 Applying chat schema to Aiven PostgreSQL...\n');
    
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
    
    console.log(`📡 Connecting to: ${config.host}`);
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Read schema file
        const schemaPath = path.join(__dirname, 'chat-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Executing chat schema (this may take a moment)...\n');
        
        // Execute the entire schema as one command
        await client.query(schema);
        
        console.log('✅ Schema executed successfully!\n');
        
        // Verify tables were created
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
        
        console.log('Chat tables created:');
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        if (result.rows.length === 9) {
            console.log('\n✅ All 9 chat tables successfully created!\n');
            console.log('🎉 Chat system database is ready!\n');
            console.log('Next step: Restart your server with: npm start\n');
        } else {
            console.log(`\n⚠️  Expected 9 tables, found ${result.rows.length}\n`);
        }
        
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error('Error:', error.message);
        if (error.position) {
            console.error('Position in SQL:', error.position);
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('✅ Database connection closed\n');
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });