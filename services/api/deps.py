# services/api/deps.py
"""
Application state, built once at startup and shared across all
routers via FastAPI dependency injection (get_state).

Replaces the module-level globals in the old services/api/server.py
so routes/*.py can each import get_state instead of reaching into
server.py directly.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from fastapi import Request

from services.api.orchestrator import Orchestrator
from services.audit.ledger import Ledger
from services.bridge.resource_registry import ResourceRegistry
from services.db.pool import Pool, create_pool
from services.identity.directory import IdentityDirectory
from services.matching.ai_gateway_factory import configured_provider_names
from services.matching.course_catalog import CourseCatalog
from services.outbox.outbox import Outbox
from services.policy.loader import PolicyLoader
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.solver.milp import MILPSolver
from services.solver.with_fallback import SolverWithFallback

log = logging.getLogger(__name__)


@dataclass
class AppState:
    db: Optional[Pool]
    orchestrator: Orchestrator
    ledger: Ledger
    outbox: Outbox
    resources: ResourceRegistry
    policy_loader: PolicyLoader
    identity: IdentityDirectory
    catalog: CourseCatalog
    matcher_name: str
    ai_providers: list[str]


async def build_state() -> AppState:
    db = await create_pool()

    bundle_provider = DecisionBundleProvider(db=db)

    try:
        # Deferred import: services.matching.real pulls in sentence-transformers
        # at module scope. Importing it here (not at module top) means an
        # environment without that heavy dependency installed still boots
        # cleanly on StubMatcher instead of crashing on import.
        from services.matching.real import RealMatcher
        matcher = RealMatcher()
        matcher_name = "real"
        log.info("matcher=real")
    except Exception as e:
        log.warning("RealMatcher unavailable (%s); falling back to StubMatcher", e)
        from services.matching.stub import StubMatcher
        matcher = StubMatcher()
        matcher_name = "stub"

    solver = SolverWithFallback(primary=MILPSolver())
    ledger = Ledger(db=db)
    outbox = Outbox(db=db)
    resources = ResourceRegistry()
    policy_loader = PolicyLoader()
    identity = IdentityDirectory()
    catalog = CourseCatalog()

    orchestrator = Orchestrator(
        bundle_provider=bundle_provider,
        matcher=matcher,
        solver=solver,
        ledger=ledger,
        outbox=outbox,
        resources=resources,
        policy_loader=policy_loader,
        db=db,
    )

    ai_providers = configured_provider_names()
    log.info("ai_gateway providers=%s", ai_providers or ["local-only"])

    return AppState(
        db=db,
        orchestrator=orchestrator,
        ledger=ledger,
        outbox=outbox,
        resources=resources,
        policy_loader=policy_loader,
        identity=identity,
        catalog=catalog,
        matcher_name=matcher_name,
        ai_providers=ai_providers,
    )


def get_state(request: Request) -> AppState:
    return request.app.state.app_state
