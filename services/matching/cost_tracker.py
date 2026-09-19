# services/matching/cost_tracker.py
"""
Per-provider cost tracker.

Records token usage and USD cost for every LLM call.
Thread-safe. Exposes totals for observability.

Pricing is USD per 1,000,000 tokens. Update the PRICING table when
provider pricing changes - the DecisionBundle captures provider
versions, not prices, so this is a soft dependency.

Owner: Member 2
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from threading import Lock


# USD per 1,000,000 tokens
PRICING: dict[str, dict[str, float]] = {
    "gemini-2.0-flash":      {"input": 0.10, "output": 0.40},
    "gemini-1.5-flash":      {"input": 0.075, "output": 0.30},
    "gpt-4o-mini":           {"input": 0.15, "output": 0.60},
    "gpt-4o":                {"input": 2.50, "output": 10.00},
    "deepseek-chat":         {"input": 0.14, "output": 0.28},
    "kimi-k2":               {"input": 0.60, "output": 2.50},
    "local-llama-3.2-3b":    {"input": 0.0,  "output": 0.0},
}


@dataclass(frozen=True)
class CostRecord:
    provider: str
    model: str
    task: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


@dataclass
class _Aggregates:
    total_usd: float = 0.0
    by_task: dict[str, float] = field(default_factory=lambda: defaultdict(float))
    by_provider: dict[str, float] = field(default_factory=lambda: defaultdict(float))
    by_model: dict[str, float] = field(default_factory=lambda: defaultdict(float))
    calls: int = 0


class CostTracker:
    """
    Thread-safe cost accumulator.

    Usage:
        tracker = CostTracker()
        tracker.record("gemini", "gemini-2.0-flash", "curriculum_extract", 10_000, 2_000)
        tracker.total_cost()                  # -> 0.0018
        tracker.cost_by_task()                # -> {"curriculum_extract": 0.0018}
        tracker.cost_per_request(1)           # -> 0.0018
    """

    def __init__(self, custom_pricing: dict[str, dict[str, float]] | None = None) -> None:
        self._pricing = dict(PRICING)
        if custom_pricing:
            self._pricing.update(custom_pricing)
        self._records: list[CostRecord] = []
        self._agg = _Aggregates()
        self._lock = Lock()

    # -------- core --------

    def record(
        self,
        provider: str,
        model: str,
        task: str,
        input_tokens: int,
        output_tokens: int,
    ) -> CostRecord:
        if input_tokens < 0 or output_tokens < 0:
            raise ValueError("token counts must be non-negative")

        pricing = self._pricing.get(model)
        if pricing is None:
            # Unknown model -> log at $0 but still record call for observability.
            pricing = {"input": 0.0, "output": 0.0}

        cost_usd = (
            (input_tokens / 1_000_000.0) * pricing["input"]
            + (output_tokens / 1_000_000.0) * pricing["output"]
        )

        rec = CostRecord(
            provider=provider,
            model=model,
            task=task,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
        )

        with self._lock:
            self._records.append(rec)
            self._agg.total_usd += cost_usd
            self._agg.by_task[task] += cost_usd
            self._agg.by_provider[provider] += cost_usd
            self._agg.by_model[model] += cost_usd
            self._agg.calls += 1

        return rec

    # -------- queries --------

    def total_cost(self) -> float:
        with self._lock:
            return self._agg.total_usd

    def cost_by_task(self) -> dict[str, float]:
        with self._lock:
            return dict(self._agg.by_task)

    def cost_by_provider(self) -> dict[str, float]:
        with self._lock:
            return dict(self._agg.by_provider)

    def cost_by_model(self) -> dict[str, float]:
        with self._lock:
            return dict(self._agg.by_model)

    def call_count(self) -> int:
        with self._lock:
            return self._agg.calls

    def cost_per_request(self, request_count: int) -> float:
        if request_count <= 0:
            return 0.0
        return self.total_cost() / request_count

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "total_usd": self._agg.total_usd,
                "calls": self._agg.calls,
                "by_task": dict(self._agg.by_task),
                "by_provider": dict(self._agg.by_provider),
                "by_model": dict(self._agg.by_model),
            }

    def reset(self) -> None:
        with self._lock:
            self._records = []
            self._agg = _Aggregates()
