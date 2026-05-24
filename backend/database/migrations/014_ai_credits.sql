-- Per-student AI credit balance for Expression Écrite and Expression Orale
CREATE TABLE IF NOT EXISTS student_ai_credits (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ee_credits INTEGER NOT NULL DEFAULT 0,
    eo_credits INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit log of every credit change (grant from admin or consumption from attempt)
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_type VARCHAR(10) NOT NULL CHECK (credit_type IN ('ee', 'eo')),
    delta INTEGER NOT NULL,           -- positive = grant, negative = consumption
    reason VARCHAR(50) NOT NULL,      -- 'admin_grant', 'ee_attempt', 'eo_attempt', 'admin_adjust'
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- who triggered the change (admin or self)
    related_entity_type VARCHAR(40),  -- e.g. 'tcf_exam_assignment', 'tcf_ee_simulation', 'eo_simulation'
    related_entity_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user_recent ON ai_credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_type ON ai_credit_transactions(user_id, credit_type, created_at DESC);
