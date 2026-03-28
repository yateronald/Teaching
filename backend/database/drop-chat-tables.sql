-- =====================================================
-- DROP ALL CHAT TABLES, FUNCTIONS, TRIGGERS, AND VIEWS
-- Run this against your PostgreSQL database to remove chat feature
-- =====================================================

-- Drop views first
DROP VIEW IF EXISTS v_conversations_with_details CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
DROP TRIGGER IF EXISTS trigger_update_last_message_time ON messages;
DROP TRIGGER IF EXISTS trigger_user_status_updated_at ON user_status;
DROP TRIGGER IF EXISTS trigger_increment_unread_count ON messages;

-- Drop functions
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS update_user_status_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_unread_count() CASCADE;
DROP FUNCTION IF EXISTS get_direct_conversation(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS can_user_access_conversation(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS mark_messages_as_read(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_total_unread_count(INTEGER) CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS chat_notifications CASCADE;
DROP TABLE IF EXISTS user_status CASCADE;
DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Done
SELECT 'Chat tables dropped successfully' AS result;
