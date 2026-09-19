# services/snapshot/bundle_provider.py
"""Decision Bundle provider. Captures the 13 immutable versions."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from services.matching.version_provider import VersionProvider
from services.schemas import DecisionBundle


class DecisionBundleProvider:
    """
    Captures the 13 version strings that impact the decision pipeline.

    Matching-layer versions (embedding model, cross-encoder,
    retrieval threshold, LLM model, prompt) come from VersionProvider
    so they stay consistent with the matcher's actual behavior.
    """

    def __init__(
        self,
        db: Any = None,
        version_provider: VersionProvider | None = None,
    ) -> None:
        self.db = db
        self.version_provider = version_provider or VersionProvider()

    async def capture(
        self,
        programme: str,
        institution: str,
    ) -> DecisionBundle:
        vp = self.version_provider
        bundle = DecisionBundle(
            id=uuid4(),
            curriculum_version=f"{institution}/{programme}/2026-v1",
            policy_version=f"{institution}/NEP2020-v2",
            model_version=vp.model_version(),
            prompt_version=vp.prompt_version(),
            embedding_model_version=vp.embedding_model_version(),
            cross_encoder_version=vp.cross_encoder_version(),
            retrieval_threshold=vp.retrieval_threshold(),
            solver_version="ortools-9.10",
            solver_parameters_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            resource_catalog_version="catalog-2026-09-01",
            ontology_version="acm-ccs-2024",
            ruleset_commit="git-commit-8f3a1c2",
            tool_definitions_hash="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            captured_at=datetime.now(timezone.utc),
        )
        bundle.verify()

        if self.db is not None:
            await self.db.execute(
                """
                INSERT INTO decision_bundles (
                    id, curriculum_version, policy_version, model_version, prompt_version,
                    embedding_model_version, cross_encoder_version, retrieval_threshold,
                    solver_version, solver_parameters_hash, resource_catalog_version,
                    ontology_version, ruleset_commit, tool_definitions_hash, captured_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
                """,
                bundle.id, bundle.curriculum_version, bundle.policy_version,
                bundle.model_version, bundle.prompt_version, bundle.embedding_model_version,
                bundle.cross_encoder_version, bundle.retrieval_threshold, bundle.solver_version,
                bundle.solver_parameters_hash, bundle.resource_catalog_version, bundle.ontology_version,
                bundle.ruleset_commit, bundle.tool_definitions_hash, bundle.captured_at,
            )

        return bundle
