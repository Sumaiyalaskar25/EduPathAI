# test/unit/test_providers_gemini.py
"""Unit tests for services.matching.providers.gemini."""
from __future__ import annotations

from types import SimpleNamespace

import pytest

import services.matching.providers.gemini as gemini_mod
from services.matching.providers.base import (
    CanonicalRequest,
    ProviderError,
)
from services.matching.providers.gemini import GeminiProvider


class _FakeResponse:
    def __init__(self, text, prompt_tokens=100, completion_tokens=50):
        self.text = text
        self.usage_metadata = SimpleNamespace(
            prompt_token_count=prompt_tokens,
            candidates_token_count=completion_tokens,
        )


class _FakeModel:
    def __init__(self, response=None, exc=None):
        self._response = response
        self._exc = exc

    def generate_content(self, *args, **kwargs):
        if self._exc is not None:
            raise self._exc
        return self._response


def _sample_request():
    return CanonicalRequest(
        task="extract",
        system_prompt="You are a parser.",
        user_prompt="Parse this.",
        response_schema={"type": "object"},
    )


def _install_fake_model(monkeypatch, fake_model):
    monkeypatch.setattr(gemini_mod.genai, "configure", lambda **kw: None)
    monkeypatch.setattr(gemini_mod.genai, "GenerativeModel", lambda **kw: fake_model)


def test_requires_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    with pytest.raises(ValueError):
        GeminiProvider()


def test_reads_key_from_env(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "env-key")
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse('{"confidence": 0.9}')),
    )
    p = GeminiProvider()
    assert p.name == "gemini"
    assert p.model_name == "gemini-2.0-flash"


def test_valid_response(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse('{"confidence": 0.92, "answer": "yes"}')),
    )
    p = GeminiProvider(api_key="fake-key")
    resp = p.call(_sample_request())
    assert resp.provider == "gemini"
    assert resp.confidence == 0.92
    assert resp.parsed["answer"] == "yes"
    assert resp.input_tokens == 100
    assert resp.output_tokens == 50
    assert resp.latency_ms >= 0


def test_invalid_json_raises_provider_error(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse("not json")),
    )
    p = GeminiProvider(api_key="fake-key")
    with pytest.raises(ProviderError) as exc:
        p.call(_sample_request())
    assert "gemini" in str(exc.value).lower()


def test_non_object_json_raises_provider_error(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse("[1, 2, 3]")),
    )
    p = GeminiProvider(api_key="fake-key")
    with pytest.raises(ProviderError):
        p.call(_sample_request())


def test_api_exception_wrapped(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(exc=RuntimeError("rate limited")),
    )
    p = GeminiProvider(api_key="fake-key")
    with pytest.raises(ProviderError) as exc:
        p.call(_sample_request())
    assert "rate limited" in str(exc.value)


def test_confidence_clamped_to_unit_range(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse('{"confidence": 1.7}')),
    )
    p = GeminiProvider(api_key="fake-key")
    resp = p.call(_sample_request())
    assert resp.confidence == 1.0


def test_missing_confidence_defaults_safely(monkeypatch):
    _install_fake_model(
        monkeypatch,
        _FakeModel(response=_FakeResponse('{"answer": "yes"}')),
    )
    p = GeminiProvider(api_key="fake-key")
    resp = p.call(_sample_request())
    assert resp.confidence == 0.5
