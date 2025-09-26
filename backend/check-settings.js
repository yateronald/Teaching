const { Client } = require('pg');
require('dotenv').config();

async function checkAttendanceSettings() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_settings'
      )
    `);
    
    console.log('attendance_settings table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      const settings = await client.query('SELECT * FROM attendance_settings');
      console.log('Current settings:', settings.rows);
    } else {
      console.log('Table does not exist - this is likely the cause of the undefined values');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkAttendanceSettings();