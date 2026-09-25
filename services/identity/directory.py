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


class IdentityDirectory:
    def __init__(self, path: Path = DEFAULT_DIRECTORY_PATH) -> None:
        self.path = Path(path)
        self._by_ref: dict[str, Identity] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        data = json.loads(self.path.read_text(encoding="utf-8"))
        for s in data.get("students", []):
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
            )
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
        # Students are the entries carrying a programme.
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

