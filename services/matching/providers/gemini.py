# services/matching/providers/gemini.py
"""
Google Gemini provider adapter.

Wraps the google-generativeai SDK behind the canonical Provider Protocol.
Forces JSON output mode. Wraps all SDK errors in ProviderError so the
gateway can catch a single exception type.

Owner: Member 2
"""
from __future__ import annotations

import json
import os
import time

import google.generativeai as genai

from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
    ProviderError,
)


DEFAULT_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class GeminiProvider:
    """Gemini adapter. Implements the Provider Protocol."""

    name = "gemini"

    def __init__(
        self,
        api_key: str | None = None,
        model: str = DEFAULT_GEMINI_MODEL,
    ) -> None:
        if api_key is None:
            api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GeminiProvider requires an API key. "
                "Pass api_key=... or set GEMINI_API_KEY env var."
            )
        genai.configure(api_key=api_key)
        self.model_name = model
        self._model = genai.GenerativeModel(model_name=model)

    def call(self, req: CanonicalRequest) -> CanonicalResponse:
        start = time.perf_counter()

        try:
            response = self._model.generate_content(
                [req.system_prompt, req.user_prompt],
                generation_config={
                    "temperature": req.temperature,
                    "max_output_tokens": req.max_tokens,
                    "response_mime_type": "application/json",
                },
            )
        except Exception as e:
            raise ProviderError(self.name, f"API call failed: {e}") from e

        latency_ms = int((time.perf_counter() - start) * 1000)

        raw_text = getattr(response, "text", None)
        if raw_text is None:
            raise ProviderError(self.name, "Response has no text")

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as e:
            raise ProviderError(self.name, f"Invalid JSON: {e}") from e

        if not isinstance(parsed, dict):
            raise ProviderError(
                self.name,
                f"Response must be a JSON object, got {type(parsed).__name__}",
            )

        usage = getattr(response, "usage_metadata", None)
        input_tokens = int(getattr(usage, "prompt_token_count", 0) or 0)
        output_tokens = int(getattr(usage, "candidates_token_count", 0) or 0)

        confidence = parsed.get("confidence", 0.5)
        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.0
        confidence = max(0.0, min(1.0, confidence))

        return CanonicalResponse(
            provider=self.name,
            model=self.model_name,
            raw_text=raw_text,
            parsed=parsed,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            confidence=confidence,
        )
