const { Client } = require('pg');
require('dotenv').config();

async function createTeachingDatabase() {
    // PostgreSQL connection configuration for initial setup
    const adminConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default database first
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    };

    console.log('🏗️  Creating PostgreSQL Teaching database...');
    console.log(`Host: ${adminConfig.host}:${adminConfig.port}`);
    console.log(`Admin User: ${adminConfig.user}`);
    console.log('-----------------------------------');

    const adminClient = new Client(adminConfig);

    try {
        // Connect to PostgreSQL as admin
        await adminClient.connect();
        console.log('✅ Connected to PostgreSQL as admin');

        // Check if Teaching database already exists
        const dbCheckResult = await adminClient.query(`
            SELECT datname FROM pg_database 
            WHERE datname = 'Teaching'
        `);

        if (dbCheckResult.rows.length > 0) {
            console.log('📋 Teaching database already exists');
        } else {
            // Create the Teaching database
            await adminClient.query('CREATE DATABASE "Teaching"');
            console.log('✅ Teaching database created successfully');
        }

        await adminClient.end();

        // Now connect to the Teaching database to verify
        const teachingConfig = {
            ...adminConfig,
            database: 'Teaching'
        };

        const teachingClient = new Client(teachingConfig);
        await teachingClient.connect();
        console.log('✅ Successfully connected to Teaching database');

        // Verify database properties
        const dbInfoResult = await teachingClient.query(`
            SELECT 
                current_database() as database_name,
                current_user as current_user,
                version() as postgres_version
        `);

        const dbInfo = dbInfoResult.rows[0];
        console.log('📊 Database Information:');
        console.log(`   Database: ${dbInfo.database_name}`);
        console.log(`   User: ${dbInfo.current_user}`);
        console.log(`   Version: ${dbInfo.postgres_version.split(',')[0]}`);

        // Test basic operations
        await teachingClient.query('BEGIN');
        await teachingClient.query(`
            CREATE TABLE IF NOT EXISTS migration_test (
                id SERIAL PRIMARY KEY,
                test_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await teachingClient.query(`
            INSERT INTO migration_test (test_name) VALUES ('Database Creation Test')
        `);
        const testResult = await teachingClient.query('SELECT * FROM migration_test');
        console.log('✅ Basic operations test: SUCCESS');
        console.log('📄 Test record:', testResult.rows[0]);
        
        // Clean up test table
        await teachingClient.query('DROP TABLE migration_test');
        await teachingClient.query('COMMIT');
        console.log('✅ Test cleanup: SUCCESS');

        await teachingClient.end();

        console.log('\n🎉 Teaching database is ready for migration!');
        console.log('Connection parameters for application:');
        console.log(`   Host: ${teachingConfig.host}`);
        console.log(`   Port: ${teachingConfig.port}`);
        console.log(`   Database: ${teachingConfig.database}`);
        console.log(`   User: ${teachingConfig.user}`);

        return teachingConfig;

    } catch (error) {
        console.error('❌ Database creation failed:');
        console.error('Error:', error.message);
        
        if (error.code) {
            console.error('Error Code:', error.code);
        }

        // Provide helpful troubleshooting tips
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure PostgreSQL service is running');
        console.log('2. Verify the postgres user has CREATEDB privileges');
        console.log('3. Check if there are any connection limits');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('4. PostgreSQL server might not be running');
        }
        
        if (error.code === '42P04') {
            console.log('4. Database already exists (this might be OK)');
        }

        throw error;
    }
}

// Export for use in other scripts
module.exports = { createTeachingDatabase };

// Run if called directly
if (require.main === module) {
    createTeachingDatabase().catch(console.error);
}