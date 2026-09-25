# services/db/pool.py
"""
Thin asyncpg pool wrapper.

Every existing service (Ledger, Outbox, DecisionBundleProvider) already
expects a `db` object shaped like the DBConnectionPool protocol in
services/audit/ledger.py: acquire() / fetch() / fetchrow() / execute().
asyncpg.Pool already satisfies acquire(); this wrapper adds the three
convenience methods so a bare pool can be passed around directly.

If DATABASE_URL is unset or unreachable, `create_pool()` returns None
and every caller (Ledger, Outbox, bundle_provider, our new routes)
falls back to its existing in-memory mode. This mirrors the resilience
pattern already used throughout services/ — the app must still boot
and demo the pipeline with zero infra configured.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

import asyncpg

log = logging.getLogger(__name__)


async def _init_connection(conn: asyncpg.Connection) -> None:
    """asyncpg does not decode json/jsonb by default — every JSONB column
    comes back as a raw string otherwise. Without this, every route that
    returns a JSONB column (gaps.missing_outcomes, gov_policy_overrides.policy_value,
    audit_ledger.evidence, ...) would hand the frontend a double-encoded
    string instead of the object it expects."""
    await conn.set_type_codec(
        "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
    )
    await conn.set_type_codec(
        "json", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
    )


class Pool:
    """Wraps asyncpg.Pool with the fetch/fetchrow/execute helpers used app-wide."""

    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    def acquire(self):
        return self._pool.acquire()

    async def fetch(self, query: str, *args) -> list[dict]:
        rows = await self._pool.fetch(query, *args)
        return [dict(r) for r in rows]

    async def fetchrow(self, query: str, *args) -> Optional[dict]:
        row = await self._pool.fetchrow(query, *args)
        return dict(row) if row is not None else None

    async def execute(self, query: str, *args) -> str:
        return await self._pool.execute(query, *args)

    async def fetchval(self, query: str, *args, column: int = 0) -> Any:
        return await self._pool.fetchval(query, *args, column=column)

    async def close(self) -> None:
        await self._pool.close()


async def create_pool(database_url: Optional[str] = None) -> Optional[Pool]:
    """
    Connect to Postgres using DATABASE_URL (asyncpg-style, e.g.
    postgresql://user:pass@host:5432/db — the +asyncpg suffix used in
    the SQLAlchemy-style URL in .env.example is stripped automatically).

    Returns None (never raises) if the URL is missing or the DB is
    unreachable, so the caller can fall back to in-memory mode.
    """
    url = database_url or os.environ.get("DATABASE_URL")
    if not url:
        log.warning("DATABASE_URL not set — running in in-memory mode (no persistence)")
        return None

    # asyncpg doesn't understand the SQLAlchemy "+asyncpg" driver marker.
    asyncpg_url = url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        raw_pool = await asyncpg.create_pool(asyncpg_url, min_size=1, max_size=10, init=_init_connection)
    except Exception as e:
        log.error("could not connect to DATABASE_URL (%s) — falling back to in-memory mode", e)
        return None

    log.info("connected to Postgres")
    return Pool(raw_pool)
