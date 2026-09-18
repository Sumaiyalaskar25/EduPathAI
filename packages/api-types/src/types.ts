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

export type BridgeMode = "LEARNING_ONLY" | "FORMAL_BRIDGE";

export type PathwayMode = "FASTEST" | "BALANCED" | "MAX_PRESERVATION";

export type SolverStatus = "OPTIMAL" | "FEASIBLE_NOT_OPTIMAL" | "HEURISTIC";

export type UUID = string;

export interface DecisionBundle {
  id: UUID;
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

export interface Gap {
  gap_id: UUID;
  gap_type: GapType;
  description: string;
  missing_outcomes: string[];
}

export interface Bridge {
  bridge_id: UUID;
  gap_id: UUID;
  resource_id: string;
  resource_provider: string;
  resource_url: string;
  competency_coverage: number;
  duration_hours: number;
  assessment_available: boolean;
  recognition_status: BridgeMode;
  prerequisite_met: boolean;
}

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

export interface SolveRequest {
  student_id: string;
  target_programme: string;
  bundle: DecisionBundle;
  matches: MatchResult[];
  gaps: Gap[];
  bridges: Bridge[];
}

export interface SolveResponse {
  pathways: Pathway[];
  solver_status: SolverStatus;
  solve_time_ms: number;
}

export interface AuditRecord {
  id: UUID;
  recommendation_id: UUID;
  decision_id: UUID;
  previous_hash: string;
  current_hash: string;
  chain_id: string;
  bundle_id: UUID;
  input_hash: string;
  output_hash: string;
  confidence: number;
  evidence: EvidenceRef[];
  ai_recommendation: string;
  human_decision: string | null;
  trace_id: string;
  timestamp: string;
}

export interface RecognitionSummary {
  direct: number;
  bridge: number;
  missing: number;
  review: number;
  policy_conflict: number;
}

export interface PathwayResponse {
  recognition: RecognitionSummary;
  gaps: Gap[];
  pathways: Pathway[];
  trace_id: string;
  decision_id: UUID;
  audit_event_ids: UUID[];
  bundle: DecisionBundle;
  matches?: MatchResult[];
  bridges?: Bridge[];
}

export interface PathwayRequest {
  student_id: string;
  target_programme: string;
  institution: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}