-- Migration: Add teacher assignment and meeting link fields to demo_requests table
-- Date: 2024-01-XX
-- Description: Add teacher_id, meeting_link, and reminder_sent fields to support teacher assignment and scheduling

-- Add teacher assignment field
ALTER TABLE demo_requests 
ADD COLUMN teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add meeting link field
ALTER TABLE demo_requests 
ADD COLUMN meeting_link VARCHAR(500);

-- Add reminder tracking fields
ALTER TABLE demo_requests 
ADD COLUMN teacher_reminder_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE demo_requests 
ADD COLUMN student_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add index for teacher_id for better performance
CREATE INDEX IF NOT EXISTS idx_demo_requests_teacher_id ON demo_requests(teacher_id);

-- Add index for demo_scheduled_at for reminder queries
CREATE INDEX IF NOT EXISTS idx_demo_requests_scheduled_at ON demo_requests(demo_scheduled_at);