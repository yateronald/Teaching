-- Migration 007: TCF Expression Écrite tables
-- Creates tables for EE (written expression) category:
--   tcf_ee_years, tcf_ee_months, tcf_ee_combinaisons, tcf_ee_taches

-- ============================================================
-- 1. Seed the Expression Écrite category
-- ============================================================
INSERT INTO tcf_categories (name, description, icon, display_order)
VALUES ('Expression Écrite', 'Written expression — TCF Canada', 'FormOutlined', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. tcf_ee_years
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_ee_years (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES tcf_categories(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, year)
);

-- ============================================================
-- 3. tcf_ee_months
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_ee_months (
    id SERIAL PRIMARY KEY,
    year_id INTEGER NOT NULL REFERENCES tcf_ee_years(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    month_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id, month)
);

-- ============================================================
-- 4. tcf_ee_combinaisons
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_ee_combinaisons (
    id SERIAL PRIMARY KEY,
    month_id INTEGER NOT NULL REFERENCES tcf_ee_months(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. tcf_ee_taches (tasks within a combinaison)
-- ============================================================
CREATE TABLE IF NOT EXISTS tcf_ee_taches (
    id SERIAL PRIMARY KEY,
    combinaison_id INTEGER NOT NULL REFERENCES tcf_ee_combinaisons(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL CHECK (task_number IN (1, 2, 3)),
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('message_court', 'narration', 'argumentation')),
    prompt_text TEXT NOT NULL,
    -- For argumentation (task 3): two text blocks
    argument_text_1 TEXT,
    argument_text_2 TEXT,
    -- Word range and time
    min_words INTEGER NOT NULL,
    max_words INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    -- Optional correction
    correction_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(combinaison_id, task_number)
);

-- ============================================================
-- 6. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tcf_ee_years_category ON tcf_ee_years(category_id);
CREATE INDEX IF NOT EXISTS idx_tcf_ee_months_year ON tcf_ee_months(year_id);
CREATE INDEX IF NOT EXISTS idx_tcf_ee_combinaisons_month ON tcf_ee_combinaisons(month_id);
CREATE INDEX IF NOT EXISTS idx_tcf_ee_taches_combinaison ON tcf_ee_taches(combinaison_id);
