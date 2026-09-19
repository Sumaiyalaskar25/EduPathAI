# test/unit/test_cost_tracker.py
"""Unit tests for services.matching.cost_tracker."""
from __future__ import annotations

import pytest

from services.matching.cost_tracker import CostTracker, CostRecord


def test_single_call_cost_computed_correctly():
    tracker = CostTracker()
    rec = tracker.record("gemini", "gemini-2.0-flash", "extract", 10_000, 2_000)
    # 10_000/1e6 * 0.10 + 2_000/1e6 * 0.40 = 0.001 + 0.0008 = 0.0018
    assert isinstance(rec, CostRecord)
    assert abs(rec.cost_usd - 0.0018) < 1e-9
    assert tracker.total_cost() == pytest.approx(0.0018)


def test_cost_by_task_and_provider():
    tracker = CostTracker()
    tracker.record("gemini", "gemini-2.0-flash", "task_a", 10_000, 0)
    tracker.record("gemini", "gemini-2.0-flash", "task_b", 0, 10_000)
    tracker.record("openai", "gpt-4o-mini",  "task_a", 5_000, 5_000)

    by_task = tracker.cost_by_task()
    assert "task_a" in by_task
    assert "task_b" in by_task
    assert by_task["task_a"] > by_task["task_b"]  # gpt-4o-mini output is pricier

    by_provider = tracker.cost_by_provider()
    assert set(by_provider.keys()) == {"gemini", "openai"}


def test_unknown_model_records_zero_cost_but_counts_call():
    tracker = CostTracker()
    rec = tracker.record("mystery", "unknown-model-v9", "task", 1_000_000, 1_000_000)
    assert rec.cost_usd == 0.0
    assert tracker.call_count() == 1


def test_negative_tokens_rejected():
    tracker = CostTracker()
    with pytest.raises(ValueError):
        tracker.record("gemini", "gemini-2.0-flash", "task", -1, 0)
    with pytest.raises(ValueError):
        tracker.record("gemini", "gemini-2.0-flash", "task", 0, -1)


def test_cost_per_request_handles_zero_and_positive():
    tracker = CostTracker()
    assert tracker.cost_per_request(0) == 0.0
    tracker.record("gemini", "gemini-2.0-flash", "task", 10_000, 0)
    assert tracker.cost_per_request(1) == pytest.approx(0.001)
    assert tracker.cost_per_request(10) == pytest.approx(0.0001)


def test_custom_pricing_override():
    tracker = CostTracker(custom_pricing={"gemini-2.0-flash": {"input": 1.0, "output": 1.0}})
    rec = tracker.record("gemini", "gemini-2.0-flash", "task", 1_000_000, 1_000_000)
    assert rec.cost_usd == pytest.approx(2.0)


def test_snapshot_and_reset():
    tracker = CostTracker()
    tracker.record("gemini", "gemini-2.0-flash", "task", 1_000_000, 0)
    snap = tracker.snapshot()
    assert snap["calls"] == 1
    assert snap["total_usd"] == pytest.approx(0.10)
    tracker.reset()
    assert tracker.total_cost() == 0.0
    assert tracker.call_count() == 0
