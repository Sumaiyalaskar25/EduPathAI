# Backend Schemas Reference

Python twin of web/lib/api/types.ts.

## Environment

Backend .env:
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/edupathai
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your_key
DEEPSEEK_API_KEY=your_key
KIMI_API_KEY=your_key
S3_BUCKET=edupathai-raw-docs
AWS_REGION=ap-south-1
KMS_KEY_ID=your_key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

Frontend web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000

## CORS

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="EduPathAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

## Endpoints

POST /v1/pathway/request         -> PathwayResponse
GET  /v1/audit/list              -> AuditRecord[]
GET  /v1/audit/{id}              -> AuditRecord
GET  /v1/student/{id}            -> StudentProfile
GET  /v1/bridges/{id}            -> BridgeDetail
GET  /v1/courses/{id}            -> CourseDetail
GET  /v1/hei/{id}/queue          -> HeiReviewItem[]
GET  /v1/hei/{id}/approved       -> HeiApprovedRecord[]
GET  /v1/hei/institutions        -> HeiInstitution[]
POST /v1/hei/decision/{id}/approve -> HeiReviewItem
POST /v1/hei/decision/{id}/reject  -> HeiReviewItem
GET  /v1/gov/aggregate           -> GovAggregate
GET  /v1/gov/mobility            -> GovMobility
GET  /v1/gov/policy              -> GovPolicy
GET  /v1/health                  -> {"status": "ok"}

## Pydantic Models (copy into services/schemas.py)

from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RecognitionStatus(str, Enum):
    DIRECT = "DIRECT"
    BRIDGE = "BRIDGE"
    MISSING = "MISSING"
    REVIEW = "REVIEW"
    POLICY_CONFLICT = "POLICY_CONFLICT"


class GapType(str, Enum):
    KNOWLEDGE = "KNOWLEDGE"
    PREREQUISITE = "PREREQUISITE"
    ASSESSMENT = "ASSESSMENT"
    ADMINISTRATIVE = "ADMINISTRATIVE"


class PathwayMode(str, Enum):
    FASTEST = "FASTEST"
    BALANCED = "BALANCED"
    MAX_PRESERVATION = "MAX_PRESERVATION"


class BridgeMode(str, Enum):
    LEARNING_ONLY = "LEARNING_ONLY"
    FORMAL_BRIDGE = "FORMAL_BRIDGE"


class EvidenceRef(BaseModel):
    source_doc_id: str
    source_page: str
    target_doc_id: str
    target_page: str
    similarity: float


class MatchResult(BaseModel):
    source_course_id: str
    target_course_id: str
    semantic_score: float
    outcome_coverage: float
    prerequisite_status: bool
    assessment_match: float
    credit_compatibility: bool
    domain_alignment: bool
    policy_eligibility: bool
    evidence_quality: float
    evidence: list[EvidenceRef]
    missing_outcomes: list[str]


class Gap(BaseModel):
    gap_id: str
    gap_type: GapType
    description: str
    missing_outcomes: list[str]


class Bridge(BaseModel):
    bridge_id: str
    gap_id: str
    resource_id: str
    resource_provider: str
    resource_url: str
    competency_coverage: float
    duration_hours: int
    assessment_available: bool
    recognition_status: BridgeMode
    prerequisite_met: bool


class TermPlan(BaseModel):
    term_number: int
    courses: list[str]
    bridges: list[str]


class Pathway(BaseModel):
    mode: PathwayMode
    terms: int
    bridge_burden: float
    terms_plan: list[TermPlan]


class DecisionBundle(BaseModel):
    id: str
    curriculum_version: str
    policy_version: str
    model_version: str
    prompt_version: str
    embedding_model_version: str
    cross_encoder_version: str
    retrieval_threshold: float
    solver_version: str
    solver_parameters_hash: str
    resource_catalog_version: str
    ontology_version: str
    ruleset_commit: str
    tool_definitions_hash: str
    captured_at: datetime


class RecognitionSummary(BaseModel):
    direct: int
    bridge: int
    missing: int
    review: int
    policy_conflict: int


class PathwayRequest(BaseModel):
    student_id: str
    target_programme: str
    institution: str


class PathwayResponse(BaseModel):
    recognition: RecognitionSummary
    gaps: list[Gap]
    pathways: list[Pathway]
    trace_id: str
    decision_id: str
    audit_event_ids: list[str]
    bundle: DecisionBundle
    matches: Optional[list[MatchResult]] = None
    bridges: Optional[list[Bridge]] = None


class AuditRecord(BaseModel):
    id: str
    chain_id: str
    decision_id: str
    previous_hash: str
    current_hash: str
    bundle_id: str
    input_hash: str
    output_hash: str
    confidence: float
    ai_recommendation: str
    human_decision: Optional[str] = None
    trace_id: str
    evidence: list[EvidenceRef]
    timestamp: datetime
    auditor_name: Optional[str] = None
    auditor_role: Optional[str] = None

## Rules

1. Never rename fields.
2. Enums UPPERCASE: "DIRECT" not "direct".
3. Never return null for arrays. Return [].
4. trace_id and decision_id required on PathwayResponse + AuditRecord.
5. previous_hash and current_hash required on AuditRecord.
6. Timestamps: UTC ISO 8601 with Z suffix.
7. Hashes: lowercase hex, 64 chars. First record uses "GENESIS".
8. MatchResult field name is `domain_alignment` (not `domain_align`).

## Sample Response

{
  "recognition": {"direct": 48, "bridge": 14, "missing": 6, "review": 2, "policy_conflict": 0},
  "gaps": [{"gap_id": "gap-001", "gap_type": "KNOWLEDGE", "description": "Missing Network Flow", "missing_outcomes": ["Max-flow min-cut"]}],
  "pathways": [{"mode": "BALANCED", "terms": 4, "bridge_burden": 0.18, "terms_plan": [{"term_number": 5, "courses": ["CS-401"], "bridges": []}]}],
  "matches": [{"source_course_id": "CAL-DS-101", "target_course_id": "IIT-ADS-500", "semantic_score": 0.94, "outcome_coverage": 0.91, "prerequisite_status": true, "assessment_match": 0.90, "credit_compatibility": true, "domain_alignment": true, "policy_eligibility": true, "evidence_quality": 0.88, "evidence": [], "missing_outcomes": []}],
  "bridges": [{"bridge_id": "br-001", "gap_id": "gap-001", "resource_id": "nptel-algo-3-4", "resource_provider": "NPTEL", "resource_url": "https://nptel.ac.in/courses/106106145", "competency_coverage": 1.0, "duration_hours": 18, "assessment_available": true, "recognition_status": "FORMAL_BRIDGE", "prerequisite_met": true}],
  "trace_id": "pathway-request-9f83b165",
  "decision_id": "dec-9f83b165-a1",
  "audit_event_ids": ["al-9f83b165"],
  "bundle": {"id": "bundle-1aa775e2", "curriculum_version": "IIT-Bombay/BTech-CSE/v2026.1", "policy_version": "NEP2020-BoS/policy-v4.2", "model_version": "gemini-2.0-flash", "prompt_version": "extract-outcomes-v4.2", "embedding_model_version": "all-MiniLM-L6-v2", "cross_encoder_version": "ms-marco-MiniLM-L-6-v2", "retrieval_threshold": 0.72, "solver_version": "or-tools-cbc-v9.10", "solver_parameters_hash": "7f83b165", "resource_catalog_version": "nptel-swayam-vlab-2026-08", "ontology_version": "academic-taxonomy-v3.1", "ruleset_commit": "a7b3c6e9", "tool_definitions_hash": "8f2d5a8b", "captured_at": "2026-09-11T10:13:42Z"}
}

## Source of Truth

web/lib/api/types.ts wins if there's any conflict.