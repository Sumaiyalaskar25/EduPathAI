# services/matching/providers/base.py
"""
Canonical LLM provider interface.

Every provider (Gemini, OpenAI, local) converts to/from these shapes.
The gateway (services/matching/gateway.py) routes through this protocol.

Owner: Member 2
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


class ProviderError(Exception):
    """Raised when a provider fails to return a valid response."""

    def __init__(self, provider: str, message: str) -> None:
        self.provider = provider
        self.message = message
        super().__init__(f"[{provider}] {message}")


@dataclass(frozen=True)
class CanonicalRequest:
    """Provider-agnostic request. Providers translate this into their SDK call."""

    task: str
    system_prompt: str
    user_prompt: str
    response_schema: dict
    max_tokens: int = 4096
    temperature: float = 0.0

    def __post_init__(self) -> None:
        if not self.task:
            raise ValueError("task must be non-empty")
        if not self.system_prompt:
            raise ValueError("system_prompt must be non-empty")
        if not self.user_prompt:
            raise ValueError("user_prompt must be non-empty")
        if self.max_tokens < 1:
            raise ValueError("max_tokens must be >= 1")
        if not (0.0 <= self.temperature <= 2.0):
            raise ValueError("temperature must be in [0, 2]")


@dataclass(frozen=True)
class CanonicalResponse:
    """Provider-agnostic response. Gateway consumes this regardless of provider."""

    provider: str
    model: str
    raw_text: str
    parsed: dict
    input_tokens: int
    output_tokens: int
    latency_ms: int
    confidence: float

    def __post_init__(self) -> None:
        if not self.provider:
            raise ValueError("provider must be non-empty")
        if not self.model:
            raise ValueError("model must be non-empty")
        if self.input_tokens < 0 or self.output_tokens < 0:
            raise ValueError("token counts must be non-negative")
        if self.latency_ms < 0:
            raise ValueError("latency_ms must be non-negative")
        if not (0.0 <= self.confidence <= 1.0):
            raise ValueError("confidence must be in [0, 1]")


@runtime_checkable
class Provider(Protocol):
    """Every provider implements this."""

    name: str

    def call(self, req: CanonicalRequest) -> CanonicalResponse: ...
