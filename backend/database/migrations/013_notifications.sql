-- ============================================================
-- 013_notifications.sql
-- In-app notifications for students and teachers.
--
-- Schema:
--   type values:
--     'quiz_published'        : student — new quiz available
--     'resource_uploaded'     : student — teacher uploaded resource
--     'schedule_created'      : student — batch timetable created/updated
--     'batch_assigned'        : student — added to a batch
--     'demo_assigned'         : teacher — admin assigned a demo
--   link        : relative path the frontend should navigate to (deep link)
--   entity_type : 'quiz', 'resource', 'batch', 'demo_request' (audit)
--   entity_id   : id of the source entity (audit)
--   sender_id   : optional originator (e.g., teacher who uploaded)
-- ============================================================

-- Drop any earlier notifications table that used different column names
-- (older `body` / `link_path` / `actor_user_id` schema). Notification rows
-- are ephemeral, so dropping here is safe.
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    entity_type VARCHAR(40),
    entity_id INTEGER,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_recent
    ON notifications(user_id, created_at DESC);
