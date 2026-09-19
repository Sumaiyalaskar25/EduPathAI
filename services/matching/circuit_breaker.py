# services/matching/circuit_breaker.py
"""
Per-provider circuit breaker.

Prevents cascading failures when an external provider (Gemini, OpenAI, etc.)
is down. After N failures within a time window, the breaker "opens" for a
cooldown period. During cooldown, calls fail fast without hitting the network.

Owner: Member 2
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from threading import Lock


@dataclass
class _State:
    opened_at: float | None = None
    total_calls: int = 0
    total_failures: int = 0
    failure_timestamps: list[float] = field(default_factory=list)


class CircuitBreaker:
    """
    Threshold-based circuit breaker.

    - Closed (normal): all calls allowed.
    - Open (tripped): after `threshold` failures within `window_seconds`,
      all calls rejected for `cooldown_seconds`.
    - Half-open: after cooldown, one call allowed. If it succeeds,
      breaker closes. If it fails, breaker reopens.
    """

    def __init__(
        self,
        name: str,
        threshold: int = 5,
        window_seconds: float = 10.0,
        cooldown_seconds: float = 60.0,
    ) -> None:
        if threshold < 1:
            raise ValueError("threshold must be >= 1")
        if window_seconds <= 0:
            raise ValueError("window_seconds must be > 0")
        if cooldown_seconds <= 0:
            raise ValueError("cooldown_seconds must be > 0")

        self.name = name
        self.threshold = threshold
        self.window_seconds = window_seconds
        self.cooldown_seconds = cooldown_seconds
        self._state = _State()
        self._lock = Lock()

    def is_open(self) -> bool:
        with self._lock:
            if self._state.opened_at is None:
                return False
            elapsed = time.time() - self._state.opened_at
            if elapsed >= self.cooldown_seconds:
                # Cooldown elapsed -> half-open (allow one attempt).
                self._state.opened_at = None
                self._state.failure_timestamps = []
                return False
            return True

    def record_success(self) -> None:
        with self._lock:
            self._state.total_calls += 1
            self._state.failure_timestamps = []
            self._state.opened_at = None

    def record_failure(self) -> None:
        with self._lock:
            now = time.time()
            self._state.total_calls += 1
            self._state.total_failures += 1
            self._state.failure_timestamps.append(now)
            # Keep only failures inside the window.
            self._state.failure_timestamps = [
                t for t in self._state.failure_timestamps
                if now - t <= self.window_seconds
            ]
            if len(self._state.failure_timestamps) >= self.threshold:
                self._state.opened_at = now

    def snapshot(self) -> dict:
        with self._lock:
            total = self._state.total_calls
            failures = self._state.total_failures
            return {
                "name": self.name,
                "open": self._state.opened_at is not None,
                "total_calls": total,
                "total_failures": failures,
                "failure_rate": (failures / total) if total > 0 else 0.0,
                "threshold": self.threshold,
                "window_seconds": self.window_seconds,
                "cooldown_seconds": self.cooldown_seconds,
            }

    def reset(self) -> None:
        with self._lock:
            self._state = _State()
