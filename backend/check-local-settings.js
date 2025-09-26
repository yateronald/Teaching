const { Client } = require('pg');

async function checkLocalAttendanceSettings() {
  // Local PostgreSQL connection
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Teaching',
    user: 'postgres',
    password: '10108924',
    ssl: false
  });
  
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL database');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_settings'
      )
    `);
    
    console.log('attendance_settings table exists in local DB:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      const settings = await client.query('SELECT * FROM attendance_settings ORDER BY setting_key');
      console.log('Local attendance settings:');
      console.table(settings.rows);
      return settings.rows;
    } else {
      console.log('No attendance_settings table found in local database');
      return [];
    }
    
  } catch (error) {
    console.error('Error connecting to local PostgreSQL:', error.message);
    return [];
  } finally {
    await client.end();
  }
}

checkLocalAttendanceSettings();