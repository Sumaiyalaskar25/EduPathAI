# services/identity/directory.py
"""
Identity directory.

The `students` table (db/migrations/001_init.sql) deliberately holds no
PII — see README "Three Truths Separation" / ADR-008. In production,
identity (name, APAAR, ABC ID) lives behind a separate DigiLocker/APAAR
integration. For now this loads a local fixture that plays that role;
swap `_load()` for a real client later without touching any caller.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

DEFAULT_DIRECTORY_PATH = Path("data/identity_directory.json")


@dataclass(frozen=True)
class Identity:
    external_ref: str
    full_name: str
    role_title: str = ""
    institution: str = ""
    programme: str = ""
    target_institution: str = ""
    target_programme: str = ""
    apaar_masked: str = ""
    abc_id: str = ""
    enrolled_on: str = ""
    semester: int = 4
    credits_completed: int = 72


def _default_transcript_courses(semester: int = 4) -> list[dict]:
    all_courses = [
        {"code": "CS-101", "title": "Programming Principles & C Logic", "credits": 4, "grade": "A+", "semester": 1, "domain": "Core Computing"},
        {"code": "MATH-101", "title": "Calculus & Linear Algebra", "credits": 4, "grade": "A", "semester": 1, "domain": "Mathematics"},
        {"code": "EE-101", "title": "Basic Electrical & Electronics", "credits": 3, "grade": "A", "semester": 1, "domain": "Engineering Sciences"},
        {"code": "ENG-101", "title": "Technical Communication & Ethics", "credits": 2, "grade": "O", "semester": 1, "domain": "Humanities"},
        {"code": "CS-102", "title": "Object-Oriented Programming & Systems", "credits": 4, "grade": "A+", "semester": 2, "domain": "Core Computing"},
        {"code": "CS-201", "title": "Discrete Mathematical Structures", "credits": 4, "grade": "O", "semester": 2, "domain": "Mathematics"},
        {"code": "MATH-102", "title": "Probability & Statistics for Computing", "credits": 4, "grade": "A", "semester": 2, "domain": "Mathematics"},
        {"code": "ENV-101", "title": "Environmental Studies & Ecology", "credits": 2, "grade": "O", "semester": 2, "domain": "Sciences"},
        {"code": "CS-202", "title": "Data Structures & Asymptotics", "credits": 4, "grade": "A+", "semester": 3, "domain": "Core Computing"},
        {"code": "CS-203", "title": "Computer Organization & Architecture", "credits": 4, "grade": "A", "semester": 3, "domain": "Hardware Systems"},
        {"code": "MATH-201", "title": "Numerical Methods & Optimization", "credits": 3, "grade": "A", "semester": 3, "domain": "Mathematics"},
        {"code": "CS-301", "title": "Database Management Systems & SQL", "credits": 4, "grade": "A+", "semester": 4, "domain": "Core Computing"},
        {"code": "CS-302", "title": "Design & Analysis of Algorithms", "credits": 4, "grade": "A", "semester": 4, "domain": "Core Computing"},
        {"code": "CS-303", "title": "Operating Systems & Concurrency", "credits": 4, "grade": "A", "semester": 4, "domain": "Systems Software"},
        {"code": "CS-304", "title": "Formal Languages & Automata", "credits": 3, "grade": "B+", "semester": 4, "domain": "Theoretical CS"},
    ]
    return [c for c in all_courses if c["semester"] <= semester]


class IdentityDirectory:
    def __init__(self, path: Path = DEFAULT_DIRECTORY_PATH) -> None:
        self.path = Path(path)
        self._by_ref: dict[str, Identity] = {}
        self._transcripts: dict[str, list[dict]] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        data = json.loads(self.path.read_text(encoding="utf-8"))
        for s in data.get("students", []):
            sem = s.get("semester", 4)
            self._by_ref[s["external_ref"]] = Identity(
                external_ref=s["external_ref"],
                full_name=s["full_name"],
                institution=s.get("institution", ""),
                programme=s.get("programme", ""),
                target_institution=s.get("target_institution", ""),
                target_programme=s.get("target_programme", ""),
                apaar_masked=s.get("apaar_masked", ""),
                abc_id=s.get("abc_id", ""),
                enrolled_on=s.get("enrolled_on", ""),
                semester=sem,
                credits_completed=s.get("credits_completed", 53),
            )
            self._transcripts[s["external_ref"]] = _default_transcript_courses(sem)

        for r in data.get("reviewers", []):
            self._by_ref[r["external_ref"]] = Identity(
                external_ref=r["external_ref"],
                full_name=r["full_name"],
                role_title=r.get("role_title", ""),
                institution=r.get("institution", ""),
            )
        for o in data.get("ministry_officers", []):
            self._by_ref[o["external_ref"]] = Identity(
                external_ref=o["external_ref"],
                full_name=o["full_name"],
                role_title=o.get("role_title", ""),
                institution=o.get("institution", ""),
            )

    def get(self, external_ref: str) -> Optional[Identity]:
        return self._by_ref.get(external_ref)

    def all_students(self) -> list[Identity]:
        return [i for i in self._by_ref.values() if i.programme]

    def all_reviewers(self) -> list[Identity]:
        return [i for i in self._by_ref.values() if i.role_title and not i.programme
                and i.external_ref.startswith("reviewer-")]

    def update_target(
        self,
        external_ref: str,
        target_institution: str,
        target_programme: Optional[str] = None,
    ) -> Optional[Identity]:
        import dataclasses
        identity = self._by_ref.get(external_ref)
        if identity is None:
            return None
        kwargs: dict[str, str] = {"target_institution": target_institution}
        if target_programme:
            kwargs["target_programme"] = target_programme
        updated = dataclasses.replace(identity, **kwargs)
        self._by_ref[external_ref] = updated
        return updated

    def get_transcript(self, external_ref: str) -> list[dict]:
        if external_ref in self._transcripts:
            return self._transcripts[external_ref]
        identity = self.get(external_ref)
        sem = identity.semester if identity else 4
        courses = _default_transcript_courses(sem)
        self._transcripts[external_ref] = courses
        return courses

    def update_transcript(self, external_ref: str, courses: list[dict], semester: int | None = None) -> list[dict]:
        self._transcripts[external_ref] = courses
        identity = self.get(external_ref)
        if identity:
            import dataclasses
            total_credits = sum(int(c.get("credits", 3)) for c in courses)
            kwargs: dict[str, Any] = {"credits_completed": total_credits}
            if semester is not None:
                kwargs["semester"] = semester
            self._by_ref[external_ref] = dataclasses.replace(identity, **kwargs)
        return courses

    def register_student(
        self,
        full_name: str,
        institution: str,
        programme: str,
        semester: int = 4,
        target_institution: str = "IIT Bombay",
        target_programme: str = "BTech-CSE",
        apaar_id: Optional[str] = None,
        courses: Optional[list[dict]] = None,
    ) -> Identity:
        import uuid
        digits = "".join(ch for ch in (apaar_id or "") if ch.isdigit())
        if len(digits) >= 8:
            prefix = digits[:4]
            suffix = digits[-4:]
            formatted_apaar = f"{prefix} **** {suffix}"
            abc_id = f"ABC-2026-{prefix}-{suffix}"
        else:
            p1 = str(uuid.uuid4().int % 8999 + 1000)
            p2 = str(uuid.uuid4().int % 8999 + 1000)
            formatted_apaar = f"{p1} **** {p2}"
            abc_id = f"ABC-2026-{p1}-{p2}"

        external_ref = f"student-{uuid.uuid4().hex[:6]}"
        final_courses = courses if courses and len(courses) > 0 else _default_transcript_courses(semester)
        total_credits = sum(int(c.get("credits", 3)) for c in final_courses)

        identity = Identity(
            external_ref=external_ref,
            full_name=full_name,
            institution=institution,
            programme=programme,
            target_institution=target_institution,
            target_programme=target_programme,
            apaar_masked=formatted_apaar,
            abc_id=abc_id,
            enrolled_on="2023-08-01",
            semester=semester,
            credits_completed=total_credits,
        )
        self._by_ref[external_ref] = identity
        self._transcripts[external_ref] = final_courses
        return identity

