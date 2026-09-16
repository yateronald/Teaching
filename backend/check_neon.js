const { Client } = require('pg');
require('dotenv').config();

async function run() {
    process.env.TZ = 'UTC';
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.log('No DATABASE_URL found in env');
        return;
    }
    console.log('Connecting to Neon database at:', connectionString.split('@')[1]);
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    const dbTime = await client.query('SELECT NOW() as current_time');
    console.log('Neon Database time (NOW()):', dbTime.rows[0].current_time);

    const quizzes = await client.query("SELECT id, title, status, start_date, end_date, created_at FROM quizzes WHERE created_at >= '2026-05-25 00:00:00' ORDER BY id DESC");
    console.log('Quizzes in Neon created today:', quizzes.rows);
    
    await client.end();
}

run().catch(console.error);
