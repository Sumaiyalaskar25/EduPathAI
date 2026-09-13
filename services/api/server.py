# services/api/server.py
"""FastAPI server for EduPathAI."""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from uuid import UUID

from services.api.orchestrator import Orchestrator
from services.matching.stub import StubMatcher
from services.solver.stub import StubSolver
from services.bridge.resource_registry import ResourceRegistry
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.policy.loader import PolicyLoader

app = FastAPI(title="EduPathAI", version="1.0")

# Instantiate components
bundle_provider = DecisionBundleProvider()
matcher = StubMatcher()
solver = StubSolver()
ledger = Ledger()
outbox = Outbox()
resources = ResourceRegistry()
policy_loader = PolicyLoader()

orchestrator = Orchestrator(
    bundle_provider=bundle_provider,
    matcher=matcher,
    solver=solver,
    ledger=ledger,
    outbox=outbox,
    resources=resources,
    policy_loader=policy_loader,
)


class PathwayRequest(BaseModel):
    student_id: str
    target_programme: str
    institution: str


@app.post("/v1/pathway/request")
async def pathway_request(req: PathwayRequest):
    try:
        resp = await orchestrator.run(req.student_id, req.target_programme, req.institution)
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/audit/{decision_id}")
async def audit_get(decision_id: UUID):
    rec = await ledger.get_by_decision_id(decision_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Audit record not found")
    return rec


@app.get("/health")
async def health():
    return {"status": "ok", "service": "EduPathAI"}
