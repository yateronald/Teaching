-- Migration 011: Expression Orale AI Simulations
-- Stores student simulation sessions, transcripts, and AI evaluations

CREATE TABLE IF NOT EXISTS eo_simulations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Selected content for this session
    tache2_sujet_id INTEGER REFERENCES tcf_eo_sujets(id) ON DELETE SET NULL,
    tache3_sujet_id INTEGER REFERENCES tcf_eo_sujets(id) ON DELETE SET NULL,
    -- Transcripts of student speech for each tâche
    tache1_transcript TEXT,
    tache2_transcript TEXT,
    tache3_transcript TEXT,
    -- AI follow-up questions during Tâche 1
    tache1_questions JSONB DEFAULT '[]',
    -- Final evaluation
    overall_score NUMERIC(4,2),
    tache1_score NUMERIC(4,2),
    tache2_score NUMERIC(4,2),
    tache3_score NUMERIC(4,2),
    tache1_feedback TEXT,
    tache2_feedback TEXT,
    tache3_feedback TEXT,
    overall_feedback TEXT,
    -- Detailed criteria scores (JSONB: { coherence, vocabulary, grammar, fluency, task_completion })
    criteria_scores JSONB DEFAULT '{}',
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eo_simulations_user ON eo_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_eo_simulations_status ON eo_simulations(status);
CREATE INDEX IF NOT EXISTS idx_eo_simulations_created ON eo_simulations(created_at DESC);
