const { Client } = require('pg');
require('dotenv').config();

async function migrateAttendanceSettings() {
  console.log('🔄 Starting attendance settings migration from PostgreSQL to Neon...\n');

  // Local PostgreSQL connection
  const localClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Teaching',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: false
  });

  // Neon connection
  const neonClient = new Client({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
    ssl: process.env.NEON_DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    // Connect to both databases
    console.log('📡 Connecting to local PostgreSQL...');
    await localClient.connect();
    console.log('✅ Connected to local PostgreSQL');

    console.log('📡 Connecting to Neon...');
    await neonClient.connect();
    console.log('✅ Connected to Neon\n');

    // Get settings from local database
    console.log('📋 Fetching attendance settings from local PostgreSQL...');
    const localSettings = await localClient.query('SELECT * FROM attendance_settings ORDER BY setting_key');
    
    if (localSettings.rows.length === 0) {
      console.log('⚠️  No attendance settings found in local database');
      return;
    }

    console.log(`📊 Found ${localSettings.rows.length} attendance settings:`);
    localSettings.rows.forEach(setting => {
      console.log(`   • ${setting.setting_key}: ${setting.setting_value}`);
    });

    // Clear existing settings in Neon (if any)
    console.log('\n🧹 Clearing existing attendance settings in Neon...');
    await neonClient.query('DELETE FROM attendance_settings');
    console.log('✅ Cleared existing settings');

    // Insert settings into Neon
    console.log('\n📤 Migrating attendance settings to Neon...');
    let migratedCount = 0;

    for (const setting of localSettings.rows) {
      try {
        await neonClient.query(`
          INSERT INTO attendance_settings (setting_key, setting_value, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          setting.setting_key,
          setting.setting_value,
          setting.description,
          setting.created_at,
          setting.updated_at
        ]);
        
        console.log(`   ✅ Migrated: ${setting.setting_key} = ${setting.setting_value}`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${setting.setting_key}:`, error.message);
      }
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const neonSettings = await neonClient.query('SELECT * FROM attendance_settings ORDER BY setting_key');
    
    console.log(`✅ Migration completed! ${migratedCount}/${localSettings.rows.length} settings migrated successfully`);
    console.log('\n📋 Current attendance settings in Neon:');
    neonSettings.rows.forEach(setting => {
      console.log(`   • ${setting.setting_key}: ${setting.setting_value}`);
    });

    console.log('\n🎉 Attendance settings migration completed successfully!');
    console.log('💡 The server should now work properly with Neon database.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    try {
      await localClient.end();
      console.log('\n📡 Disconnected from local PostgreSQL');
    } catch (e) {
      console.log('⚠️  Local PostgreSQL connection already closed');
    }
    
    try {
      await neonClient.end();
      console.log('📡 Disconnected from Neon');
    } catch (e) {
      console.log('⚠️  Neon connection already closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  migrateAttendanceSettings()
    .then(() => {
      console.log('\n✨ Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAttendanceSettings };