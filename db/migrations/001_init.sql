-- Migration 001: Initial schema for EduPathAI V1
-- Owner: Member 1
-- Frozen at: Hour 0

BEGIN;

-- ============================================================
-- 1. STUDENTS (privacy-corrected)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    -- Internal opaque ID. Never exposed to AI.
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Tokenized external reference (ABC/APAAR).
    -- In production: KMS-encrypted. In SIH: synthetic token.
    external_ref    TEXT UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- NOTE: No full_name in this table. PII lives in a separate
-- identity service in production. SIH uses synthetic tokens.

-- ============================================================
-- 2. VERSION REGISTRY (single source of truth for current versions)
-- ============================================================
CREATE TABLE IF NOT EXISTS version_registry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind            TEXT NOT NULL,  -- 'curriculum' | 'policy' | 'model' | 'prompt' | ...
    scope_key       TEXT NOT NULL,  -- e.g., 'BTech-CSE' or 'IIT-Bombay/BTech-CSE'
    version         TEXT NOT NULL,
    is_current      BOOLEAN NOT NULL DEFAULT TRUE,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (kind, scope_key, version)
);

-- Only one current per (kind, scope_key)
CREATE UNIQUE INDEX IF NOT EXISTS idx_version_registry_current
    ON version_registry(kind, scope_key)
    WHERE is_current = TRUE;

-- ============================================================
-- 3. DECISION BUNDLES (immutable, replaces old snapshots table)
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_bundles (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_version          TEXT NOT NULL,
    policy_version              TEXT NOT NULL,
    model_version               TEXT NOT NULL,
    prompt_version              TEXT NOT NULL,
    embedding_model_version     TEXT NOT NULL,
    cross_encoder_version       TEXT NOT NULL,
    retrieval_threshold         NUMERIC(5,4) NOT NULL,
    solver_version              TEXT NOT NULL,
    solver_parameters_hash      TEXT NOT NULL,
    resource_catalog_version    TEXT NOT NULL,
    ontology_version            TEXT NOT NULL,
    ruleset_commit              TEXT NOT NULL,
    tool_definitions_hash       TEXT NOT NULL,
    captured_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundles_captured ON decision_bundles(captured_at);

-- ============================================================
-- 4. CURRICULA (versioned, append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS curricula (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution     TEXT NOT NULL,
    programme       TEXT NOT NULL,
    version         TEXT NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    document_hash   TEXT NOT NULL,
    validated_at    TIMESTAMPTZ NOT NULL,
    validated_by    TEXT NOT NULL,
    UNIQUE (institution, programme, version)
);

CREATE INDEX IF NOT EXISTS idx_curricula_lookup ON curricula(institution, programme, version);

-- ============================================================
-- 5. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id   UUID NOT NULL REFERENCES curricula(id),
    code            TEXT NOT NULL,
    name            TEXT NOT NULL,
    credits         NUMERIC(4,2) NOT NULL CHECK (credits > 0),
    semester        INT,
    UNIQUE (curriculum_id, code)
);

CREATE INDEX IF NOT EXISTS idx_courses_curriculum ON courses(curriculum_id);

-- ============================================================
-- 6. LEARNING OUTCOMES (atomic, Bloom-tagged)
-- Note: vector extension and column enabled in 002_vector.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_outcomes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id),
    outcome_text    TEXT NOT NULL,
    bloom_level     INT NOT NULL CHECK (bloom_level BETWEEN 1 AND 6),
    domain          TEXT NOT NULL,
    UNIQUE (course_id, outcome_text)
);

CREATE INDEX IF NOT EXISTS idx_lo_course ON learning_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_lo_bloom ON learning_outcomes(bloom_level);

-- ============================================================
-- 7. PREREQUISITES (hypergraph edges)
-- ============================================================
CREATE TABLE IF NOT EXISTS prerequisites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id),
    hyperedge_id    UUID NOT NULL,
    required_course UUID NOT NULL REFERENCES courses(id),
    logic           TEXT NOT NULL CHECK (logic IN ('AND', 'OR')),
    UNIQUE (course_id, hyperedge_id, required_course)
);

CREATE INDEX IF NOT EXISTS idx_prereq_course ON prerequisites(course_id);

-- ============================================================
-- 8. RECOGNITION DECISIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS recognition_decisions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES students(id),
    source_course_id    UUID NOT NULL REFERENCES courses(id),
    target_course_id    UUID NOT NULL REFERENCES courses(id),
    status              TEXT NOT NULL CHECK (status IN (
                            'DIRECT','BRIDGE','MISSING','REVIEW','POLICY_CONFLICT')),
    confidence          NUMERIC(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    bundle_id           UUID NOT NULL REFERENCES decision_bundles(id),
    evidence_refs       JSONB NOT NULL DEFAULT '[]',
    missing_outcomes    JSONB NOT NULL DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recog_student ON recognition_decisions(student_id);
CREATE INDEX IF NOT EXISTS idx_recog_status ON recognition_decisions(status);

-- ============================================================
-- 9. AUDIT CHAIN HEADS (fixes concurrency bug)
-- One row per chain. Updated transactionally.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_chain_heads (
    chain_id        TEXT PRIMARY KEY,
    head_hash       TEXT NOT NULL,
    head_record_id  UUID,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed genesis row
INSERT INTO audit_chain_heads (chain_id, head_hash)
VALUES ('global', 'GENESIS')
ON CONFLICT (chain_id) DO NOTHING;

-- ============================================================
-- 10. AUDIT LEDGER (append-only, hash-chained, partitioned chains)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id            TEXT NOT NULL REFERENCES audit_chain_heads(chain_id),
    recommendation_id   UUID NOT NULL,
    decision_id         UUID NOT NULL,           -- distinct from trace
    previous_hash       TEXT NOT NULL,
    current_hash        TEXT NOT NULL,
    bundle_id           UUID NOT NULL REFERENCES decision_bundles(id),
    input_hash          TEXT NOT NULL,
    output_hash         TEXT NOT NULL,
    confidence          NUMERIC(5,4) NOT NULL,
    evidence            JSONB NOT NULL DEFAULT '[]',
    ai_recommendation   TEXT NOT NULL,
    human_decision      TEXT,
    trace_id            TEXT NOT NULL,           -- OTel trace
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (chain_id, current_hash)
);

CREATE INDEX IF NOT EXISTS idx_audit_chain ON audit_ledger(chain_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_decision ON audit_ledger(decision_id);
CREATE INDEX IF NOT EXISTS idx_audit_trace ON audit_ledger(trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_rec ON audit_ledger(recommendation_id);

-- ============================================================
-- 11. OUTBOX (at-least-once with idempotent consumers)
-- ============================================================
CREATE TABLE IF NOT EXISTS outbox (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic           TEXT NOT NULL,
    event_key       TEXT NOT NULL,           -- for idempotency
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ,
    UNIQUE (topic, event_key)                -- dedup at insert time
);

CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON outbox(published_at) WHERE published_at IS NULL;

-- ============================================================
-- 12. CONSUMER IDEMPOTENCY
-- ============================================================
CREATE TABLE IF NOT EXISTS consumer_idempotency (
    consumer        TEXT NOT NULL,
    event_key       TEXT NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (consumer, event_key)
);

COMMIT;
