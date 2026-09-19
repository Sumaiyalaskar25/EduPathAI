# services/matching/gateway.py
"""
AI Gateway. Routes canonical requests through a chain of providers.

Responsibilities:
  - Try each provider in priority order.
  - Skip providers whose circuit breaker is open.
  - On success: record cost, return.
  - On ProviderError: record failure, move to next provider.
  - Never raise. If all providers fail, return GatewayResult(all_failed=True).
  - Optional multi-provider mode (min_responses=N) for consensus.

Owner: Member 2
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

from services.matching.circuit_breaker import CircuitBreaker
from services.matching.cost_tracker import CostTracker
from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
    Provider,
    ProviderError,
)

log = logging.getLogger(__name__)


@dataclass
class GatewayResult:
    """Outcome of a gateway call. Never raises - caller inspects flags."""
    responses: list[CanonicalResponse] = field(default_factory=list)
    fallback_used: bool = False
    all_failed: bool = False
    review_reason: str | None = None


class AIGateway:
    """
    Provider router with circuit breakers and cost tracking.

    Usage:
        gateway = AIGateway(
            providers=[gemini, deepseek, local],
            cost_tracker=CostTracker(),
        )
        result = gateway.call(req)
        if result.all_failed:
            # route to REVIEW
            ...
        else:
            primary_response = result.responses[0]
    """

    def __init__(
        self,
        providers: list[Provider],
        cost_tracker: CostTracker,
        circuit_breakers: dict[str, CircuitBreaker] | None = None,
        breaker_threshold: int = 5,
        breaker_window_seconds: float = 10.0,
        breaker_cooldown_seconds: float = 60.0,
    ) -> None:
        if not providers:
            raise ValueError("AIGateway requires at least one provider")

        self.providers = list(providers)
        self.cost_tracker = cost_tracker

        if circuit_breakers is None:
            circuit_breakers = {
                p.name: CircuitBreaker(
                    name=p.name,
                    threshold=breaker_threshold,
                    window_seconds=breaker_window_seconds,
                    cooldown_seconds=breaker_cooldown_seconds,
                )
                for p in providers
            }
        self.breakers = circuit_breakers

    def call(
        self,
        req: CanonicalRequest,
        min_responses: int = 1,
    ) -> GatewayResult:
        if min_responses < 1:
            raise ValueError("min_responses must be >= 1")

        responses: list[CanonicalResponse] = []
        fallback_used = False

        for provider in self.providers:
            if len(responses) >= min_responses:
                break

            breaker = self.breakers.get(provider.name)
            if breaker is None:
                breaker = CircuitBreaker(provider.name)
                self.breakers[provider.name] = breaker

            if breaker.is_open():
                log.warning("circuit_open provider=%s", provider.name)
                fallback_used = True
                continue

            try:
                resp = provider.call(req)
            except ProviderError as e:
                log.error("provider_error provider=%s err=%s", provider.name, e)
                breaker.record_failure()
                fallback_used = True
                continue
            except Exception:
                log.exception("provider_unexpected provider=%s", provider.name)
                breaker.record_failure()
                fallback_used = True
                continue

            breaker.record_success()
            self.cost_tracker.record(
                provider=resp.provider,
                model=resp.model,
                task=req.task,
                input_tokens=resp.input_tokens,
                output_tokens=resp.output_tokens,
            )
            responses.append(resp)

        if not responses:
            return GatewayResult(
                responses=[],
                fallback_used=True,
                all_failed=True,
                review_reason="all_providers_unavailable",
            )

        return GatewayResult(
            responses=responses,
            fallback_used=fallback_used,
            all_failed=False,
        )
