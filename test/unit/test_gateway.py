# test/unit/test_gateway.py
"""Unit tests for services.matching.gateway."""
from __future__ import annotations

import pytest

from services.matching.cost_tracker import CostTracker
from services.matching.gateway import AIGateway, GatewayResult
from services.matching.providers.base import (
    CanonicalRequest,
    CanonicalResponse,
    ProviderError,
)


class FakeProvider:
    def __init__(self, name, success=True, confidence=0.9, exc=None):
        self.name = name
        self._success = success
        self._confidence = confidence
        self._exc = exc
        self.call_count = 0

    def call(self, req):
        self.call_count += 1
        if self._exc is not None:
            raise self._exc
        if not self._success:
            raise ProviderError(self.name, "simulated failure")
        return CanonicalResponse(
            provider=self.name,
            model=f"{self.name}-model",
            raw_text='{"ok": true}',
            parsed={"confidence": self._confidence},
            input_tokens=100,
            output_tokens=50,
            latency_ms=10,
            confidence=self._confidence,
        )


def _req():
    return CanonicalRequest(
        task="test",
        system_prompt="sys",
        user_prompt="user",
        response_schema={"type": "object"},
    )


def test_happy_path_single_provider():
    gw = AIGateway(
        providers=[FakeProvider("primary")],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req())
    assert isinstance(result, GatewayResult)
    assert len(result.responses) == 1
    assert result.responses[0].provider == "primary"
    assert result.fallback_used is False
    assert result.all_failed is False
    assert result.review_reason is None


def test_fallback_to_secondary():
    gw = AIGateway(
        providers=[FakeProvider("primary", success=False), FakeProvider("secondary")],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req())
    assert len(result.responses) == 1
    assert result.responses[0].provider == "secondary"
    assert result.fallback_used is True
    assert result.all_failed is False


def test_all_fail_returns_review():
    gw = AIGateway(
        providers=[FakeProvider("a", success=False), FakeProvider("b", success=False)],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req())
    assert result.responses == []
    assert result.all_failed is True
    assert result.review_reason == "all_providers_unavailable"


def test_cost_tracked_on_success():
    tracker = CostTracker()
    gw = AIGateway(
        providers=[FakeProvider("primary")],
        cost_tracker=tracker,
    )
    gw.call(_req())
    assert tracker.call_count() == 1


def test_cost_not_tracked_on_failure():
    tracker = CostTracker()
    gw = AIGateway(
        providers=[FakeProvider("primary", success=False)],
        cost_tracker=tracker,
    )
    gw.call(_req())
    assert tracker.call_count() == 0


def test_circuit_opens_after_threshold_failures():
    provider = FakeProvider("flaky", success=False)
    gw = AIGateway(
        providers=[provider],
        cost_tracker=CostTracker(),
        breaker_threshold=3,
    )
    for _ in range(3):
        gw.call(_req())
    assert provider.call_count == 3
    # 4th call: breaker is open, provider must not be called again
    gw.call(_req())
    assert provider.call_count == 3


def test_min_responses_two_providers():
    gw = AIGateway(
        providers=[FakeProvider("a"), FakeProvider("b"), FakeProvider("c")],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req(), min_responses=2)
    assert len(result.responses) == 2
    assert {r.provider for r in result.responses} == {"a", "b"}


def test_min_responses_with_one_failing():
    gw = AIGateway(
        providers=[
            FakeProvider("a", success=False),
            FakeProvider("b"),
            FakeProvider("c"),
        ],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req(), min_responses=2)
    assert len(result.responses) == 2
    assert {r.provider for r in result.responses} == {"b", "c"}


def test_empty_providers_rejected():
    with pytest.raises(ValueError):
        AIGateway(providers=[], cost_tracker=CostTracker())


def test_invalid_min_responses_rejected():
    gw = AIGateway(
        providers=[FakeProvider("a")],
        cost_tracker=CostTracker(),
    )
    with pytest.raises(ValueError):
        gw.call(_req(), min_responses=0)


def test_unexpected_exception_treated_as_failure():
    gw = AIGateway(
        providers=[
            FakeProvider("buggy", exc=RuntimeError("not a ProviderError")),
            FakeProvider("healthy"),
        ],
        cost_tracker=CostTracker(),
    )
    result = gw.call(_req())
    assert len(result.responses) == 1
    assert result.responses[0].provider == "healthy"
    assert result.fallback_used is True


def test_multi_provider_cost_both_tracked():
    tracker = CostTracker()
    gw = AIGateway(
        providers=[FakeProvider("a"), FakeProvider("b")],
        cost_tracker=tracker,
    )
    gw.call(_req(), min_responses=2)
    assert tracker.call_count() == 2
