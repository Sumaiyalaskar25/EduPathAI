# services/outbox/outbox.py
"""
Transactional outbox pattern with at-least-once semantics
and consumer idempotency tracking.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID, uuid4


class Outbox:
    def __init__(self, db: Any = None):
        self.db = db
        self._mem_events: list[dict] = []
        self._consumed: set[tuple[str, str]] = set()

    async def publish(self, topic: str, event_key: str, payload: dict) -> UUID:
        event_id = uuid4()
        if self.db is None:
            self._mem_events.append({
                "id": event_id,
                "topic": topic,
                "event_key": event_key,
                "payload": payload,
                "created_at": datetime.now(timezone.utc),
                "published_at": datetime.now(timezone.utc),
            })
            return event_id

        await self.db.execute(
            """
            INSERT INTO outbox (id, topic, event_key, payload, created_at, published_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (topic, event_key) DO NOTHING
            """,
            event_id, topic, event_key, json.dumps(payload),
        )
        return event_id

    async def mark_consumed(self, consumer: str, event_key: str) -> bool:
        """Returns True if first time processed (idempotent guard)."""
        if self.db is None:
            pair = (consumer, event_key)
            if pair in self._consumed:
                return False
            self._consumed.add(pair)
            return True

        res = await self.db.execute(
            """
            INSERT INTO consumer_idempotency (consumer, event_key, processed_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (consumer, event_key) DO NOTHING
            """,
            consumer, event_key,
        )
        # Check if row was inserted
        return "INSERT 0 1" in res
