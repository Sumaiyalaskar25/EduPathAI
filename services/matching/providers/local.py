# services/matching/providers/local.py
"""
Local fallback provider.

Used only when all real providers (Gemini, OpenAI, etc.) are unavailable.
Does NOT call any network. Does NOT load any ML model. Returns a
deterministic CanonicalResponse with confidence=0.0.

Purpose: prevent the pipeline from crashing when every external
provider is down. The recognizer will route these cases to REVIEW.

Owner: Member 2
"""
from __future__ import annotations

import json
import time

from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
)


class LocalProvider:
    """Deterministic no-op provider. Never fails, never evaluates."""

    name = "local"

    def __init__(self, model: str = "local-fallback-v1") -> None:
        self.model_name = model

    def call(self, req: CanonicalRequest) -> CanonicalResponse:
        start = time.perf_counter()

        # Deterministic payload: marks the request as unevaluated.
        parsed = {
            "status": "cannot_evaluate",
            "reason": "local_fallback_used",
            "task": req.task,
        }
        raw_text = json.dumps(parsed)

        latency_ms = int((time.perf_counter() - start) * 1000)

        return CanonicalResponse(
            provider=self.name,
            model=self.model_name,
            raw_text=raw_text,
            parsed=parsed,
            input_tokens=0,
            output_tokens=0,
            latency_ms=latency_ms,
            confidence=0.0,
        )
