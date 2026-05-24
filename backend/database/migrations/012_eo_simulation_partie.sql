-- Migration 012: Add partie_id to eo_simulations
-- This allows the simulation to be tied to a specific partie (like CO series)
-- so students can practice a specific partie and view their performance history per-partie.

ALTER TABLE eo_simulations
  ADD COLUMN IF NOT EXISTS partie_id INTEGER REFERENCES tcf_eo_parties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eo_simulations_partie ON eo_simulations(partie_id);

-- Optional fields to also remember T1 details used in this session
ALTER TABLE eo_simulations
  ADD COLUMN IF NOT EXISTS tache1_tache_id INTEGER REFERENCES tcf_eo_taches(id) ON DELETE SET NULL;
