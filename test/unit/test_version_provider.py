# test/unit/test_version_provider.py
"""Unit tests for services.matching.version_provider."""
from __future__ import annotations

import pytest

from services.matching.version_provider import (
    VersionProvider,
    MatchingVersions,
    EMBEDDING_MODEL_VERSION,
    CROSS_ENCODER_VERSION,
    RETRIEVAL_THRESHOLD,
    DEFAULT_MODEL_VERSION,
    DEFAULT_PROMPT_VERSION,
    default_version_provider,
)


def test_defaults_match_constants():
    vp = VersionProvider()
    assert vp.embedding_model_version() == EMBEDDING_MODEL_VERSION
    assert vp.cross_encoder_version() == CROSS_ENCODER_VERSION
    assert vp.retrieval_threshold() == RETRIEVAL_THRESHOLD
    assert vp.model_version() == DEFAULT_MODEL_VERSION
    assert vp.prompt_version() == DEFAULT_PROMPT_VERSION


def test_defaults_align_with_frontend_contract():
    vp = VersionProvider()
    assert "MiniLM-L6" in vp.embedding_model_version()
    assert "ms-marco-MiniLM" in vp.cross_encoder_version()
    assert 0.0 <= vp.retrieval_threshold() <= 1.0


def test_overrides_take_effect():
    vp = VersionProvider(
        embedding_model_version="custom-embed-v1",
        cross_encoder_version="custom-xenc-v2",
        retrieval_threshold=0.55,
        model_version="gpt-4o-mini",
        prompt_version="matching-v9",
    )
    assert vp.embedding_model_version() == "custom-embed-v1"
    assert vp.cross_encoder_version() == "custom-xenc-v2"
    assert vp.retrieval_threshold() == 0.55
    assert vp.model_version() == "gpt-4o-mini"
    assert vp.prompt_version() == "matching-v9"


def test_snapshot_is_immutable_and_complete():
    vp = VersionProvider()
    snap = vp.snapshot()
    assert isinstance(snap, MatchingVersions)
    with pytest.raises(Exception):
        snap.embedding_model_version = "hacked"  # type: ignore


def test_invalid_threshold_rejected():
    with pytest.raises(ValueError):
        VersionProvider(retrieval_threshold=1.5)
    with pytest.raises(ValueError):
        VersionProvider(retrieval_threshold=-0.1)


def test_empty_strings_rejected():
    with pytest.raises(ValueError):
        VersionProvider(embedding_model_version="")
    with pytest.raises(ValueError):
        VersionProvider(cross_encoder_version="")
    with pytest.raises(ValueError):
        VersionProvider(model_version="")
    with pytest.raises(ValueError):
        VersionProvider(prompt_version="")


def test_module_level_default_instance_exists():
    assert isinstance(default_version_provider, VersionProvider)
    assert default_version_provider.embedding_model_version() == EMBEDDING_MODEL_VERSION
