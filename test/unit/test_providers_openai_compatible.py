# test/unit/test_providers_openai_compatible.py
"""Unit tests for services.matching.providers.openai_compatible."""
from __future__ import annotations

from types import SimpleNamespace

import pytest

import services.matching.providers.openai_compatible as oai_mod
from services.matching.providers.base import (
    CanonicalRequest,
    ProviderError,
)
from services.matching.providers.openai_compatible import (
    OpenAICompatibleProvider,
    PRESETS,
)


class _FakeCompletions:
    def __init__(self, content=None, exc=None):
        self._content = content
        self._exc = exc

    def create(self, **kwargs):
        if self._exc is not None:
            raise self._exc
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content=self._content),
                )
            ],
            usage=SimpleNamespace(prompt_tokens=120, completion_tokens=60),
        )


class _FakeClient:
    def __init__(self, content=None, exc=None):
        self.chat = SimpleNamespace(
            completions=_FakeCompletions(content=content, exc=exc),
        )


def _install_fake_client(monkeypatch, content=None, exc=None):
    def _factory(**kwargs):
        return _FakeClient(content=content, exc=exc)
    monkeypatch.setattr(oai_mod, "OpenAI", _factory)


def _sample_request():
    return CanonicalRequest(
        task="extract",
        system_prompt="You are a parser.",
        user_prompt="Parse this.",
        response_schema={"type": "object"},
    )


def test_presets_exist():
    assert "openai" in PRESETS
    assert "deepseek" in PRESETS
    assert "kimi" in PRESETS


def test_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(ValueError):
        OpenAICompatibleProvider(preset="openai")


def test_unknown_preset_rejected():
    with pytest.raises(ValueError):
        OpenAICompatibleProvider(preset="not-real")


def test_reads_key_from_env_and_uses_preset(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "fake-deepseek-key")
    _install_fake_client(monkeypatch, content='{"confidence": 0.9}')

    p = OpenAICompatibleProvider(preset="deepseek")
    assert p.name == "deepseek"
    assert p.model_name == "deepseek-chat"


def test_valid_response(monkeypatch):
    _install_fake_client(monkeypatch, content='{"confidence": 0.85, "answer": "ok"}')
    p = OpenAICompatibleProvider(
        name="openai", api_key="fake", model="gpt-4o-mini",
    )
    resp = p.call(_sample_request())
    assert resp.provider == "openai"
    assert resp.confidence == 0.85
    assert resp.parsed["answer"] == "ok"
    assert resp.input_tokens == 120
    assert resp.output_tokens == 60


def test_invalid_json_wrapped(monkeypatch):
    _install_fake_client(monkeypatch, content="not json")
    p = OpenAICompatibleProvider(name="openai", api_key="fake")
    with pytest.raises(ProviderError) as exc:
        p.call(_sample_request())
    assert "openai" in str(exc.value).lower()


def test_non_object_json_rejected(monkeypatch):
    _install_fake_client(monkeypatch, content='[1,2,3]')
    p = OpenAICompatibleProvider(name="openai", api_key="fake")
    with pytest.raises(ProviderError):
        p.call(_sample_request())


def test_api_exception_wrapped(monkeypatch):
    _install_fake_client(monkeypatch, exc=RuntimeError("timeout"))
    p = OpenAICompatibleProvider(name="openai", api_key="fake")
    with pytest.raises(ProviderError) as exc:
        p.call(_sample_request())
    assert "timeout" in str(exc.value)


def test_custom_endpoint(monkeypatch):
    _install_fake_client(monkeypatch, content='{"confidence": 0.7}')
    p = OpenAICompatibleProvider(
        name="custom",
        base_url="https://example.invalid/v1",
        api_key="fake",
        model="custom-model",
    )
    assert p.name == "custom"
    assert p.model_name == "custom-model"


def test_confidence_clamped(monkeypatch):
    _install_fake_client(monkeypatch, content='{"confidence": -0.4}')
    p = OpenAICompatibleProvider(name="openai", api_key="fake")
    resp = p.call(_sample_request())
    assert resp.confidence == 0.0
