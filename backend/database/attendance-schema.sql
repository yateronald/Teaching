-- Attendance Management System Schema
-- Comprehensive attendance tracking with access codes and audit logging

-- Table: class_sessions
-- Tracks individual class sessions with access codes
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
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, started, ended, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_sessions_schedule_id FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_sessions_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_sessions_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_class_sessions_schedule_date UNIQUE (schedule_id, session_date)
);

-- Table: attendance_records
-- Main attendance tracking table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'absent', -- present, absent, late, excused
    marked_at TIMESTAMP,
    code_entered_at TIMESTAMP,
    entered_code VARCHAR(8),
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    marked_by INTEGER, -- teacher_id who manually marked (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_records_session_id FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_records_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_records_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_records_marked_by FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_attendance_records_session_student UNIQUE (session_id, student_id)
);

-- Table: teacher_attendance
-- Track teacher attendance and code generation
CREATE TABLE teacher_attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'absent', -- present, absent, late
    code_generated BOOLEAN DEFAULT FALSE,
    session_started BOOLEAN DEFAULT FALSE,
    marked_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_attendance_session_id FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_attendance_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_attendance_batch_id FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT uk_teacher_attendance_session_teacher UNIQUE (session_id, teacher_id)
);

-- Table: attendance_audit_log
-- Comprehensive audit logging for all attendance actions
CREATE TABLE attendance_audit_log (
    id SERIAL PRIMARY KEY,
    session_id INTEGER,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- code_generated, code_sent, student_joined, attendance_marked, session_started, session_ended
    target_user_id INTEGER, -- student_id for student-related actions
    old_status TEXT,
    new_status TEXT,
    access_code VARCHAR(8),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_audit_session_id FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_attendance_audit_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_audit_target_user_id FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: attendance_settings
-- System-wide attendance configuration
CREATE TABLE attendance_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default attendance settings (idempotent)
INSERT INTO attendance_settings (setting_key, setting_value, description) VALUES
('code_length', '6', 'Length of access codes'),
('code_expiry_minutes', '30', 'Minutes before access code expires'),
('early_start_minutes', '15', 'Minutes before class when teacher can start session'),
('late_join_minutes', '10', 'Minutes after class start when students can still join'),
('auto_end_minutes', '15', 'Minutes after scheduled end time to auto-end session'),
('require_code_for_attendance', 'true', 'Whether students must enter code to be marked present')
ON CONFLICT (setting_key) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_class_sessions_schedule_date ON class_sessions(schedule_id, session_date);
CREATE INDEX idx_class_sessions_batch_teacher ON class_sessions(batch_id, teacher_id);
CREATE INDEX idx_class_sessions_status ON class_sessions(status);
CREATE INDEX idx_class_sessions_date_range ON class_sessions(session_date, start_time);

CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_batch ON attendance_records(batch_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_date ON attendance_records(created_at);

CREATE INDEX idx_teacher_attendance_session ON teacher_attendance(session_id);
CREATE INDEX idx_teacher_attendance_teacher ON teacher_attendance(teacher_id);
CREATE INDEX idx_teacher_attendance_status ON teacher_attendance(status);

CREATE INDEX idx_attendance_audit_session ON attendance_audit_log(session_id);
CREATE INDEX idx_attendance_audit_user ON attendance_audit_log(user_id);
CREATE INDEX idx_attendance_audit_action ON attendance_audit_log(action_type);
CREATE INDEX idx_attendance_audit_date ON attendance_audit_log(created_at);

-- Views for common queries
-- View: attendance_summary
CREATE VIEW attendance_summary AS
SELECT 
    ar.session_id,
    cs.batch_id,
    cs.session_date,
    cs.start_time,
    cs.end_time,
    b.name as batch_name,
    u.first_name || ' ' || u.last_name as teacher_name,
    COUNT(ar.id) as total_students,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id), 0)), 2
    ) as attendance_percentage
FROM attendance_records ar
JOIN class_sessions cs ON ar.session_id = cs.id
JOIN batches b ON cs.batch_id = b.id
JOIN users u ON cs.teacher_id = u.id
GROUP BY ar.session_id, cs.batch_id, cs.session_date, cs.start_time, cs.end_time, b.name, u.first_name, u.last_name;

-- View: student_attendance_stats
CREATE VIEW student_attendance_stats AS
SELECT 
    ar.student_id,
    ar.batch_id,
    u.first_name || ' ' || u.last_name as student_name,
    u.email as student_email,
    b.name as batch_name,
    COUNT(ar.id) as total_sessions,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_sessions,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_sessions,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_sessions,
    ROUND(
        (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id), 0)), 2
    ) as attendance_percentage
FROM attendance_records ar
JOIN users u ON ar.student_id = u.id
JOIN batches b ON ar.batch_id = b.id
GROUP BY ar.student_id, ar.batch_id, u.first_name, u.last_name, u.email, b.name;

-- View: teacher_session_stats
CREATE VIEW teacher_session_stats AS
SELECT 
    ta.teacher_id,
    ta.batch_id,
    u.first_name || ' ' || u.last_name as teacher_name,
    u.email as teacher_email,
    b.name as batch_name,
    COUNT(ta.id) as total_sessions,
    COUNT(CASE WHEN ta.status = 'present' THEN 1 END) as present_sessions,
    COUNT(CASE WHEN ta.code_generated = true THEN 1 END) as sessions_with_code,
    COUNT(CASE WHEN ta.session_started = true THEN 1 END) as sessions_started,
    ROUND(
        (COUNT(CASE WHEN ta.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(ta.id), 0)), 2
    ) as attendance_percentage,
    ROUND(
        (COUNT(CASE WHEN ta.code_generated = true THEN 1 END) * 100.0 / NULLIF(COUNT(ta.id), 0)), 2
    ) as code_generation_percentage
FROM teacher_attendance ta
JOIN users u ON ta.teacher_id = u.id
JOIN batches b ON ta.batch_id = b.id
GROUP BY ta.teacher_id, ta.batch_id, u.first_name, u.last_name, u.email, b.name;