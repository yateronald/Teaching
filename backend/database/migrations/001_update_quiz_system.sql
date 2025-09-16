-- Migration script to update quiz system for automated grading
-- Run this script to update existing database schema

-- Add new columns to quizzes table
ALTER TABLE quizzes ADD COLUMN start_date DATETIME;
ALTER TABLE quizzes ADD COLUMN end_date DATETIME;
ALTER TABLE quizzes ADD COLUMN duration_minutes INTEGER;
ALTER TABLE quizzes ADD COLUMN total_marks INTEGER DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN instructions TEXT;
ALTER TABLE quizzes ADD COLUMN randomize_questions BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN randomize_options BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN auto_submit BOOLEAN DEFAULT TRUE;

-- Update questions table
ALTER TABLE questions RENAME COLUMN points TO marks;
ALTER TABLE questions ADD COLUMN correct_answer TEXT;
ALTER TABLE questions ADD COLUMN explanation TEXT;

-- Update question types to support single/multiple MCQ
-- Note: SQLite doesn't support modifying CHECK constraints directly
-- We'll handle this in the application logic

-- Add is_correct column to question_options
ALTER TABLE question_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;

-- Update quiz_submissions table
ALTER TABLE quiz_submissions ADD COLUMN started_at DATETIME;
ALTER TABLE quiz_submissions ADD COLUMN time_taken_minutes INTEGER;
ALTER TABLE quiz_submissions ADD COLUMN percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quiz_submissions ADD COLUMN auto_saved_data TEXT;

-- Remove old columns from quiz_submissions
-- Note: SQLite doesn't support DROP COLUMN directly
-- We'll create a new table and migrate data

CREATE TABLE quiz_submissions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'auto_submitted', 'graded')),
    started_at DATETIME,
    submitted_at DATETIME,
    time_taken_minutes INTEGER,
    total_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    auto_saved_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(quiz_id, student_id)
);

-- Migrate data from old table
INSERT INTO quiz_submissions_new (
    id, quiz_id, student_id, status, submitted_at, total_score, max_score, created_at, updated_at
)
SELECT 
    id, quiz_id, student_id, 
    CASE 
        WHEN status = 'assigned' THEN 'not_started'
        WHEN status = 'submitted' THEN 'submitted'
        WHEN status = 'graded' THEN 'graded'
        ELSE 'not_started'
    END as status,
    submitted_at, total_score, max_score, created_at, updated_at
FROM quiz_submissions;

-- Drop old table and rename new one
DROP TABLE quiz_submissions;
ALTER TABLE quiz_submissions_new RENAME TO quiz_submissions;

-- Update student_answers table
ALTER TABLE student_answers RENAME COLUMN score TO marks_awarded;
ALTER TABLE student_answers ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;

-- Remove teacher_feedback column (not needed for automated grading)
-- Note: SQLite doesn't support DROP COLUMN directly
-- We'll create a new table and migrate data

CREATE TABLE student_answers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    selected_options TEXT,
    marks_awarded INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES quiz_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(submission_id, question_id)
);

-- Migrate data from old table
INSERT INTO student_answers_new (
    id, submission_id, question_id, answer_text, selected_options, marks_awarded, created_at, updated_at
)
SELECT 
    id, submission_id, question_id, answer_text, selected_options, marks_awarded, created_at, updated_at
FROM student_answers;

-- Drop old table and rename new one
DROP TABLE student_answers;
ALTER TABLE student_answers_new RENAME TO student_answers;

-- Recreate indexes
CREATE INDEX idx_submissions_quiz ON quiz_submissions(quiz_id);
CREATE INDEX idx_submissions_student ON quiz_submissions(student_id);
CREATE INDEX idx_answers_submission ON student_answers(submission_id);
CREATE INDEX idx_answers_question ON student_answers(question_id);

-- Update existing quiz data to set default values
UPDATE quizzes SET total_marks = 0 WHERE total_marks IS NULL;
UPDATE quizzes SET randomize_questions = FALSE WHERE randomize_questions IS NULL;
UPDATE quizzes SET randomize_options = FALSE WHERE randomize_options IS NULL;
UPDATE quizzes SET auto_submit = TRUE WHERE auto_submit IS NULL;

-- Update existing question options
UPDATE question_options SET is_correct = FALSE WHERE is_correct IS NULL;

-- Update existing student answers
UPDATE student_answers SET is_correct = FALSE WHERE is_correct IS NULL;
UPDATE student_answers SET marks_awarded = 0 WHERE marks_awarded IS NULL;