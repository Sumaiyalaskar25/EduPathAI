# test/unit/test_bundle_provider.py
"""Unit tests for services.snapshot.bundle_provider."""
from __future__ import annotations

import asyncio

import pytest

from services.matching.version_provider import (
    CROSS_ENCODER_VERSION,
    DEFAULT_MODEL_VERSION,
    DEFAULT_PROMPT_VERSION,
    EMBEDDING_MODEL_VERSION,
    RETRIEVAL_THRESHOLD,
    VersionProvider,
)
from services.snapshot.bundle_provider import DecisionBundleProvider


def test_capture_uses_version_provider_defaults():
    provider = DecisionBundleProvider()
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    assert bundle.model_version == DEFAULT_MODEL_VERSION
    assert bundle.prompt_version == DEFAULT_PROMPT_VERSION
    assert bundle.embedding_model_version == EMBEDDING_MODEL_VERSION
    assert bundle.cross_encoder_version == CROSS_ENCODER_VERSION
    assert bundle.retrieval_threshold == RETRIEVAL_THRESHOLD


def test_capture_returns_valid_bundle():
    provider = DecisionBundleProvider()
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    # must not raise
    bundle.verify()


def test_capture_uses_custom_version_provider():
    vp = VersionProvider(
        embedding_model_version="custom-embed-v9",
        cross_encoder_version="custom-xenc-v9",
        retrieval_threshold=0.42,
        model_version="custom-model-v9",
        prompt_version="custom-prompt-v9",
    )
    provider = DecisionBundleProvider(version_provider=vp)
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    assert bundle.embedding_model_version == "custom-embed-v9"
    assert bundle.cross_encoder_version == "custom-xenc-v9"
    assert bundle.retrieval_threshold == 0.42
    assert bundle.model_version == "custom-model-v9"
    assert bundle.prompt_version == "custom-prompt-v9"


def test_capture_curriculum_and_policy_composed_from_args():
    provider = DecisionBundleProvider()
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    assert "IIT-Bombay" in bundle.curriculum_version
    assert "BTech-CSE" in bundle.curriculum_version
    assert "IIT-Bombay" in bundle.policy_version


def test_capture_with_no_db_does_not_crash():
    provider = DecisionBundleProvider(db=None)
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    assert bundle is not None


def test_embedding_version_matches_frontend_contract():
    """Frontend BACKEND_SCHEMAS.md expects all-MiniLM-L6-v2."""
    provider = DecisionBundleProvider()
    bundle = asyncio.run(provider.capture("BTech-CSE", "IIT-Bombay"))
    assert "MiniLM-L6" in bundle.embedding_model_version
