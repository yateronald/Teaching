-- Migration 008: TCF Expression Orale tables
-- Structure: Category → Year → Month → Partie → 3 Tâches
-- Tâche 1 (Présentation): prompt + 4 points à aborder
-- Tâche 2 (Interaction): multiple sujets with prep_time, duration, prompt, correction
-- Tâche 3 (Argumentation): multiple sujets with duration, prompt, correction

-- ============================================================
-- 1. Seed the Expression Orale category
-- ============================================================
INSERT INTO tcf_categories (name, description, icon, display_order)
VALUES ('Expression Orale', 'Oral expression — TCF Canada', 'AudioOutlined', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. tcf_eo_years
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_years (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, year)
);

-- ============================================================
-- 3. tcf_eo_months
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_months (
    id SERIAL PRIMARY KEY,
    year_id INTEGER NOT NULL REFERENCES tcf_eo_years(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    month_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id, month)
);

-- ============================================================
-- 4. tcf_eo_parties (equivalent to combinaisons in EE)
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_parties (
    id SERIAL PRIMARY KEY,
    month_id INTEGER NOT NULL REFERENCES tcf_eo_months(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. tcf_eo_taches (the 3 task types per partie)
-- Each partie has exactly 3 tâches:
--   1 = presentation, 2 = interaction, 3 = argumentation
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_taches (
    id SERIAL PRIMARY KEY,
    partie_id INTEGER NOT NULL REFERENCES tcf_eo_parties(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL CHECK (task_number IN (1, 2, 3)),
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('presentation', 'interaction', 'argumentation')),
    prompt_text TEXT,
    prep_minutes NUMERIC(4,1) DEFAULT 0,
    duration_minutes NUMERIC(4,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partie_id, task_number)
);

-- ============================================================
-- 6. tcf_eo_points_aborder (for Tâche 1 — Présentation)
-- 4 talking points per presentation tâche
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_points_aborder (
    id SERIAL PRIMARY KEY,
    tache_id INTEGER NOT NULL REFERENCES tcf_eo_taches(id) ON DELETE CASCADE,
    point_number INTEGER NOT NULL CHECK (point_number >= 1 AND point_number <= 4),
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tache_id, point_number)
);

-- ============================================================
-- 7. tcf_eo_sujets (for Tâche 2 & 3 — multiple subjects/questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_eo_sujets (
    id SERIAL PRIMARY KEY,
    tache_id INTEGER NOT NULL REFERENCES tcf_eo_taches(id) ON DELETE CASCADE,
    sujet_number INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    duration_seconds INTEGER,
    correction_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tcf_eo_years_category ON tcf_eo_years(category_id);
CREATE INDEX IF NOT EXISTS idx_tcf_eo_months_year ON tcf_eo_months(year_id);
CREATE INDEX IF NOT EXISTS idx_tcf_eo_parties_month ON tcf_eo_parties(month_id);
CREATE INDEX IF NOT EXISTS idx_tcf_eo_taches_partie ON tcf_eo_taches(partie_id);
CREATE INDEX IF NOT EXISTS idx_tcf_eo_points_tache ON tcf_eo_points_aborder(tache_id);
CREATE INDEX IF NOT EXISTS idx_tcf_eo_sujets_tache ON tcf_eo_sujets(tache_id);
