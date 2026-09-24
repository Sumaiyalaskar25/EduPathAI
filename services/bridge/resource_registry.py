# services/bridge/resource_registry.py
"""BridgePath resource registry. Loads resource metadata from JSON."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Resource:
    id: str
    provider: str          # NPTEL / SWAYAM / VLAB / HEI
    title: str
    url: str
    competency_tags: list[str]
    duration_hours: int
    assessment_available: bool
    prerequisites: list[str]
    recognition_status: str  # LEARNING_ONLY | FORMAL_BRIDGE
    valid_until: str


class ResourceRegistry:
    def __init__(self, catalog_path: Path = Path("data/resources/catalog.json")):
        self.catalog_path = catalog_path
        self._resources: dict[str, Resource] = {}
        self._load()

    def _load(self) -> None:
        if not self.catalog_path.exists():
            return
        data = json.loads(self.catalog_path.read_text(encoding="utf-8"))
        for r in data.get("resources", []):
            self._resources[r["id"]] = Resource(**r)

    def find_for_outcomes(
        self,
        missing_outcomes: list[str],
        max_results: int = 3,
    ) -> list[tuple[Resource, float]]:
        """
        Returns (resource, coverage_score) sorted by coverage desc.
        coverage_score = fraction of missing outcomes covered by resource.
        """
        if not missing_outcomes:
            return []

        scored: list[tuple[Resource, float]] = []
        for resource in self._resources.values():
            covered = sum(
                1 for outcome in missing_outcomes
                if any(tag.lower() in outcome.lower() for tag in resource.competency_tags)
            )
            if covered == 0:
                continue
            coverage = covered / len(missing_outcomes)
            scored.append((resource, coverage))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:max_results]

    def get(self, resource_id: str) -> Resource | None:
        """Look up a single resource by id (as stored on a `bridges` row's
        `resource_id` — see services/api/orchestrator.py:resource.id)."""
        return self._resources.get(resource_id)
