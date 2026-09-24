#!/usr/bin/env python3
"""
scripts/ingest_graph.py
────────────────────────────────────────────────────────────────
Ingestion pipeline for EduPathAI National Curriculum Graph v2.

Streams and loads data from `edupathAI_national_curriculum_graph_v2.sqlite`:
  - 129 Institutions
  - 35 Authorities
  - 22 Disciplines
  - 220 Programme Families
  - 766 Institution Programme Candidates
  - 520 Curriculum Versions
  - 3,120 Semesters
  - 15,600 Subjects
  - 46,800 Modules
  - 327,600 Topics
  - 62,400 Learning Outcomes
  - 21,840 Skills
  - 62,400 Prerequisites
  - 32 Sources
  - 133 Provenance Records
  - 203 Verified Curriculum Records

Also synchronizes into core `curricula` and `courses` tables for backwards
compatibility with the recognition and pathway engines.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edupathai \
        python scripts/ingest_graph.py
────────────────────────────────────────────────────────────────
"""
from __future__ import annotations

import argparse
import asyncio
import datetime
import logging
import os
import sqlite3
import sys
import time
import uuid

import asyncpg

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
log = logging.getLogger("ingest_graph")

DEFAULT_PG_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/edupathai"
)
DEFAULT_SQLITE_PATH = "edupathAI_national_curriculum_graph_v2.sqlite"


TABLE_SPECS = [
    {
        "sqlite_table": "authorities",
        "pg_table": "authorities",
        "columns": ["authority_id", "name", "authority_type", "country", "url", "evidence_status"],
    },
    {
        "sqlite_table": "disciplines",
        "pg_table": "disciplines",
        "columns": ["discipline_id", "name", "description"],
    },
    {
        "sqlite_table": "institutions",
        "pg_table": "institutions",
        "columns": [
            "institution_id", "name", "city", "state", "alpha_group",
            "discovery_source", "discovery_source_url", "directory_evidence",
            "approval_status", "approval_source_url", "curriculum_status", "notes"
        ],
    },
    {
        "sqlite_table": "sources",
        "pg_table": "sources",
        "columns": [
            "source_id", "authority", "source_type", "title",
            "academic_year", "url", "evidence_scope", "license_note", "notes"
        ],
    },
    {
        "sqlite_table": "programme_families",
        "pg_table": "programme_families",
        "columns": ["programme_family_id", "discipline_id", "canonical_name", "typical_level", "programme_codes", "evidence_status"],
    },
    {
        "sqlite_table": "institution_programme_candidates",
        "pg_table": "institution_programme_candidates",
        "columns": ["institution_id", "programme_family_id", "candidate_status", "evidence_note"],
    },
    {
        "sqlite_table": "curriculum_versions",
        "pg_table": "curriculum_versions",
        "columns": [
            "curriculum_id", "institution_id", "programme_family_id", "authority_id",
            "academic_year", "version_label", "source_id", "source_url",
            "verification_status", "record_origin", "notes"
        ],
    },
    {
        "sqlite_table": "semesters",
        "pg_table": "semesters",
        "columns": ["semester_id", "curriculum_id", "semester_no", "semester_status"],
    },
    {
        "sqlite_table": "subjects",
        "pg_table": "subjects",
        "columns": [
            "subject_id", "semester_id", "course_code", "subject_name",
            "category", "credits", "verification_status", "record_origin"
        ],
    },
    {
        "sqlite_table": "modules",
        "pg_table": "modules",
        "columns": ["module_id", "subject_id", "module_no", "module_name", "verification_status", "record_origin"],
    },
    {
        "sqlite_table": "topics",
        "pg_table": "topics",
        "columns": [
            "topic_instance_id", "module_id", "topic_no", "topic_name",
            "canonical_topic", "verification_status", "record_origin"
        ],
    },
    {
        "sqlite_table": "skills",
        "pg_table": "skills",
        "columns": ["skill_instance_id", "subject_id", "skill_name", "skill_domain", "verification_status", "record_origin"],
    },
    {
        "sqlite_table": "learning_outcomes",
        "pg_table": "graph_learning_outcomes",
        "columns": [
            "outcome_id", "subject_id", "outcome_no", "outcome_text",
            "bloom_level", "verification_status", "record_origin"
        ],
    },
    {
        "sqlite_table": "prerequisites",
        "pg_table": "graph_prerequisites",
        "columns": [
            "prerequisite_id", "subject_id", "prerequisite_subject_id",
            "relationship_type", "confidence", "verification_status",
            "record_origin", "rationale"
        ],
    },
    {
        "sqlite_table": "provenance",
        "pg_table": "provenance",
        "columns": ["entity_type", "entity_id", "source_id", "evidence_level", "evidence_note"],
    },
    {
        "sqlite_table": "verified_curriculum_records",
        "pg_table": "verified_curriculum_records",
        "columns": [
            "record_id", "institution_id", "programme_name", "curriculum_label",
            "semester", "course_code", "course_name", "topic_name",
            "source_id", "verification_status", "notes"
        ],
    },
]


async def run_ingestion(sqlite_path: str, pg_url: str, sync_legacy_courses: bool = True) -> None:
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"SQLite file not found at {sqlite_path}")

    log.info("Connecting to SQLite: %s", sqlite_path)
    s_conn = sqlite3.connect(sqlite_path)
    s_cur = s_conn.cursor()

    log.info("Connecting to PostgreSQL: %s", pg_url.split("@")[-1])
    pg_conn = await asyncpg.connect(pg_url)

    total_start = time.time()

    # 1. Truncate target graph tables in reverse dependency order
    log.info("Truncating graph tables...")
    truncate_order = [
        "graph_prerequisites", "graph_learning_outcomes", "skills", "topics",
        "modules", "subjects", "semesters", "curriculum_versions",
        "institution_programme_candidates", "programme_families", "sources",
        "institutions", "disciplines", "authorities", "provenance",
        "verified_curriculum_records"
    ]
    for tbl in truncate_order:
        await pg_conn.execute(f"TRUNCATE TABLE {tbl} CASCADE;")

    # 2. Ingest graph tables
    log.info("Ingesting graph tables from SQLite into PostgreSQL...")
    for spec in TABLE_SPECS:
        s_tbl = spec["sqlite_table"]
        p_tbl = spec["pg_table"]
        cols = spec["columns"]
        col_str = ", ".join(cols)

        t0 = time.time()
        s_cur.execute(f"SELECT {col_str} FROM [{s_tbl}]")
        records = s_cur.fetchall()
        read_time = time.time() - t0

        t1 = time.time()
        await pg_conn.copy_records_to_table(p_tbl, records=records, columns=cols)
        copy_time = time.time() - t1

        log.info(
            "  -> %s (%d rows) [sqlite: %.2fs | pg copy: %.2fs]",
            p_tbl, len(records), read_time, copy_time
        )

    # 3. Synchronize into core `curricula` and `courses` tables
    if sync_legacy_courses:
        log.info("Synchronizing into core `curricula` and `courses` tables for full pipeline compatibility...")
        t_sync = time.time()

        # Fetch curriculum versions with institution & programme family canonical names
        s_cur.execute("""
            SELECT cv.curriculum_id, i.name as institution_name, pf.canonical_name as programme_name,
                   cv.academic_year, cv.version_label
            FROM curriculum_versions cv
            JOIN institutions i ON cv.institution_id = i.institution_id
            JOIN programme_families pf ON cv.programme_family_id = pf.programme_family_id
        """)
        curr_rows = s_cur.fetchall()

        curr_id_map: dict[str, uuid.UUID] = {}
        curricula_inserts = []
        now_date = datetime.date(2024, 8, 1)

        for cid, inst_name, prog_name, ac_year, v_label in curr_rows:
            c_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"edupathai:curriculum:{cid}")
            curr_id_map[cid] = c_uuid
            curricula_inserts.append((
                c_uuid,
                inst_name,
                prog_name,
                v_label or ac_year or "2024-v1",
                now_date,
                f"doc-hash-{cid}",
                datetime.datetime.now(datetime.timezone.utc),
                "EduPathAI National Graph Ingest"
            ))

        await pg_conn.execute("TRUNCATE TABLE courses CASCADE;")
        await pg_conn.execute("TRUNCATE TABLE curricula CASCADE;")

        await pg_conn.copy_records_to_table(
            "curricula",
            records=curricula_inserts,
            columns=[
                "id", "institution", "programme", "version",
                "effective_from", "document_hash", "validated_at", "validated_by"
            ]
        )
        log.info("  Synced %d curricula rows", len(curricula_inserts))

        # Fetch subjects with their semester number and curriculum_id
        s_cur.execute("""
            SELECT s.subject_id, s.course_code, s.subject_name, s.credits,
                   sem.semester_no, sem.curriculum_id
            FROM subjects s
            JOIN semesters sem ON s.semester_id = sem.semester_id
        """)
        subj_rows = s_cur.fetchall()

        courses_inserts = []
        for sid, code, name, creds, sem_no, cid in subj_rows:
            c_uuid = curr_id_map.get(cid)
            if not c_uuid:
                continue
            course_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"edupathai:course:{sid}")
            credits_val = creds if creds and creds > 0 else 3.0
            courses_inserts.append((
                course_uuid,
                c_uuid,
                code,
                name,
                float(credits_val),
                int(sem_no) if sem_no else 1
            ))

        await pg_conn.copy_records_to_table(
            "courses",
            records=courses_inserts,
            columns=["id", "curriculum_id", "code", "name", "credits", "semester"]
        )
        log.info("  Synced %d courses rows (completed in %.2fs)", len(courses_inserts), time.time() - t_sync)

    total_time = time.time() - total_start
    log.info("Ingestion complete in %.2f seconds!", total_time)

    # Print summary counts from Postgres
    counts = {}
    for spec in TABLE_SPECS:
        tbl = spec["pg_table"]
        cnt = await pg_conn.fetchval(f"SELECT count(*) FROM {tbl}")
        counts[tbl] = cnt

    courses_cnt = await pg_conn.fetchval("SELECT count(*) FROM courses")
    curricula_cnt = await pg_conn.fetchval("SELECT count(*) FROM curricula")

    print("\n" + "=" * 60)
    print(" EduPathAI National Curriculum Graph v2 Ingestion Summary")
    print("=" * 60)
    print(f"Institutions:               {counts.get('institutions', 0):,}")
    print(f"Authorities:                {counts.get('authorities', 0):,}")
    print(f"Disciplines:                {counts.get('disciplines', 0):,}")
    print(f"Programme Families:         {counts.get('programme_families', 0):,}")
    print(f"Curriculum Versions:        {counts.get('curriculum_versions', 0):,}")
    print(f"Semesters:                  {counts.get('semesters', 0):,}")
    print(f"Subjects:                   {counts.get('subjects', 0):,}")
    print(f"Modules:                    {counts.get('modules', 0):,}")
    print(f"Topics:                     {counts.get('topics', 0):,}")
    print(f"Learning Outcomes:          {counts.get('graph_learning_outcomes', 0):,}")
    print(f"Skills:                     {counts.get('skills', 0):,}")
    print(f"Prerequisites:              {counts.get('graph_prerequisites', 0):,}")
    print(f"Sources:                    {counts.get('sources', 0):,}")
    print(f"Core Curricula Synced:      {curricula_cnt:,}")
    print(f"Core Courses Synced:        {courses_cnt:,}")
    print("=" * 60 + "\n")

    await pg_conn.close()
    s_conn.close()


def main():
    parser = argparse.ArgumentParser(description="Ingest National Curriculum Graph v2 into EduPathAI Postgres")
    parser.add_argument("--sqlite-path", default=DEFAULT_SQLITE_PATH, help="Path to sqlite database")
    parser.add_argument("--pg-url", default=DEFAULT_PG_URL, help="Postgres connection URL")
    parser.add_argument("--skip-legacy-sync", action="store_true", help="Skip populating courses/curricula tables")
    args = parser.parse_args()

    asyncio.run(run_ingestion(
        sqlite_path=args.sqlite_path,
        pg_url=args.pg_url,
        sync_legacy_courses=not args.skip_legacy_sync
    ))


if __name__ == "__main__":
    main()
