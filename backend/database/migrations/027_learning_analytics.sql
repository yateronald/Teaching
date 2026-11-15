-- Migration 027: what learners do in the free courses (monitoring space).
--
-- Two things, in the same privacy frame as migration 022 (no cookie, no
-- address, no name — a visitor is only ever a daily hash on site_visits):
--   1. site_visits says what each page of the free courses is: the space
--      ('learn'), the kind of page (course, lesson, game…) and the course or
--      game it belongs to, under the same id in both languages.
--   2. learn_events — one row per activity started or finished (a lesson, a
--      final assessment, a game, the level test), tied to the page view it
--      happened on. It has no identifier of its own.
--   3. learn_titles — the names of courses, lessons and games as the site
--      shows them, so the monitoring tables can name what they count.
--
-- Additive and safe to run twice.

ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS area VARCHAR(12);
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS page_kind VARCHAR(16);
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS topic VARCHAR(80);

-- Pages of the free courses already counted are recognised by their address.
UPDATE site_visits SET area = 'learn'
 WHERE area IS NULL
   AND (path = '/learn' OR path LIKE '/learn/%' OR path = '/fr/apprendre' OR path LIKE '/fr/apprendre/%');

CREATE INDEX IF NOT EXISTS idx_site_visits_area ON site_visits(area, created_at DESC) WHERE area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_visits_topic ON site_visits(topic, created_at DESC) WHERE topic IS NOT NULL;

CREATE TABLE IF NOT EXISTS learn_events (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- The page view it happened on (site_visits.event_key): where the learner
    -- is, the device, the daily hash. Nothing else identifies anything here.
    visit_key UUID NOT NULL,
    kind VARCHAR(12) NOT NULL,        -- lesson | final | game | story | placement | course_test
    action VARCHAR(8) NOT NULL,       -- start | finish
    course VARCHAR(80),
    item VARCHAR(80),                 -- the lesson, the game, the episode, the level reached
    score SMALLINT,                   -- 0 to 100
    passed BOOLEAN,
    seconds INTEGER                   -- from start to finish, when both happened on the page
);

CREATE INDEX IF NOT EXISTS idx_learn_events_time ON learn_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_events_course ON learn_events(course, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_events_visit ON learn_events(visit_key);

CREATE TABLE IF NOT EXISTS learn_titles (
    key VARCHAR(100) PRIMARY KEY,     -- "course:<id>", "lesson:<id>" or "game:<id>"
    kind VARCHAR(12) NOT NULL,        -- course | lesson | game
    course VARCHAR(80),               -- the course of a lesson
    category VARCHAR(40),
    title_en VARCHAR(160),
    title_fr VARCHAR(160),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
