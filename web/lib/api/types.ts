/**
 * web/lib/api/types.ts
 * ────────────────────────────────────────────────────────────────
 * Mirror of services/schemas.py — frozen at Hour 0.
 *
 * EVERY frontend page, component, and query imports from THIS file.
 * Never invent types elsewhere. Never duplicate. If the backend
 * changes a field, change it HERE only.
 *
 * See Member 3 PDF Section 1.2 for the frozen contract.
 * ────────────────────────────────────────────────────────────────
 */

/* ─────────── Enums ─────────── */

export type RecognitionStatus =
  | "DIRECT"
  | "BRIDGE"
  | "MISSING"
  | "REVIEW"
  | "POLICY_CONFLICT";

export type GapType =
  | "KNOWLEDGE"
  | "PREREQUISITE"
  | "ASSESSMENT"
  | "ADMINISTRATIVE";

export type PathwayMode = "FASTEST" | "BALANCED" | "MAX_PRESERVATION";

export type SolverStatus =
  | "OPTIMAL"
  | "FEASIBLE_NOT_OPTIMAL"
  | "HEURISTIC";

export type BridgeMode = "LEARNING_ONLY" | "FORMAL_BRIDGE";

/* ─────────── Matching ─────────── */

export interface EvidenceRef {
  source_doc_id: string;
  source_page: string;
  target_doc_id: string;
  target_page: string;
  similarity: number;
}

export interface MatchResult {
  source_course_id: string;
  target_course_id: string;
  semantic_score: number;
  outcome_coverage: number;
  prerequisite_status: boolean;
  assessment_match: number;
  credit_compatibility: boolean;
  domain_alignment: boolean;
  policy_eligibility: boolean;
  evidence_quality: number;
  evidence: EvidenceRef[];
  missing_outcomes: string[];
}

/* ─────────── Gaps & Bridges ─────────── */

export interface Gap {
  gap_id: string;
  gap_type: GapType;
  description: string;
  missing_outcomes: string[];
}

export interface Bridge {
  bridge_id: string;
  gap_id: string;
  resource_id: string;
  resource_provider: string;
  resource_url: string;
  competency_coverage: number;
  duration_hours: number;
  assessment_available: boolean;
  recognition_status: BridgeMode;
  prerequisite_met: boolean;
}

/* ─────────── Pathways ─────────── */

export interface TermPlan {
  term_number: number;
  courses: string[];
  bridges: string[];
}

export interface Pathway {
  mode: PathwayMode;
  terms: number;
  bridge_burden: number;
  terms_plan: TermPlan[];
}

/* ─────────── Decision Bundle (audit snapshot) ─────────── */

export interface DecisionBundle {
  id: string;
  curriculum_version: string;
  policy_version: string;
  model_version: string;
  prompt_version: string;
  embedding_model_version: string;
  cross_encoder_version: string;
  retrieval_threshold: number;
  solver_version: string;
  solver_parameters_hash: string;
  resource_catalog_version: string;
  ontology_version: string;
  ruleset_commit: string;
  tool_definitions_hash: string;
  captured_at: string;
}

/* ─────────── Recognition summary ─────────── */

export interface RecognitionSummary {
  direct: number;
  bridge: number;
  missing: number;
  review: number;
  policy_conflict: number;
}

/* ─────────── Main pathway response ─────────── */

export interface PathwayResponse {
  recognition: RecognitionSummary;
  gaps: Gap[];
  pathways: Pathway[];
  trace_id: string;
  decision_id: string;
  audit_event_ids: string[];
  bundle: DecisionBundle;
  /* Extended by Member 1 for UI: matches + bridges */
  matches?: MatchResult[];
  bridges?: Bridge[];
}

/* ─────────── Audit record (for /student/audit/[decisionId]) ─────────── */

export interface AuditRecord {
  id: string;
  chain_id: string;
  decision_id: string;
  previous_hash: string;
  current_hash: string;
  bundle_id: string;
  input_hash: string;
  output_hash: string;
  confidence: number;
  ai_recommendation: string;
  human_decision: string | null;
  trace_id: string;
  evidence: EvidenceRef[];
  timestamp: string;
  /* Optional UI extras */
  auditor_name?: string;
  auditor_role?: string;
}

/* ─────────── Request payloads ─────────── */

export interface PathwayRequest {
  student_id: string;
  target_programme: string;
  institution: string;
}

/* ─────────── Shared helpers for the UI ─────────── */

export interface RecognitionTone {
  tone: "direct" | "bridge" | "missing" | "review" | "conflict";
  label: string;
}

export const STATUS_TONE_MAP: Record<RecognitionStatus, RecognitionTone> = {
  DIRECT: { tone: "direct", label: "Direct" },
  BRIDGE: { tone: "bridge", label: "Bridge" },
  MISSING: { tone: "missing", label: "Missing" },
  REVIEW: { tone: "review", label: "Review" },
  POLICY_CONFLICT: { tone: "conflict", label: "Policy Conflict" },
};

/* ─────────── Auth ─────────── */

export type IdentityMode = "learner" | "bos" | "ministry";

export interface VerifyRequest {
  mode: IdentityMode;
  identifier: string;
  consent: boolean;
}

export interface VerifyResponse {
  token: string;
  role: IdentityMode;
  external_ref: string;
  display_name: string;
  institution: string | null;
  programme: string | null;
  target_institution: string | null;
  target_programme: string | null;
}

/* ─────────── Student profile ─────────── */

export interface ConsentEntry {
  id: string;
  scope: string;
  purpose: string;
  granted_at: string;
  expires_at: string | null;
  active: boolean;
}

export interface DecisionHistoryItem {
  decision_id: string;
  summary: string;
  status: string;
  decided_at: string;
  auditor: string;
}

export interface StudentProfile {
  identity: {
    full_name: string;
    apaar: string;
    abc_id: string;
    programme: string;
    institution: string;
    target_institution: string;
    enrolled_on: string;
    digilocker_linked: boolean;
    biometric_verified: boolean;
  };
  consents: ConsentEntry[];
  decisions: DecisionHistoryItem[];
  security: {
    chain_integrity: string;
    raw_docs_archived: number;
  };
}

/* ─────────── Course / Bridge detail ─────────── */

export interface CourseDetail {
  code: string;
  name: string;
  credits: number;
  modality: string;
  description: string;
  competencies: string[];
  recognitionStatus: RecognitionStatus | null;
  mappedFrom: { source_course: string; similarity: number } | null;
}

export interface BridgeDetail {
  id: string;
  gap_id: string;
  resource_id: string;
  resource_provider: string;
  resource_url: string;
  competency_coverage: number;
  duration_hours: number;
  assessment_available: boolean;
  recognition_status: BridgeMode;
  prerequisite_met: boolean;
  enrolled: boolean;
  gap: { gap_type: GapType; description: string; missing_outcomes: string[] } | null;
}

/* ─────────── HEI (Board of Studies) ─────────── */

export type HeiDecisionStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | "CONTESTED";

export interface HeiReviewItem {
  id: string;
  decisionId: string;
  studentName: string;
  studentProgramme: string;
  sourceInstitution: string;
  targetInstitution: string;
  courses: string;
  aiRecommendation: "DIRECT" | "BRIDGE" | "MISSING" | "REVIEW";
  confidence: number;
  bridgeRequired: boolean;
  submittedAt: string;
  age: string;
  priority: "high" | "normal" | "low";
  status: HeiDecisionStatus;
}

export interface HeiQueueResponse {
  items: HeiReviewItem[];
  stats: { pending: number; approvedToday: number; rejectedToday: number; avgReviewTime: string };
}

export interface HeiApprovedRecord {
  id: string;
  decisionId: string;
  studentName: string;
  studentProgramme: string;
  sourceInstitution: string;
  targetInstitution: string;
  courses: string;
  outcome: "APPROVED" | "REJECTED" | "CONTESTED";
  bridgeRequired: boolean;
  decidedAt: string;
  reviewer: string;
  reviewDuration: string;
}

export interface HeiApprovedResponse {
  items: HeiApprovedRecord[];
  stats: {
    approvedThisWeek: number;
    rejectedThisWeek: number;
    escalatedThisWeek: number;
    avgReviewDuration: string;
    approvalRate: number;
  };
}

export interface HeiInstitution {
  id: string;
  name: string;
  short_name: string;
  shortName: string;
  city: string;
  state: string;
  type: string;
  naac: string;
  status: "active" | "pending" | "paused";
  joined_at: string;
  studentsActive: number;
  decisionsThisMonth: number;
  recognitionRate: number;
  avgReviewTime: string;
}

export interface HeiInstitutionsResponse {
  items: HeiInstitution[];
  stats: {
    total: number;
    active: number;
    pending: number;
    paused: number;
    totalStudents: number;
    totalDecisionsThisMonth: number;
  };
}

/* ─────────── Gov (Ministry) ─────────── */

export interface MobilityFlow {
  source: string;
  target: string;
  students: number;
  recognition: number;
}

export interface FrictionCourse {
  course: string;
  bridgeRate: number;
  missingRate: number;
  decisions: number;
}

export interface TrendPoint {
  month: string;
  decisions: number;
  recognition: number;
}

export interface RegionSignal {
  state: string;
  students: number;
  heis: number;
  recognition: number;
}

export interface PolicySignal {
  id: string;
  severity: "critical" | "attention" | "informational";
  title: string;
  description: string;
  affectedInstitutions: number;
}

export interface GovAggregate {
  stats: {
    totalStudents: number;
    heisIntegrated: number;
    totalDecisions: number;
    recognitionRate: number;
  };
  mobilityFlows: MobilityFlow[];
  frictionCourses: FrictionCourse[];
  trend: TrendPoint[];
  regionSignals: RegionSignal[];
  policySignals: PolicySignal[];
}

export interface SankeyNode {
  id: string;
  label: string;
  type: "source" | "target";
  students: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  students: number;
  recognition: number;
}

export interface GovMobility {
  nodes: SankeyNode[];
  links: SankeyLink[];
  monthlyTrend: TrendPoint[];
}

export interface PolicyOverride {
  id: string;
  institution: string;
  programme: string;
  policy_key: string;
  policy_value: Record<string, unknown>;
  updated_by: string;
  updated_at: string;
}

export interface GovPolicyResponse {
  overrides: PolicyOverride[];
}