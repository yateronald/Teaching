require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const ssl = fs.existsSync('./cert/ca.pem')
    ? { ca: fs.readFileSync('./cert/ca.pem').toString(), rejectUnauthorized: true }
    : false;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl });

async function migrate() {
    try {
        // Create quiz_audio_clips table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_audio_clips (
                id SERIAL PRIMARY KEY,
                quiz_id INTEGER NOT NULL,
                transcript TEXT NOT NULL,
                voice_name VARCHAR(50) DEFAULT 'Kore',
                source_type TEXT DEFAULT 'tts',
                kdrive_file_id VARCHAR(100),
                file_name VARCHAR(255),
                duration_seconds INTEGER,
                audio_order INTEGER DEFAULT 1,
                max_plays INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_audio_clips_quiz_id FOREIGN KEY (quiz_id)
                    REFERENCES quizzes(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ quiz_audio_clips table created');

        // Add audio_clip_id column to questions (if not exists)
        await pool.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'questions' AND column_name = 'audio_clip_id'
                ) THEN
                    ALTER TABLE questions
                        ADD COLUMN audio_clip_id INTEGER
                        REFERENCES quiz_audio_clips(id) ON DELETE SET NULL;
                END IF;
            END $$
        `);
        console.log('✅ audio_clip_id column added to questions');

        await pool.end();
        console.log('✅ Migration complete');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
        await pool.end();
        process.exit(1);
    }
}

migrate();
