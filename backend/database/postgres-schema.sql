-- PostgreSQL Schema for French Teaching Platform
-- Generated from SQLite schema analysis
-- Migration Date: 2025-09-20T23:57:30.216Z

-- Enable UUID extension (for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table creation statements
-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TEXT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    password_changed_at TIMESTAMP,
    password_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP,
    account_locked_until TIMESTAMP,
    CONSTRAINT uk_users_2 UNIQUE (email),
    CONSTRAINT uk_users_1 UNIQUE (username)
);


-- Table: batches
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_id INTEGER NOT NULL,
    french_level VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    default_location_mode TEXT DEFAULT 'online',
    timezone TEXT DEFAULT 'UTC',
    default_location TEXT,
    default_link TEXT,
    CONSTRAINT fk_batches_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Table: batch_students
CREATE TABLE batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_students_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_batch_students_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT uk_batch_students_1 UNIQUE (batch_id, student_id)
);


-- Table: batch_timetables
CREATE TABLE batch_timetables (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    location_mode TEXT NOT NULL DEFAULT 'online',
    location TEXT,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_timetables_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);


-- Table: class_schedules
CREATE TABLE class_schedules (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_schedules_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);


-- Table: quizzes
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    duration_minutes INTEGER,
    total_marks NUMERIC DEFAULT 0,
    instructions TEXT,
    randomize_questions BOOLEAN DEFAULT FALSE,
    randomize_options BOOLEAN DEFAULT FALSE,
    auto_submit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Table: questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    marks NUMERIC DEFAULT 1,
    correct_answer TEXT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);


-- Table: question_options
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_correct BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_question_options_question_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);


-- Table: quiz_batches
CREATE TABLE quiz_batches (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_batches_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_batches_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT uk_quiz_batches_1 UNIQUE (quiz_id, batch_id)
);


-- Table: quiz_submissions
CREATE TABLE quiz_submissions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT DEFAULT 'not_started',
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_minutes INTEGER,
    total_score NUMERIC DEFAULT 0,
    max_score NUMERIC DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    auto_saved_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at_utc TIMESTAMP,
    submitted_at_utc TIMESTAMP,
    auto_submit_at_utc TIMESTAMP,
    server_time_offset_minutes INTEGER DEFAULT 0,
    CONSTRAINT fk_quiz_submissions_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_submissions_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT uk_quiz_submissions_1 UNIQUE (quiz_id, student_id)
);


-- Table: student_answers
CREATE TABLE student_answers (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    selected_options TEXT,
    marks_awarded NUMERIC DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_answers_question_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_answers_submission_id FOREIGN KEY (submission_id) REFERENCES quiz_submissions(id) ON DELETE CASCADE,
    CONSTRAINT uk_student_answers_1 UNIQUE (submission_id, question_id)
);


-- Table: quiz_reminders_sent
CREATE TABLE quiz_reminders_sent (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_reminders_sent_quiz_id FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);


-- Table: resources
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    batch_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_resources_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Table: schedules
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type TEXT NOT NULL,
    batch_id INTEGER NOT NULL,
    teacher_id INTEGER,
    subject TEXT,
    topic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_mode TEXT NOT NULL DEFAULT 'physical',
    location TEXT,
    link TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    CONSTRAINT fk_schedules_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);


-- Table: user_batches (relationship table for users and batches)
CREATE TABLE user_batches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_batches_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_batches_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_batches_1 UNIQUE (user_id, batch_id)
);


-- Table: attendance (attendance records table)
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'absent',
    check_in_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_session_id FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_attendance_session_student UNIQUE (session_id, student_id)
);


-- Table: class_sessions
CREATE TABLE class_sessions (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    access_code VARCHAR(8),
    code_generated_at TIMESTAMP,
    code_expires_at TIMESTAMP,
    session_started_at TIMESTAMP,
    session_ended_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'scheduled',
    subject TEXT,
    topic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_sessions_schedule_id FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_sessions_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_sessions_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_class_sessions_schedule_date UNIQUE (schedule_id, session_date)
);


-- Table: email_change_requests
CREATE TABLE email_change_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    old_email TEXT NOT NULL,
    new_email TEXT NOT NULL,
    code TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_change_requests_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Table: password_reset_requests
CREATE TABLE password_reset_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    reset_token_hash TEXT,
    reset_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_requests_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Table: migrations
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_migrations_1 UNIQUE (filename)
);


-- Table: demo_requests
CREATE TABLE demo_requests (
    id SERIAL PRIMARY KEY,
    -- Step 1: Personal Information
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    
    -- Step 2: French Learning Background
    has_previous_experience VARCHAR(50) NOT NULL,
    current_level VARCHAR(20) NOT NULL,
    previous_study_method VARCHAR(50),
    
    -- Step 3: Learning Goals & Preferences
    interested_level VARCHAR(20) NOT NULL,
    learning_goals TEXT NOT NULL,
    expectations TEXT,
    
    -- Step 4: Scheduling & Availability
    expected_start_time VARCHAR(50) NOT NULL,
    preferred_schedule VARCHAR(100) NOT NULL,
    timezone VARCHAR(50),
    
    -- System fields
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    contacted_at TIMESTAMP,
    demo_scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_failed_attempts ON users (failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_role_name ON users (role, first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_batches_teacher ON batches (teacher_id);

CREATE INDEX IF NOT EXISTS idx_batch_students_batch ON batch_students (batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_students_student ON batch_students (student_id);

CREATE INDEX IF NOT EXISTS idx_batch_timetables_active ON batch_timetables (is_active);
CREATE INDEX IF NOT EXISTS idx_batch_timetables_batch_day ON batch_timetables (batch_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_batch_timetables_day ON batch_timetables (day_of_week);
CREATE INDEX IF NOT EXISTS idx_batch_timetables_batch ON batch_timetables (batch_id);

CREATE INDEX IF NOT EXISTS idx_class_schedules_batch ON class_schedules (batch_id);

CREATE INDEX IF NOT EXISTS idx_quizzes_status_created ON quizzes (status, created_at);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_created ON quizzes (teacher_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_status ON quizzes (teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes (status);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes (teacher_id);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_order ON questions (quiz_id, question_order);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions (quiz_id);

CREATE INDEX IF NOT EXISTS idx_question_options_question_order ON question_options (question_id, option_order);

CREATE INDEX IF NOT EXISTS idx_quiz_batches_batch ON quiz_batches (batch_id);

CREATE INDEX IF NOT EXISTS idx_submissions_quiz_submitted ON quiz_submissions (quiz_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_student_submitted ON quiz_submissions (student_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_status ON quiz_submissions (quiz_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON quiz_submissions (status);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_started_utc ON quiz_submissions (started_at_utc);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_auto_submit_utc ON quiz_submissions (auto_submit_at_utc);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON quiz_submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz ON quiz_submissions (quiz_id);

CREATE INDEX IF NOT EXISTS idx_answers_question ON student_answers (question_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON student_answers (submission_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_reminders_unique ON quiz_reminders_sent (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_reminders_sent_at ON quiz_reminders_sent (sent_at);
CREATE INDEX IF NOT EXISTS idx_quiz_reminders_quiz ON quiz_reminders_sent (quiz_id);

CREATE INDEX IF NOT EXISTS idx_resources_teacher_created ON resources (teacher_id, created_at);
CREATE INDEX IF NOT EXISTS idx_resources_teacher ON resources (teacher_id);
CREATE INDEX IF NOT EXISTS idx_resources_batch ON resources (batch_id);

CREATE INDEX IF NOT EXISTS idx_schedules_batch_start ON schedules (batch_id, start_time);

CREATE INDEX IF NOT EXISTS idx_ecr_user_code ON email_change_requests (user_id, code);
CREATE INDEX IF NOT EXISTS idx_ecr_expires ON email_change_requests (expires_at);
CREATE INDEX IF NOT EXISTS idx_ecr_user_status ON email_change_requests (user_id, status);

CREATE INDEX IF NOT EXISTS idx_prr_user_code ON password_reset_requests (user_id, code);
CREATE INDEX IF NOT EXISTS idx_prr_expires ON password_reset_requests (expires_at);
CREATE INDEX IF NOT EXISTS idx_prr_user_status ON password_reset_requests (user_id, status);

CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests (email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests (status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests (created_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status_created ON demo_requests (status, created_at);

