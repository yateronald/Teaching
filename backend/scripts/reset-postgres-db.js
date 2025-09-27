const { Client } = require('pg');
require('dotenv').config();

async function resetPostgreSQLDatabase() {
    // PostgreSQL connection configuration for admin operations
    const adminConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default database
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    };

    console.log('🔄 Resetting PostgreSQL Teaching database...');
    console.log(`Host: ${adminConfig.host}:${adminConfig.port}`);
    console.log('-----------------------------------');

    const adminClient = new Client(adminConfig);

    try {
        await adminClient.connect();
        console.log('✅ Connected to PostgreSQL as admin');

        // Terminate any active connections to the Teaching database
        try {
            await adminClient.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = 'Teaching' AND pid <> pg_backend_pid()
            `);
            console.log('✅ Terminated active connections to Teaching database');
        } catch (error) {
            console.log('ℹ️  No active connections to terminate');
        }

        // Drop the Teaching database if it exists
        try {
            await adminClient.query('DROP DATABASE IF EXISTS "Teaching"');
            console.log('✅ Dropped existing Teaching database');
        } catch (error) {
            console.log('ℹ️  Teaching database did not exist');
        }

        // Create a fresh Teaching database
        await adminClient.query('CREATE DATABASE "Teaching"');
        console.log('✅ Created fresh Teaching database');

        await adminClient.end();

        // Verify the new database
        const teachingConfig = {
            ...adminConfig,
            database: 'Teaching'
        };

        const teachingClient = new Client(teachingConfig);
        await teachingClient.connect();
        console.log('✅ Successfully connected to fresh Teaching database');

        // Verify it's empty
        const tablesResult = await teachingClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log(`📊 Database status: ${tablesResult.rows.length} tables (should be 0)`);
        
        await teachingClient.end();

        console.log('\n🎉 Teaching database reset completed successfully!');
        console.log('Ready for fresh schema migration.');

    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { resetPostgreSQLDatabase };

// Run if called directly
if (require.main === module) {
    resetPostgreSQLDatabase().catch(console.error);
}