# test/unit/test_providers_base.py
"""Unit tests for services.matching.providers.base."""
from __future__ import annotations

import pytest

from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
    Provider,
    ProviderError,
)


def test_canonical_request_valid():
    req = CanonicalRequest(
        task="extract",
        system_prompt="You are a parser.",
        user_prompt="Parse this syllabus.",
        response_schema={"type": "object"},
    )
    assert req.task == "extract"
    assert req.max_tokens == 4096
    assert req.temperature == 0.0


def test_canonical_request_rejects_empty_fields():
    with pytest.raises(ValueError):
        CanonicalRequest(task="", system_prompt="x", user_prompt="y", response_schema={})
    with pytest.raises(ValueError):
        CanonicalRequest(task="t", system_prompt="", user_prompt="y", response_schema={})
    with pytest.raises(ValueError):
        CanonicalRequest(task="t", system_prompt="x", user_prompt="", response_schema={})


def test_canonical_request_rejects_bad_temperature():
    with pytest.raises(ValueError):
        CanonicalRequest(
            task="t", system_prompt="x", user_prompt="y",
            response_schema={}, temperature=-0.1,
        )
    with pytest.raises(ValueError):
        CanonicalRequest(
            task="t", system_prompt="x", user_prompt="y",
            response_schema={}, temperature=2.5,
        )


def test_canonical_response_valid():
    resp = CanonicalResponse(
        provider="gemini",
        model="gemini-2.0-flash",
        raw_text='{"a": 1}',
        parsed={"a": 1},
        input_tokens=100,
        output_tokens=50,
        latency_ms=250,
        confidence=0.9,
    )
    assert resp.provider == "gemini"
    assert resp.confidence == 0.9


def test_canonical_response_rejects_bad_confidence():
    with pytest.raises(ValueError):
        CanonicalResponse(
            provider="gemini", model="m", raw_text="", parsed={},
            input_tokens=0, output_tokens=0, latency_ms=0, confidence=1.5,
        )


def test_canonical_response_rejects_negative_tokens():
    with pytest.raises(ValueError):
        CanonicalResponse(
            provider="gemini", model="m", raw_text="", parsed={},
            input_tokens=-1, output_tokens=0, latency_ms=0, confidence=0.5,
        )


def test_provider_protocol_is_runtime_checkable():
    class FakeProvider:
        name = "fake"

        def call(self, req):
            return None

    assert isinstance(FakeProvider(), Provider)


def test_provider_error_contains_provider_name():
    err = ProviderError("gemini", "rate limited")
    assert "gemini" in str(err)
    assert "rate limited" in str(err)
    assert err.provider == "gemini"
