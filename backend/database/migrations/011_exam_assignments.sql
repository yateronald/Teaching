-- Migration 011: Unified TCF Exam Assignments
-- Supports assigning any content node (category, series, year, month, combinaison, partie)
-- to students or batches with optional expiration

CREATE TABLE IF NOT EXISTS tcf_exam_assignments (
    id SERIAL PRIMARY KEY,
    -- What content is assigned (polymorphic — exactly one should be set)
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
        'category',
        'ce_series', 'co_series',
        'ee_year', 'ee_month', 'ee_combinaison',
        'eo_year', 'eo_month', 'eo_partie'
    )),
    content_id INTEGER NOT NULL,
    -- Who it is assigned to (at least one must be set)
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    -- Settings
    expires_at TIMESTAMP,          -- NULL = never expires
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- At least one recipient
    CHECK (student_id IS NOT NULL OR batch_id IS NOT NULL)
);

-- Prevent duplicate assignments for same content+recipient
CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ea_student
    ON tcf_exam_assignments(content_type, content_id, student_id) WHERE student_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ea_batch
    ON tcf_exam_assignments(content_type, content_id, batch_id) WHERE batch_id IS NOT NULL;

-- Query indexes
CREATE INDEX IF NOT EXISTS idx_tcf_ea_content ON tcf_exam_assignments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_tcf_ea_student_id ON tcf_exam_assignments(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tcf_ea_batch_id ON tcf_exam_assignments(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tcf_ea_expires ON tcf_exam_assignments(expires_at) WHERE expires_at IS NOT NULL;
