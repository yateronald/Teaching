-- Migration 020: exam candidates (exam-preparation-only accounts) and reading practice.
-- Additive and safe to run twice: nothing existing is rewritten.
--
--   1. users.role accepts 'candidate' and nothing else outside the four roles.
--   2. exam_candidate_profiles — the candidate's exam goal (which test, target
--      NCLC, exam date) and a private admin note.
--   3. tcf_ce_quiz_attempts — Compréhension écrite practice, same shape as the
--      listening attempts (tcf_co_quiz_attempts).

-- ── 1. Role whitelist ────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check' AND conrelid = 'users'::regclass) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'teacher', 'student', 'candidate')) NOT VALID;
    ALTER TABLE users VALIDATE CONSTRAINT users_role_check;
  END IF;
END $$;

-- ── 2. Candidate exam goal ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_candidate_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    target_exam VARCHAR(20) NOT NULL DEFAULT 'tcf_canada'
        CHECK (target_exam IN ('tcf_canada', 'tcf_quebec', 'tcf_tp')),
    target_nclc SMALLINT CHECK (target_nclc BETWEEN 4 AND 10),
    exam_date DATE,
    admin_notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Reading practice attempts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tcf_ce_quiz_attempts (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES tcf_ce_series(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_ce_attempts_series_student ON tcf_ce_quiz_attempts(series_id, student_id);
CREATE INDEX IF NOT EXISTS idx_ce_attempts_student ON tcf_ce_quiz_attempts(student_id, completed_at DESC);
