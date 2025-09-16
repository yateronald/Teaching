-- Migration 002: Update database to support fractional scoring
-- This migration converts INTEGER columns to REAL for marks and scores

-- Create new tables with REAL columns
CREATE TABLE questions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq_single', 'mcq_multiple', 'yes_no')),
    question_order INTEGER NOT NULL,
    marks REAL DEFAULT 1,
    correct_answer TEXT,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quizzes_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    start_date DATETIME,
    end_date DATETIME,
    duration_minutes INTEGER,
    total_marks REAL DEFAULT 0,
    instructions TEXT,
    randomize_questions BOOLEAN DEFAULT FALSE,
    randomize_options BOOLEAN DEFAULT FALSE,
    auto_submit BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE quiz_submissions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'auto_submitted', 'graded')),
    started_at DATETIME,
    submitted_at DATETIME,
    time_taken_minutes INTEGER,
    total_score REAL DEFAULT 0,
    max_score REAL DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    auto_saved_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(quiz_id, student_id)
);

CREATE TABLE student_answers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    selected_options TEXT,
    marks_awarded REAL DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES quiz_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(submission_id, question_id)
);

-- Copy data from old tables to new tables
INSERT INTO questions_new SELECT * FROM questions;
INSERT INTO quizzes_new SELECT * FROM quizzes;
INSERT INTO quiz_submissions_new SELECT * FROM quiz_submissions;
INSERT INTO student_answers_new SELECT * FROM student_answers;

-- Drop old tables
DROP TABLE student_answers;
DROP TABLE quiz_submissions;
DROP TABLE questions;
DROP TABLE quizzes;

-- Rename new tables to original names
ALTER TABLE questions_new RENAME TO questions;
ALTER TABLE quizzes_new RENAME TO quizzes;
ALTER TABLE quiz_submissions_new RENAME TO quiz_submissions;
ALTER TABLE student_answers_new RENAME TO student_answers;

-- Recreate indexes
CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_submissions_quiz ON quiz_submissions(quiz_id);
CREATE INDEX idx_submissions_student ON quiz_submissions(student_id);
CREATE INDEX idx_answers_submission ON student_answers(submission_id);
CREATE INDEX idx_answers_question ON student_answers(question_id);
