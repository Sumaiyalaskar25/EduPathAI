-- Migration 005: Application-layer persistence
-- Adds what was missing for the product surface beyond the core
-- pipeline: HEI human-review tracking on the ledger, persisted
-- gaps/bridges history (so a student's dashboard doesn't require
-- re-running the pipeline to see past results), and gov policy
-- overrides.
--
-- Also relaxes recognition_decisions.source_course_id /
-- target_course_id from a UUID FK into `courses` to plain TEXT
-- (the course *code*, e.g. "CS-341"). The matching engine
-- (services/matching/real.py) operates on fixture-defined course
-- codes, not rows in the `courses` table — nothing in the codebase
-- ever inserted into `courses`, so the original FK could never be
-- satisfied by a live pipeline run. Storing the code directly is
-- what the matcher actually produces; loading real curricula into
-- `courses`/`learning_outcomes` (replacing the fixture-based
-- matcher) is future work, not blocked by this migration.

BEGIN;

-- ============================================================
-- 1. AUDIT LEDGER — human review provenance
-- ============================================================
ALTER TABLE audit_ledger ADD COLUMN IF NOT EXISTS auditor_name TEXT;
ALTER TABLE audit_ledger ADD COLUMN IF NOT EXISTS auditor_role TEXT;

-- ============================================================
-- 2. RECOGNITION DECISIONS — link back to the ledger decision_id,
--    and store course codes directly (see header note).
-- ============================================================
ALTER TABLE recognition_decisions DROP CONSTRAINT IF EXISTS recognition_decisions_source_course_id_fkey;
ALTER TABLE recognition_decisions DROP CONSTRAINT IF EXISTS recognition_decisions_target_course_id_fkey;
ALTER TABLE recognition_decisions ALTER COLUMN source_course_id TYPE TEXT USING source_course_id::TEXT;
ALTER TABLE recognition_decisions ALTER COLUMN target_course_id TYPE TEXT USING target_course_id::TEXT;
ALTER TABLE recognition_decisions ADD COLUMN IF NOT EXISTS decision_id UUID;

CREATE INDEX IF NOT EXISTS idx_recog_decision ON recognition_decisions(decision_id);

-- ============================================================
-- 3. GAPS (persisted output of services.recognition.classify_gap)
-- ============================================================
CREATE TABLE IF NOT EXISTS gaps (
    id                  UUID PRIMARY KEY,               -- = Gap.gap_id
    decision_id         UUID NOT NULL,
    student_id          UUID NOT NULL REFERENCES students(id),
    source_course_id    TEXT,
    target_course_id    TEXT,
    gap_type            TEXT NOT NULL CHECK (gap_type IN
                            ('KNOWLEDGE','PREREQUISITE','ASSESSMENT','ADMINISTRATIVE')),
    description         TEXT NOT NULL,
    missing_outcomes    JSONB NOT NULL DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gaps_decision ON gaps(decision_id);
CREATE INDEX IF NOT EXISTS idx_gaps_student ON gaps(student_id);

-- ============================================================
-- 4. BRIDGES (persisted output of ResourceRegistry.find_for_outcomes)
-- ============================================================
CREATE TABLE IF NOT EXISTS bridges (
    id                      UUID PRIMARY KEY,           -- = Bridge.bridge_id
    gap_id                  UUID NOT NULL REFERENCES gaps(id),
    decision_id             UUID NOT NULL,
    student_id              UUID NOT NULL REFERENCES students(id),
    resource_id             TEXT NOT NULL,
    resource_provider       TEXT NOT NULL,
    resource_url            TEXT NOT NULL,
    competency_coverage     NUMERIC(5,4) NOT NULL,
    duration_hours          INT NOT NULL,
    assessment_available    BOOLEAN NOT NULL,
    recognition_status      TEXT NOT NULL CHECK (recognition_status IN ('LEARNING_ONLY','FORMAL_BRIDGE')),
    prerequisite_met        BOOLEAN NOT NULL,
    enrolled                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bridges_decision ON bridges(decision_id);
CREATE INDEX IF NOT EXISTS idx_bridges_student ON bridges(student_id);

-- ============================================================
-- 5. GOV POLICY OVERRIDES (editable from the ministry dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS gov_policy_overrides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution     TEXT NOT NULL,
    programme       TEXT NOT NULL,
    policy_key      TEXT NOT NULL,
    policy_value    JSONB NOT NULL,
    updated_by      TEXT NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (institution, programme, policy_key)
);

COMMIT;
