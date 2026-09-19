# test/unit/test_circuit_breaker.py
"""Unit tests for services.matching.circuit_breaker."""
from __future__ import annotations

import time

import pytest

from services.matching.circuit_breaker import CircuitBreaker


def test_initially_closed():
    cb = CircuitBreaker("test")
    assert cb.is_open() is False


def test_opens_after_threshold_failures():
    cb = CircuitBreaker("test", threshold=3, window_seconds=10, cooldown_seconds=1)
    for _ in range(3):
        cb.record_failure()
    assert cb.is_open() is True


def test_does_not_open_below_threshold():
    cb = CircuitBreaker("test", threshold=5, window_seconds=10, cooldown_seconds=1)
    for _ in range(4):
        cb.record_failure()
    assert cb.is_open() is False


def test_closes_after_cooldown():
    cb = CircuitBreaker("test", threshold=3, window_seconds=10, cooldown_seconds=0.5)
    for _ in range(3):
        cb.record_failure()
    assert cb.is_open() is True
    time.sleep(0.6)
    assert cb.is_open() is False


def test_success_resets_failure_window():
    cb = CircuitBreaker("test", threshold=3, window_seconds=10, cooldown_seconds=1)
    cb.record_failure()
    cb.record_failure()
    cb.record_success()
    cb.record_failure()
    assert cb.is_open() is False


def test_failures_outside_window_ignored():
    cb = CircuitBreaker("test", threshold=3, window_seconds=0.3, cooldown_seconds=1)
    cb.record_failure()
    cb.record_failure()
    time.sleep(0.4)
    cb.record_failure()
    assert cb.is_open() is False


def test_snapshot_shape():
    cb = CircuitBreaker("gemini", threshold=3, window_seconds=10, cooldown_seconds=60)
    cb.record_failure()
    cb.record_success()
    snap = cb.snapshot()
    assert snap["name"] == "gemini"
    assert snap["open"] is False
    assert snap["total_calls"] == 2
    assert snap["total_failures"] == 1
    assert 0.0 <= snap["failure_rate"] <= 1.0


def test_reset_clears_state():
    cb = CircuitBreaker("test", threshold=2, window_seconds=10, cooldown_seconds=60)
    cb.record_failure()
    cb.record_failure()
    assert cb.is_open() is True
    cb.reset()
    assert cb.is_open() is False
    snap = cb.snapshot()
    assert snap["total_calls"] == 0
    assert snap["total_failures"] == 0


def test_invalid_construction_rejected():
    with pytest.raises(ValueError):
        CircuitBreaker("test", threshold=0)
    with pytest.raises(ValueError):
        CircuitBreaker("test", window_seconds=0)
    with pytest.raises(ValueError):
        CircuitBreaker("test", cooldown_seconds=0)
