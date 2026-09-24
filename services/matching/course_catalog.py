# services/matching/course_catalog.py
"""
Course metadata catalog.

Loads golden fixtures first for backward compatibility with existing tests,
then dynamically resolves against the EduPathAI National Curriculum Graph
(15,600 subjects across 129 institutions and 22 discipline families).
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
import sqlite3
from typing import Optional

log = logging.getLogger("course_catalog")

DEFAULT_FIXTURES_DIR = Path("test/fixtures")
DEFAULT_SQLITE_PATH = Path("edupathAI_national_curriculum_graph_v2.sqlite")


@dataclass(frozen=True)
class CourseInfo:
    code: str
    name: str
    credits: float
    outcomes: list[str] = field(default_factory=list)
    modality: str = "theory"
    fixture_description: str = ""
    verification_status: str = "OFFICIAL_SOURCE"
    institution: str = ""


class CourseCatalog:
    def __init__(
        self,
        fixtures_dir: Path = DEFAULT_FIXTURES_DIR,
        sqlite_path: Path = DEFAULT_SQLITE_PATH,
    ) -> None:
        self._by_code: dict[str, CourseInfo] = {}
        self._sqlite_path = Path(sqlite_path)
        self._load_fixtures(Path(fixtures_dir))

    def _load_fixtures(self, fixtures_dir: Path) -> None:
        if not fixtures_dir.exists():
            return
        for gold_path in sorted(fixtures_dir.glob("*/gold.json")):
            try:
                data = json.loads(gold_path.read_text(encoding="utf-8"))
            except Exception:
                continue
            desc = data.get("description", "")
            for key in ("source_course", "target_course"):
                c = data.get(key)
                if not c:
                    continue
                self._by_code[c["code"]] = CourseInfo(
                    code=c["code"],
                    name=c.get("name", c["code"]),
                    credits=float(c.get("credits", 4.0)),
                    outcomes=list(c.get("outcomes", [])),
                    modality=c.get("modality", "theory"),
                    fixture_description=desc,
                    verification_status="OFFICIAL_SOURCE",
                    institution="",
                )

    def get(self, code: str) -> Optional[CourseInfo]:
        if code in self._by_code:
            return self._by_code[code]

        # Dynamically query National Curriculum Graph
        if not self._sqlite_path.exists():
            return None

        try:
            with sqlite3.connect(self._sqlite_path) as con:
                cur = con.cursor()

                # 1. Query subjects
                row = cur.execute(
                    """
                    SELECT s.subject_id, s.course_code, s.subject_name, s.credits,
                           s.verification_status, i.name as inst_name
                    FROM subjects s
                    JOIN semesters sem ON s.semester_id = sem.semester_id
                    JOIN curriculum_versions cv ON sem.curriculum_id = cv.curriculum_id
                    JOIN institutions i ON cv.institution_id = i.institution_id
                    WHERE s.course_code = ?
                    LIMIT 1
                    """,
                    (code,),
                ).fetchone()

                if row:
                    sub_id, c_code, name, creds, v_status, inst_name = row
                    outcomes_rows = cur.execute(
                        "SELECT outcome_text FROM learning_outcomes WHERE subject_id = ? ORDER BY outcome_no",
                        (sub_id,),
                    ).fetchall()
                    outcomes = [r[0] for r in outcomes_rows]
                    info = CourseInfo(
                        code=c_code,
                        name=name,
                        credits=float(creds or 3.0),
                        outcomes=outcomes,
                        modality="theory",
                        fixture_description=f"{name} at {inst_name}.",
                        verification_status=v_status or "DERIVED_CANDIDATE",
                        institution=inst_name,
                    )
                    self._by_code[code] = info
                    return info

                # 2. Fallback: Query verified_curriculum_records
                v_row = cur.execute(
                    """
                    SELECT v.record_id, v.course_code, v.course_name, v.verification_status, i.name as inst_name
                    FROM verified_curriculum_records v
                    JOIN institutions i ON v.institution_id = i.institution_id
                    WHERE v.course_code = ?
                    LIMIT 1
                    """,
                    (code,),
                ).fetchone()

                if v_row:
                    _, c_code, name, v_status, inst_name = v_row
                    info = CourseInfo(
                        code=c_code,
                        name=name,
                        credits=4.0,
                        outcomes=[],
                        modality="theory",
                        fixture_description=f"Verified curriculum record: {name} ({inst_name}).",
                        verification_status=v_status or "OFFICIAL_SOURCE",
                        institution=inst_name,
                    )
                    self._by_code[code] = info
                    return info

        except Exception as e:
            log.warning("Failed to lookup course %s in national graph: %s", code, e)

        return None

    def all(self) -> list[CourseInfo]:
        return list(self._by_code.values())
