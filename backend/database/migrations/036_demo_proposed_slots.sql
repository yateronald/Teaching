-- 036: Flexible multi-slot proposed availability options for demo requests.
-- Safe to run multiple times (idempotent).

ALTER TABLE demo_availability_requests
  ADD COLUMN IF NOT EXISTS proposed_slots JSONB;
