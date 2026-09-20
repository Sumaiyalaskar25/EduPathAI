# services/matching/course_catalog.py
"""
Course metadata catalog.

Course *matching* is fixture-driven (services/matching/real.py reads
test/fixtures/*/gold.json). Those same fixtures are the only place
this system has real course names/credits/outcomes — there is no
curriculum-authoring flow populating the `courses` table yet (see
migration 005 header note). Rather than invent plausible-looking
course descriptions, this loads the same fixture files so
GET /v1/courses/{code} shows genuinely sourced data, and degrades
honestly (fields marked unknown) for a code outside the fixture set.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

DEFAULT_FIXTURES_DIR = Path("test/fixtures")


@dataclass(frozen=True)
class CourseInfo:
    code: str
    name: str
    credits: float
    outcomes: list[str] = field(default_factory=list)
    modality: str = "theory"
    fixture_description: str = ""


class CourseCatalog:
    def __init__(self, fixtures_dir: Path = DEFAULT_FIXTURES_DIR) -> None:
        self._by_code: dict[str, CourseInfo] = {}
        self._load(Path(fixtures_dir))

    def _load(self, fixtures_dir: Path) -> None:
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
                )

    def get(self, code: str) -> Optional[CourseInfo]:
        return self._by_code.get(code)

    def all(self) -> list[CourseInfo]:
        return list(self._by_code.values())
