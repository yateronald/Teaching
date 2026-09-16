require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        
        // Check timezone config in PostgreSQL
        const tzRes = await db.get('SHOW TIMEZONE');
        console.log('PostgreSQL session timezone:', tzRes);

        // Get NOW() from PG
        const nowRes = await db.get('SELECT NOW() as pg_now, CURRENT_TIMESTAMP as current_ts');
        console.log('PostgreSQL NOW() / CURRENT_TIMESTAMP:', nowRes);

        // Get the latest quiz dates
        const quiz = await db.get(`
            SELECT id, title, status, start_date, end_date,
                   start_date AT TIME ZONE 'UTC' as start_utc,
                   end_date AT TIME ZONE 'UTC' as end_utc
            FROM quizzes
            ORDER BY id DESC
            LIMIT 1
        `);
        console.log('Latest quiz:', quiz);

        if (quiz) {
            // Check how NOW() compares to start_date and end_date in PG
            const comparison = await db.get(`
                SELECT 
                    ($1 > NOW()) as start_greater_than_now,
                    ($2 <= NOW()) as end_less_than_or_equal_to_now,
                    $2 - NOW() as time_diff
            `, [quiz.start_date, quiz.end_date]);
            console.log('PG Comparisons:', comparison);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await db.close();
    }
}

run();
