const PostgreSQLDatabase = require('./database/init-postgres');
require('dotenv').config();

async function run() {
    process.env.TZ = 'UTC';
    const db = new PostgreSQLDatabase();
    await db.initialize();
    
    const quizzes = await db.all("SELECT id, title, status, start_date, end_date, created_at FROM quizzes WHERE created_at >= '2026-05-25 00:00:00' ORDER BY id DESC");
    console.log('Quizzes created on or after May 25, 2026:', quizzes);
    
    await db.close();
}

run().catch(console.error);
