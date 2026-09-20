# services/api/server.py
"""
FastAPI server for EduPathAI.

Was three endpoints (pathway/request, audit/{id}, health) with no CORS
and a hardcoded StubSolver. Now mounts the full router surface the
frontend's docs/API_INTEGRATION.md already specified, wires the real
MILP solver (services/solver/with_fallback.py), and builds all shared
state once at startup via services/api/deps.py.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.api import deps
from services.api.routes import audit, auth, bridges, courses, gov, hei, pathway, students

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.app_state = await deps.build_state()
    log.info(
        "EduPathAI API ready — db=%s matcher=%s ai_providers=%s",
        "connected" if app.state.app_state.db else "in-memory",
        app.state.app_state.matcher_name,
        app.state.app_state.ai_providers or ["local-only"],
    )
    yield
    if app.state.app_state.db is not None:
        await app.state.app_state.db.close()


app = FastAPI(title="EduPathAI", version="1.0", lifespan=lifespan)

import os

_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pathway.router)
app.include_router(audit.router)
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(bridges.router)
app.include_router(hei.router)
app.include_router(gov.router)


@app.get("/health")
@app.get("/v1/health")
async def health():
    state = app.state.app_state
    return {
        "status": "ok",
        "service": "EduPathAI",
        "db": "connected" if state.db else "in-memory",
        "matcher": state.matcher_name,
        "ai_providers": state.ai_providers or ["local-only"],
    }
