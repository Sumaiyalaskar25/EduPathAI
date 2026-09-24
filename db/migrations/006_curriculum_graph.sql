-- Migration 006: EduPathAI National Curriculum Graph v2
-- Ingests multi-disciplinary national curriculum graph schema covering:
-- 129 Institutions, 35 Authorities, 22 Disciplines, 220 Programme Families,
-- 520 Curricula, 3,120 Semesters, 15,600 Subjects, 46,800 Modules,
-- 327,600 Topics, 62,400 Learning Outcomes, 21,840 Skills, 62,400 Prerequisites.

BEGIN;

CREATE TABLE IF NOT EXISTS authorities (
    authority_id TEXT PRIMARY KEY,
    name TEXT,
    authority_type TEXT,
    country TEXT,
    url TEXT,
    evidence_status TEXT
);

CREATE TABLE IF NOT EXISTS disciplines (
    discipline_id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS programme_families (
    programme_family_id TEXT PRIMARY KEY,
    discipline_id TEXT,
    canonical_name TEXT,
    typical_level TEXT,
    programme_codes TEXT,
    evidence_status TEXT
);

CREATE TABLE IF NOT EXISTS institutions (
    institution_id TEXT PRIMARY KEY,
    name TEXT,
    city TEXT,
    state TEXT,
    alpha_group TEXT,
    discovery_source TEXT,
    discovery_source_url TEXT,
    directory_evidence TEXT,
    approval_status TEXT,
    approval_source_url TEXT,
    curriculum_status TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS institution_programme_candidates (
    institution_id TEXT,
    programme_family_id TEXT,
    candidate_status TEXT,
    evidence_note TEXT,
    PRIMARY KEY(institution_id, programme_family_id)
);

CREATE TABLE IF NOT EXISTS curriculum_versions (
    curriculum_id TEXT PRIMARY KEY,
    institution_id TEXT,
    programme_family_id TEXT,
    authority_id TEXT,
    academic_year TEXT,
    version_label TEXT,
    source_id TEXT,
    source_url TEXT,
    verification_status TEXT,
    record_origin TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS semesters (
    semester_id TEXT PRIMARY KEY,
    curriculum_id TEXT,
    semester_no INTEGER,
    semester_status TEXT
);

CREATE TABLE IF NOT EXISTS subjects (
    subject_id TEXT PRIMARY KEY,
    semester_id TEXT,
    course_code TEXT,
    subject_name TEXT,
    category TEXT,
    credits DOUBLE PRECISION,
    verification_status TEXT,
    record_origin TEXT
);

CREATE TABLE IF NOT EXISTS modules (
    module_id TEXT PRIMARY KEY,
    subject_id TEXT,
    module_no INTEGER,
    module_name TEXT,
    verification_status TEXT,
    record_origin TEXT
);

CREATE TABLE IF NOT EXISTS topics (
    topic_instance_id TEXT PRIMARY KEY,
    module_id TEXT,
    topic_no INTEGER,
    topic_name TEXT,
    canonical_topic TEXT,
    verification_status TEXT,
    record_origin TEXT
);

CREATE TABLE IF NOT EXISTS graph_learning_outcomes (
    outcome_id TEXT PRIMARY KEY,
    subject_id TEXT,
    outcome_no INTEGER,
    outcome_text TEXT,
    bloom_level TEXT,
    verification_status TEXT,
    record_origin TEXT
);

CREATE TABLE IF NOT EXISTS skills (
    skill_instance_id TEXT PRIMARY KEY,
    subject_id TEXT,
    skill_name TEXT,
    skill_domain TEXT,
    verification_status TEXT,
    record_origin TEXT
);

CREATE TABLE IF NOT EXISTS graph_prerequisites (
    prerequisite_id TEXT PRIMARY KEY,
    subject_id TEXT,
    prerequisite_subject_id TEXT,
    relationship_type TEXT,
    confidence DOUBLE PRECISION,
    verification_status TEXT,
    record_origin TEXT,
    rationale TEXT
);

CREATE TABLE IF NOT EXISTS sources (
    source_id TEXT PRIMARY KEY,
    authority TEXT,
    source_type TEXT,
    title TEXT,
    academic_year TEXT,
    url TEXT,
    evidence_scope TEXT,
    license_note TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS provenance (
    entity_type TEXT,
    entity_id TEXT,
    source_id TEXT,
    evidence_level TEXT,
    evidence_note TEXT
);

CREATE TABLE IF NOT EXISTS verified_curriculum_records (
    record_id TEXT PRIMARY KEY,
    institution_id TEXT,
    programme_name TEXT,
    curriculum_label TEXT,
    semester INTEGER,
    course_code TEXT,
    course_name TEXT,
    topic_name TEXT,
    source_id TEXT,
    verification_status TEXT,
    notes TEXT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(course_code);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_modules_subject ON modules(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_topics_canonical ON topics(canonical_topic);
CREATE INDEX IF NOT EXISTS idx_glo_subject ON graph_learning_outcomes(subject_id);
CREATE INDEX IF NOT EXISTS idx_gprereq_subject ON graph_prerequisites(subject_id);
CREATE INDEX IF NOT EXISTS idx_institutions_state ON institutions(state);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);
CREATE INDEX IF NOT EXISTS idx_curr_inst ON curriculum_versions(institution_id);
CREATE INDEX IF NOT EXISTS idx_sem_curr ON semesters(curriculum_id);

-- Convenience Views
CREATE OR REPLACE VIEW curriculum_learning_outcomes AS SELECT * FROM graph_learning_outcomes;
CREATE OR REPLACE VIEW curriculum_prerequisites AS SELECT * FROM graph_prerequisites;

COMMIT;
