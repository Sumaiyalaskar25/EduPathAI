# services/matching/version_provider.py
"""
Canonical version provider for the matching layer.

Every downstream component that needs to know "which model",
"which threshold", "which prompt" reads from here. If a model
changes, bump the constant here - the DecisionBundle captures it
automatically.

Owner: Member 2
Consumed by: services/snapshot/bundle_provider.py
"""
from __future__ import annotations

from dataclasses import dataclass


EMBEDDING_MODEL_VERSION = "sentence-transformers/all-MiniLM-L6-v2"
CROSS_ENCODER_VERSION = "cross-encoder/ms-marco-MiniLM-L-6-v2"
RETRIEVAL_THRESHOLD = 0.70
DEFAULT_MODEL_VERSION = "gemini-2.0-flash"
DEFAULT_PROMPT_VERSION = "matching-v1"


@dataclass(frozen=True)
class MatchingVersions:
    embedding_model_version: str
    cross_encoder_version: str
    retrieval_threshold: float
    model_version: str
    prompt_version: str


class VersionProvider:
    def __init__(
        self,
        embedding_model_version: str | None = None,
        cross_encoder_version: str | None = None,
        retrieval_threshold: float | None = None,
        model_version: str | None = None,
        prompt_version: str | None = None,
    ) -> None:
        self._embedding_model_version = (
            embedding_model_version
            if embedding_model_version is not None
            else EMBEDDING_MODEL_VERSION
        )
        self._cross_encoder_version = (
            cross_encoder_version
            if cross_encoder_version is not None
            else CROSS_ENCODER_VERSION
        )
        self._retrieval_threshold = (
            retrieval_threshold
            if retrieval_threshold is not None
            else RETRIEVAL_THRESHOLD
        )
        self._model_version = (
            model_version
            if model_version is not None
            else DEFAULT_MODEL_VERSION
        )
        self._prompt_version = (
            prompt_version
            if prompt_version is not None
            else DEFAULT_PROMPT_VERSION
        )
        self._validate()

    def _validate(self) -> None:
        if not self._embedding_model_version:
            raise ValueError("embedding_model_version must be non-empty")
        if not self._cross_encoder_version:
            raise ValueError("cross_encoder_version must be non-empty")
        if not (0.0 <= self._retrieval_threshold <= 1.0):
            raise ValueError(
                f"retrieval_threshold must be in [0,1], got {self._retrieval_threshold}"
            )
        if not self._model_version:
            raise ValueError("model_version must be non-empty")
        if not self._prompt_version:
            raise ValueError("prompt_version must be non-empty")

    def embedding_model_version(self) -> str:
        return self._embedding_model_version

    def cross_encoder_version(self) -> str:
        return self._cross_encoder_version

    def retrieval_threshold(self) -> float:
        return self._retrieval_threshold

    def model_version(self) -> str:
        return self._model_version

    def prompt_version(self) -> str:
        return self._prompt_version

    def snapshot(self) -> MatchingVersions:
        return MatchingVersions(
            embedding_model_version=self._embedding_model_version,
            cross_encoder_version=self._cross_encoder_version,
            retrieval_threshold=self._retrieval_threshold,
            model_version=self._model_version,
            prompt_version=self._prompt_version,
        )


default_version_provider = VersionProvider()
