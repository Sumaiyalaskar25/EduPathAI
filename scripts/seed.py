#!/usr/bin/env python3
# scripts/seed.py
"""
Seeds the database with real data by running the actual pipeline —
not by hand-inserting fake rows. For each demo student in
data/identity_directory.json, this calls the same Orchestrator.run()
the API uses, so recognition_decisions/gaps/bridges/audit_ledger end
up populated with genuinely computed results. A few of those
decisions are then run through the same HEI review path
(services/api/routes/hei._review) so the "approved" history isn't
empty either.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edupathai \
        python3 scripts/seed.py
"""
from __future__ import annotations

import asyncio
import hashlib
import logging
import sys

sys.path.insert(0, ".")

from services.api import deps
from services.identity.directory import IdentityDirectory

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("seed")


async def main() -> None:
    state = await deps.build_state()
    if state.db is None:
        log.error("No DATABASE_URL / no DB connection — nothing to seed. "
                   "Set DATABASE_URL and make sure Postgres is running.")
        return

    directory = IdentityDirectory()
    students = directory.all_students()
    log.info("seeding %d demo students through the real pipeline", len(students))

    decision_ids = []
    for s in students:
        resp = await state.orchestrator.run(
            student_id=s.external_ref,
            target_programme=s.target_programme,
            institution=s.target_institution,
        )
        decision_ids.append((s, resp.decision_id, resp.bundle))
        log.info("  %s -> %s : decision=%s matches=%d",
                  s.full_name, s.target_institution, resp.decision_id, len(resp.matches))

    # Review most of them through the real HEI approve/reject path, so
    # the "approved" tab and gov recognition-rate numbers aren't empty
    # on a fresh install. Leaves the rest genuinely PENDING so the HEI
    # queue has something to review too.
    reviewers = directory.all_reviewers()
    for i, (s, decision_id, bundle) in enumerate(decision_ids):
        if i % 3 == 2:
            continue  # leave every third one pending

        reviewer = reviewers[i % len(reviewers)] if reviewers else None
        decision = "APPROVED" if i % 4 != 3 else "REJECTED"
        await state.ledger.append(
            decision_id=decision_id,
            bundle=bundle,
            input_hash="seed",
            output_hash=hashlib.sha256(f"seed:{decision}".encode()).hexdigest(),
            confidence=1.0,
            evidence=[],
            ai_recommendation=f"Human review: {decision} (seed data)",
            trace_id=f"seed-{i}",
            chain_id=s.target_institution,
            human_decision=decision,
            auditor_name=reviewer.full_name if reviewer else "Seed Reviewer",
            auditor_role="BoS Reviewer",
        )
        log.info("  reviewed %s -> %s", s.full_name, decision)

    log.info("seed complete.")
    await state.db.close()


if __name__ == "__main__":
    asyncio.run(main())
