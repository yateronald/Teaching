-- Migration 019: structured reports for the Expression orale / écrite simulations.
-- Additive only: nullable columns, no data rewritten. Legacy columns stay filled
-- so analytics, admin and teacher screens keep working unchanged.

ALTER TABLE eo_simulations
  ADD COLUMN IF NOT EXISTS evaluation JSONB,
  ADD COLUMN IF NOT EXISTS scoring_version SMALLINT,
  ADD COLUMN IF NOT EXISTS cefr_level VARCHAR(2),
  ADD COLUMN IF NOT EXISTS nclc_level SMALLINT,
  ADD COLUMN IF NOT EXISTS evaluation_attempts SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE tcf_ee_simulations
  ADD COLUMN IF NOT EXISTS evaluation JSONB,
  ADD COLUMN IF NOT EXISTS scoring_version SMALLINT,
  ADD COLUMN IF NOT EXISTS nclc_level SMALLINT,
  ADD COLUMN IF NOT EXISTS evaluation_attempts SMALLINT NOT NULL DEFAULT 0;
