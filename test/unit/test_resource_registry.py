# test/unit/test_resource_registry.py
"""Unit tests for services.bridge.resource_registry."""
from __future__ import annotations

from pathlib import Path

from services.bridge.resource_registry import Resource, ResourceRegistry

CATALOG_PATH = Path("data/resources/catalog.json")


def test_loads_real_catalog():
    registry = ResourceRegistry(CATALOG_PATH)
    assert len(registry._resources) >= 3


def test_get_returns_resource_by_id():
    registry = ResourceRegistry(CATALOG_PATH)
    resource = registry.get("nptel-algorithms-2026")
    assert isinstance(resource, Resource)
    assert resource.provider == "NPTEL"
    assert resource.title == "Design and Analysis of Algorithms"
    assert "amortized analysis" in resource.competency_tags


def test_get_returns_none_for_unknown_id():
    registry = ResourceRegistry(CATALOG_PATH)
    assert registry.get("does-not-exist") is None


def test_find_for_outcomes_ranks_by_coverage():
    registry = ResourceRegistry(CATALOG_PATH)
    results = registry.find_for_outcomes(
        ["Apply amortized analysis to data structure operations", "Design dynamic programming solutions"],
        max_results=3,
    )
    assert results, "expected at least one matching resource"
    top_resource, top_score = results[0]
    assert top_resource.id == "nptel-algorithms-2026"
    assert top_score == 1.0


def test_find_for_outcomes_empty_input_returns_empty():
    registry = ResourceRegistry(CATALOG_PATH)
    assert registry.find_for_outcomes([]) == []


def test_missing_catalog_file_loads_empty(tmp_path):
    registry = ResourceRegistry(tmp_path / "missing.json")
    assert registry._resources == {}
    assert registry.get("anything") is None
