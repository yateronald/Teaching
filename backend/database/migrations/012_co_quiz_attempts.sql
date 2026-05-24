-- Migration 012: CO Quiz Attempts for student exam taking
-- Stores quiz attempts, answers, and grading results

CREATE TABLE IF NOT EXISTS tcf_co_quiz_attempts (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES tcf_co_series(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_seconds INTEGER,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    total_points NUMERIC DEFAULT 0,
    earned_points NUMERIC DEFAULT 0,
    score_percentage NUMERIC DEFAULT 0,
    cefr_level VARCHAR(2),
    is_auto_submitted BOOLEAN DEFAULT FALSE,
    answers JSONB NOT NULL DEFAULT '[]'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_co_attempts_series ON tcf_co_quiz_attempts(series_id);
CREATE INDEX IF NOT EXISTS idx_co_attempts_student ON tcf_co_quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_co_attempts_series_student ON tcf_co_quiz_attempts(series_id, student_id);
CREATE INDEX IF NOT EXISTS idx_co_attempts_completed ON tcf_co_quiz_attempts(completed_at DESC);
