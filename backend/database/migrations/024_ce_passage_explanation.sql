-- Migration 024: reading documents as text, and the explanation of the answer.
--
-- Compréhension écrite documents used to be stored only as images. They now
-- arrive as proper text, stored in passage_text, and each question can carry
-- the explanation shown to learners in the correction.
--
-- A question keeps its image when it has one and no text yet, so series
-- imported before this migration still work. Additive and safe to run twice.

ALTER TABLE tcf_ce_questions ADD COLUMN IF NOT EXISTS passage_text TEXT;
ALTER TABLE tcf_ce_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
