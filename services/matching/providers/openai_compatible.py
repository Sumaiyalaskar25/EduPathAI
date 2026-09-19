# services/matching/providers/openai_compatible.py
"""
OpenAI-compatible provider adapter.

Works for any service that speaks the OpenAI Chat Completions API:
  - OpenAI (gpt-4o, gpt-4o-mini)
  - DeepSeek (deepseek-chat)         base_url=https://api.deepseek.com/v1
  - Kimi / Moonshot (moonshot-v1-8k) base_url=https://api.moonshot.cn/v1
  - OpenRouter, vLLM, Ollama (OpenAI mode), etc.

Owner: Member 2
"""
from __future__ import annotations

import json
import os
import time

from openai import OpenAI

from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
    ProviderError,
)


# Named presets for common OpenAI-compatible endpoints
PRESETS: dict[str, dict[str, str]] = {
    "openai": {
        "base_url": "",  # default OpenAI endpoint
        "env_key": "OPENAI_API_KEY",
        "default_model": "gpt-4o-mini",
    },
    "deepseek": {
        "base_url": "https://api.deepseek.com/v1",
        "env_key": "DEEPSEEK_API_KEY",
        "default_model": "deepseek-chat",
    },
    "kimi": {
        "base_url": "https://api.moonshot.cn/v1",
        "env_key": "KIMI_API_KEY",
        "default_model": "moonshot-v1-8k",
    },
}


class OpenAICompatibleProvider:
    """
    OpenAI-compatible adapter.

    Usage:
        # OpenAI
        p = OpenAICompatibleProvider(preset="openai")

        # DeepSeek
        p = OpenAICompatibleProvider(preset="deepseek")

        # Custom endpoint
        p = OpenAICompatibleProvider(
            name="custom",
            base_url="https://my-endpoint/v1",
            api_key="...",
            model="my-model",
        )
    """

    def __init__(
        self,
        preset: str | None = None,
        name: str | None = None,
        base_url: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        if preset is not None:
            if preset not in PRESETS:
                raise ValueError(
                    f"unknown preset '{preset}'. "
                    f"Valid: {sorted(PRESETS.keys())}"
                )
            cfg = PRESETS[preset]
            self.name = name or preset
            self._base_url = base_url or cfg["base_url"]
            self.model_name = model or cfg["default_model"]
            env_key = cfg["env_key"]
        else:
            if not name:
                raise ValueError("Either preset= or name= must be provided")
            self.name = name
            self._base_url = base_url or ""
            self.model_name = model or "gpt-4o-mini"
            env_key = "OPENAI_API_KEY"

        if api_key is None:
            api_key = os.environ.get(env_key)
        if not api_key:
            raise ValueError(
                f"OpenAICompatibleProvider('{self.name}') requires an API key. "
                f"Pass api_key=... or set {env_key} env var."
            )

        client_kwargs = {"api_key": api_key}
        if self._base_url:
            client_kwargs["base_url"] = self._base_url

        self._client = OpenAI(**client_kwargs)

    def call(self, req: CanonicalRequest) -> CanonicalResponse:
        start = time.perf_counter()

        try:
            response = self._client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": req.system_prompt},
                    {"role": "user", "content": req.user_prompt},
                ],
                temperature=req.temperature,
                max_tokens=req.max_tokens,
                response_format={"type": "json_object"},
            )
        except Exception as e:
            raise ProviderError(self.name, f"API call failed: {e}") from e

        latency_ms = int((time.perf_counter() - start) * 1000)

        raw_text = response.choices[0].message.content
        if raw_text is None:
            raise ProviderError(self.name, "Response has no content")

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as e:
            raise ProviderError(self.name, f"Invalid JSON: {e}") from e

        if not isinstance(parsed, dict):
            raise ProviderError(
                self.name,
                f"Response must be a JSON object, got {type(parsed).__name__}",
            )

        usage = getattr(response, "usage", None)
        input_tokens = int(getattr(usage, "prompt_tokens", 0) or 0)
        output_tokens = int(getattr(usage, "completion_tokens", 0) or 0)

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
