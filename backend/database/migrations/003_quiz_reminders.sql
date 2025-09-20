-- Migration 003: Add quiz reminders tracking table
-- This migration adds a table to track sent quiz reminder notifications

-- Create quiz_reminders_sent table to track sent reminders
CREATE TABLE IF NOT EXISTS quiz_reminders_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    sent_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_reminders_quiz ON quiz_reminders_sent(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_reminders_sent_at ON quiz_reminders_sent(sent_at);

-- Ensure unique constraint to prevent duplicate reminders for the same quiz
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_reminders_unique ON quiz_reminders_sent(quiz_id);