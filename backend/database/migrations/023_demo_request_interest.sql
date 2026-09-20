-- Migration 023: what a demo request is actually for.
--
-- Two kinds of people ask for a demo: those who want live classes with a
-- teacher, and those who only want exam practice (mock exams, corrections).
-- They need different questions and a different first reply, so a request now
-- says which it is, and carries the exam details when there are any.
--
-- Everything already in the table was a class request, which is what the
-- default records. Additive and safe to run twice.

ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS interest VARCHAR(16) NOT NULL DEFAULT 'classes';
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS target_exam VARCHAR(24);
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS exam_date DATE;
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS target_score VARCHAR(32);
-- The papers they want to practise, as 'ce,co,ee,eo'.
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS skills VARCHAR(32);

-- A weekly class timetable and a target class level mean nothing to someone
-- who only wants mock exams, so these two stop being required. Class requests
-- still send them, and nothing already stored changes.
ALTER TABLE demo_requests ALTER COLUMN interested_level DROP NOT NULL;
ALTER TABLE demo_requests ALTER COLUMN preferred_schedule DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_demo_requests_interest ON demo_requests(interest, status);
