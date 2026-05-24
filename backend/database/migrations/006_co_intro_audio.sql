-- Migration 006: Add intro audio support to CO series
-- Adds two columns to tcf_co_series for a series-level introduction audio file

ALTER TABLE tcf_co_series ADD COLUMN IF NOT EXISTS intro_audio_kdrive_file_id INTEGER;
ALTER TABLE tcf_co_series ADD COLUMN IF NOT EXISTS intro_audio_file_name VARCHAR(255);
