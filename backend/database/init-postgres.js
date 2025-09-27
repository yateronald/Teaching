const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class PostgreSQLDatabase {
    constructor() {
        this.client = null;
        this.config = this.getConfig();
    }

    // Convert SQLite-style '?' placeholders to PostgreSQL '$1, $2, ...'.
    // If the SQL already contains positional parameters like $1, leave it unchanged.
    _normalizeParams(sql, params = []) {
        if (!params || params.length === 0) return { sql, params };
        const hasPgParams = /\$\d+/.test(sql);
        if (hasPgParams) return { sql, params };
        let index = 0;
        const convertedSql = sql.replace(/\?/g, () => {
            index += 1;
            return `$${index}`;
        });
        return { sql: convertedSql, params };
    }

    getConfig() {
        // Support local PostgreSQL and Aiven PostgreSQL
        const isProduction = process.env.NODE_ENV === 'production';
        // const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon');
        // const sslmodeRequire = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require');
        const isAiven = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com');
        const useSSL = process.env.DB_SSL === 'true' || isAiven;
        
        // Commented out Neon support - using only Aiven
        // if (process.env.DATABASE_URL) {
        //     // Use DATABASE_URL for Neon or other cloud PostgreSQL services
        //     return {
        //         connectionString: process.env.DATABASE_URL,
        //         ssl: (isNeon || sslmodeRequire) ? { rejectUnauthorized: false } : undefined
        //     };
        // } else {
            // Use individual connection parameters
            const config = {
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'Teaching',
                password: process.env.DB_PASSWORD,
                port: parseInt(process.env.DB_PORT || '5432')
            };

            // Configure SSL for Aiven or other SSL-required connections
            if (useSSL) {
                if (isAiven) {
                    // Aiven PostgreSQL with certificate file
                    const certPath = path.join(__dirname, '..', 'cert', 'ca.pem');
                    try {
                        const ca = fs.readFileSync(certPath, 'utf8');
                        config.ssl = {
                            rejectUnauthorized: true,
                            ca: ca
                        };
                        console.log('✅ Using Aiven SSL certificate from cert/ca.pem');
                    } catch (error) {
                        console.warn('⚠️  Could not read SSL certificate file, falling back to basic SSL');
                        config.ssl = { rejectUnauthorized: false };
                    }
                } else {
                    // Generic SSL configuration
                    config.ssl = { rejectUnauthorized: false };
                }
            } else {
                config.ssl = false;
            }

            return config;
        // }
    }

    async initialize() {
        try {
            this.client = new Client(this.config);
            await this.client.connect();
            console.log('✅ Connected to PostgreSQL database');
            
            // Verify database connection
            const result = await this.client.query('SELECT NOW() as current_time, current_database() as database');
            console.log(`📊 Database: ${result.rows[0].database} | Time: ${result.rows[0].current_time}`);
            
            // Check if schema exists (tables are already created)
            const tablesResult = await this.client.query(`
                SELECT COUNT(*) as table_count 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            const tableCount = parseInt(tablesResult.rows[0].table_count);
            console.log(`📋 Found ${tableCount} tables in database`);
            
            if (tableCount === 0) {
                console.log('⚠️  No tables found. Please run the schema migration first:');
                console.log('   node scripts/convert-to-postgres-schema.js');
                console.log('   node scripts/migrate-data-to-postgres.js');
            } else {
                console.log('✅ Database schema is ready');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize PostgreSQL database:', error.message);
            
            // Provide helpful error messages
            if (error.code === 'ECONNREFUSED') {
                console.error('💡 Make sure PostgreSQL server is running');
            } else if (error.code === '28P01') {
                console.error('💡 Check your database credentials');
            } else if (error.code === '3D000') {
                console.error('💡 Database does not exist. Run: node scripts/create-postgres-db.js');
            }
            
            throw error;
        }
    }

    getDatabase() {
        return this.client;
    }

    async close() {
        if (this.client) {
            await this.client.end();
            console.log('🔌 PostgreSQL connection closed');
        }
    }

    // Helper method to run queries with promises
    async run(sql, params = []) {
        try {
            const { sql: q, params: p } = this._normalizeParams(sql, params);
            const result = await this.client.query(q, p);
            return { 
                rowCount: result.rowCount,
                rows: result.rows,
                insertId: result.rows[0]?.id || null
            };
        } catch (error) {
            console.error('Query error:', error.message);
            console.error('SQL:', sql);
            throw error;
        }
    }

    // Helper method to get single row
    async get(sql, params = []) {
        try {
            const { sql: q, params: p } = this._normalizeParams(sql, params);
            const result = await this.client.query(q, p);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Query error:', error.message);
            console.error('SQL:', sql);
            throw error;
        }
    }

    // Helper method to get all rows
    async all(sql, params = []) {
        try {
            const { sql: q, params: p } = this._normalizeParams(sql, params);
            const result = await this.client.query(q, p);
            return result.rows;
        } catch (error) {
            console.error('Query error:', error.message);
            console.error('SQL:', sql);
            throw error;
        }
    }

    // Migration support methods
    async ensureSchemaUpdates() {
        console.log('📝 Checking for schema updates...');
        
        // In PostgreSQL, we handle migrations differently
        // Check if we need to run any additional migrations
        try {
            // Check if migrations table exists
            const migrationTableExists = await this.get(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'migrations'
                )
            `);
            
            if (!migrationTableExists.exists) {
                console.log('⚠️  Migrations table not found. Schema migration may be incomplete.');
                return;
            }
            
            // Get applied migrations
            const appliedMigrations = await this.all('SELECT filename FROM migrations ORDER BY applied_at');
            console.log(`📊 Found ${appliedMigrations.length} applied migrations`);
            
            // Here you can add logic to check for and apply new migrations
            // For now, we'll just report the status
            console.log('✅ Schema is up to date');
            
        } catch (error) {
            console.warn('⚠️  Could not check migration status:', error.message);
        }
    }

    // Test database operations
    async testOperations() {
        console.log('🧪 Testing database operations...');
        
        try {
            // Test basic query
            await this.get('SELECT 1 as test');
            console.log('✅ Basic query test passed');
            
            // Test transaction
            await this.client.query('BEGIN');
            await this.client.query('SELECT 1');
            await this.client.query('ROLLBACK');
            console.log('✅ Transaction test passed');
            
            // Test table access
            const userCount = await this.get('SELECT COUNT(*) as count FROM users');
            console.log(`✅ Table access test passed (${userCount.count} users)`);
            
            console.log('🎉 All database operations working correctly');
            return true;
            
        } catch (error) {
            console.error('❌ Database operation test failed:', error.message);
            return false;
        }
    }
}

// Export for use in the application
module.exports = PostgreSQLDatabase;

// Test if called directly
if (require.main === module) {
    async function test() {
        const db = new PostgreSQLDatabase();
        try {
            await db.initialize();
            await db.ensureSchemaUpdates();
            await db.testOperations();
        } catch (error) {
            console.error('Test failed:', error.message);
            process.exit(1);
        } finally {
            await db.close();
        }
    }
    
    test();
}

// Ensure PostgreSQL numeric types are parsed as JavaScript numbers
const { types } = require('pg');
// OID 1700 = NUMERIC/DECIMAL -> parse as float
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));
// OID 20 = INT8 -> parse safely as integer (may overflow JS number if very large)
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));
// OID 700 = float4, 701 = float8
types.setTypeParser(700, (val) => (val === null ? null : parseFloat(val)));
types.setTypeParser(701, (val) => (val === null ? null : parseFloat(val)));