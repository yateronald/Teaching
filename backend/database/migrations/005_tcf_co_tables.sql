-- Migration 005: TCF Compréhension Orale tables
-- Creates tables for CO (listening comprehension) category:
--   tcf_co_series, tcf_co_questions, tcf_co_series_assignments

-- ============================================================
-- 1. Seed the Compréhension Orale category
-- ============================================================
INSERT INTO tcf_categories (name, description, icon, display_order)
VALUES ('Compréhension Orale', 'Listening comprehension — TCF Canada', 'SoundOutlined', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. tcf_co_series — Compréhension Orale series
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_co_series (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER DEFAULT 0,
    total_points NUMERIC DEFAULT 0,
    cefr_thresholds JSONB NOT NULL DEFAULT '{"A1":0,"A2":0,"B1":0,"B2":0,"C1":0,"C2":0}',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. tcf_co_questions — questions with audio fields
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_co_questions (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES tcf_co_series(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    audio_kdrive_file_id INTEGER,
    audio_file_name VARCHAR(255),
    image_kdrive_file_id INTEGER,
    image_file_name VARCHAR(255),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
    cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
    points NUMERIC NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. tcf_co_series_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_co_series_assignments (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES tcf_co_series(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((student_id IS NOT NULL AND batch_id IS NULL) OR (student_id IS NULL AND batch_id IS NOT NULL))
);

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tcf_co_series_category ON tcf_co_series(category_id);
CREATE INDEX IF NOT EXISTS idx_tcf_co_questions_series ON tcf_co_questions(series_id);
CREATE INDEX IF NOT EXISTS idx_tcf_co_questions_series_order ON tcf_co_questions(series_id, question_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_co_sa_student ON tcf_co_series_assignments(series_id, student_id) WHERE student_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_co_sa_batch ON tcf_co_series_assignments(series_id, batch_id) WHERE batch_id IS NOT NULL;
