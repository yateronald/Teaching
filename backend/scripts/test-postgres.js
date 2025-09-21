const { Client } = require('pg');

async function testPostgreSQLConnection() {
    // PostgreSQL connection configuration
    const config = {
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // Default database to test connection
        password: '10108924',
        port: 5432,
    };

    console.log('🔍 Testing PostgreSQL connection...');
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`User: ${config.user}`);
    console.log(`Database: ${config.database}`);
    console.log('-----------------------------------');

    const client = new Client(config);

    try {
        // Test connection
        await client.connect();
        console.log('✅ Successfully connected to PostgreSQL!');

        // Test basic query
        const versionResult = await client.query('SELECT version()');
        console.log('📊 PostgreSQL Version:', versionResult.rows[0].version);

        // Test database creation capabilities
        const dbListResult = await client.query(`
            SELECT datname FROM pg_database 
            WHERE datistemplate = false 
            ORDER BY datname
        `);
        console.log('📋 Available databases:');
        dbListResult.rows.forEach(row => {
            console.log(`   - ${row.datname}`);
        });

        // Test table creation (in a transaction that we'll rollback)
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table creation test: SUCCESS');

        // Test insert
        await client.query(`
            INSERT INTO test_table (name) VALUES ('Test Entry')
        `);
        console.log('✅ Insert test: SUCCESS');

        // Test select
        const selectResult = await client.query('SELECT * FROM test_table');
        console.log('✅ Select test: SUCCESS');
        console.log('📄 Test data:', selectResult.rows);

        // Rollback the test transaction
        await client.query('ROLLBACK');
        console.log('✅ Transaction rollback: SUCCESS');

        // Test schema information queries (needed for migrations)
        const schemaTest = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'pg_database' 
            LIMIT 3
        `);
        console.log('✅ Schema information query: SUCCESS');

        console.log('\n🎉 All PostgreSQL tests passed!');
        console.log('Your PostgreSQL installation is ready for migration.');

    } catch (error) {
        console.error('❌ PostgreSQL connection test failed:');
        console.error('Error:', error.message);
        
        if (error.code) {
            console.error('Error Code:', error.code);
        }

        // Provide helpful troubleshooting tips
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure PostgreSQL service is running');
        console.log('2. Verify the password is correct');
        console.log('3. Check if PostgreSQL is listening on port 5432');
        console.log('4. Ensure the postgres user exists and has proper permissions');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('5. PostgreSQL server might not be running. Try starting it:');
            console.log('   - Windows: Start PostgreSQL service from Services panel');
            console.log('   - Or run: net start postgresql-x64-[version]');
        }
        
        if (error.code === '28P01') {
            console.log('5. Authentication failed - check your password');
        }

        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Connection closed.');
    }
}

// Test for required pg module
try {
    require('pg');
    console.log('✅ pg module is available');
} catch (error) {
    console.error('❌ pg module not found. Install it with:');
    console.error('npm install pg');
    process.exit(1);
}

// Run the test
testPostgreSQLConnection().catch(console.error);