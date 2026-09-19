# test/unit/test_providers_local.py
"""Unit tests for services.matching.providers.local."""
from __future__ import annotations

from services.matching.providers.base import CanonicalRequest
from services.matching.providers.local import LocalProvider


def _sample_request(task: str = "extract") -> CanonicalRequest:
    return CanonicalRequest(
        task=task,
        system_prompt="You are a parser.",
        user_prompt="Parse this syllabus.",
        response_schema={"type": "object"},
    )


def test_local_provider_name_and_model():
    p = LocalProvider()
    assert p.name == "local"
    assert p.model_name == "local-fallback-v1"


def test_local_provider_returns_canonical_response():
    p = LocalProvider()
    resp = p.call(_sample_request())
    assert resp.provider == "local"
    assert resp.model == "local-fallback-v1"
    assert resp.confidence == 0.0
    assert resp.input_tokens == 0
    assert resp.output_tokens == 0
    assert resp.latency_ms >= 0


def test_local_provider_marks_cannot_evaluate():
    p = LocalProvider()
    resp = p.call(_sample_request(task="match_reason"))
    assert resp.parsed["status"] == "cannot_evaluate"
    assert resp.parsed["reason"] == "local_fallback_used"
    assert resp.parsed["task"] == "match_reason"


def test_local_provider_never_raises():
    p = LocalProvider()
    reqs = [
        _sample_request("extract"),
        _sample_request("match_reason"),
        _sample_request("gap_explain"),
    ]
    for r in reqs:
        resp = p.call(r)
        assert resp.confidence == 0.0
