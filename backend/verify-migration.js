const { Client } = require('pg');

const LOCAL_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '10108924'
};

async function verifyMigration() {
    const client = new Client(LOCAL_CONFIG);
    
    try {
        console.log('Connecting to local PostgreSQL...');
        await client.connect();
        console.log('✓ Connected to local PostgreSQL');
        
        // Get list of tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log(`\n📊 Found ${tablesResult.rows.length} tables:`);
        
        for (const table of tablesResult.rows) {
            const tableName = `public.${table.table_name}`;
            
            // Get row count
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            const rowCount = countResult.rows[0].count;
            
            console.log(`  - ${table.table_name}: ${rowCount} rows`);
        }
        
        // Get total row count across all tables
        let totalRows = 0;
        for (const table of tablesResult.rows) {
            const tableName = `public.${table.table_name}`;
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            totalRows += parseInt(countResult.rows[0].count);
        }
        
        console.log(`\n✅ Migration verification complete!`);
        console.log(`📈 Total rows migrated: ${totalRows}`);
        console.log(`🗂️  Total tables: ${tablesResult.rows.length}`);
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await client.end();
        console.log('✓ Disconnected from local PostgreSQL');
    }
}

if (require.main === module) {
    verifyMigration();
}

module.exports = verifyMigration;