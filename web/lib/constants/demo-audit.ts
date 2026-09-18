import type { AuditRecord, DecisionBundle } from "@/lib/api/types";

/**
 * Demo audit record — mirrors what GET /v1/audit/{id} returns.
 * When the backend is live, replace this with useQuery(() => getAudit(id)).
 */
export const DEMO_AUDIT_RECORD: AuditRecord = {
  id: "al-9f83b165",
  chain_id: "global-inst-irtb-2026",
  decision_id: "dec-9f83b165-a1",
  previous_hash:
    "3d2b9a1c7f4e8a5620b3c9e1d4f7a8b2c5e9f1d4a7b3c6e9f2d5a8b1c4e7f2a5",
  current_hash:
    "4a7b9c2d57a9e3e9a268e9532a22beb0c8f1d4a7b3c6e9f2d5a8b1c4e7f2a5b8",
  bundle_id: "bundle-1aa775e2",
  input_hash:
    "8f2d5a8b1c4e7f2a5b83d2b9a1c7f4e8a5620b3c9e1d4f7a8b2c5e9f1d4a7b3c",
  output_hash:
    "c9e1d4f7a8b2c5e9f1d4a7b3c6e9f2d5a8b1c4e7f2a5b83d2b9a1c7f4e8a562",
  confidence: 0.94,
  ai_recommendation: "BRIDGE_REQUIRED",
  human_decision: "APPROVED_WITH_BRIDGE",
  trace_id: "pathway-request-9f83b165-a1c7",
  evidence: [
    {
      source_doc_id: "CAL-DS-101",
      source_page: "p.42",
      target_doc_id: "IIT-ADS-500",
      target_page: "p.18",
      similarity: 0.94,
    },
    {
      source_doc_id: "CAL-AL-201",
      source_page: "p.31",
      target_doc_id: "IIT-AMZ-620",
      target_page: "p.24",
      similarity: 0.78,
    },
    {
      source_doc_id: "CAL-GT-601",
      source_page: "p.105",
      target_doc_id: "IIT-NFL-920",
      target_page: "p.7",
      similarity: 0.42,
    },
  ],
  timestamp: "2026-09-11T10:14:00Z",
  auditor_name: "Prof. S. Sen",
  auditor_role: "BoS Convener · IIT Bombay",
};

/**
 * Demo decision bundle — mirrors the audit_chain snapshot at decision time.
 * Every field is immutable evidence of which versions produced this decision.
 */
export const DEMO_DECISION_BUNDLE: DecisionBundle = {
  id: "bundle-1aa775e2",
  curriculum_version: "IIT-Bombay/BTech-CSE/v2026.1",
  policy_version: "NEP2020-BoS/policy-v4.2",
  model_version: "gemini-2.0-flash",
  prompt_version: "extract-outcomes-v4.2",
  embedding_model_version: "all-MiniLM-L6-v2",
  cross_encoder_version: "ms-marco-MiniLM-L-6-v2",
  retrieval_threshold: 0.72,
  solver_version: "or-tools-cbc-v9.10",
  solver_parameters_hash: "7f83b1657f3b4c2d5e8a1c6f4b9d2e8a",
  resource_catalog_version: "nptel-swayam-vlab-2026-08",
  ontology_version: "academic-taxonomy-v3.1",
  ruleset_commit: "a7b3c6e9f2d5a8b1c4e7f2a5b83d2b9a1c7f4e8",
  tool_definitions_hash: "8f2d5a8b1c4e7f2a5b83d2b9a1c7f4e8a5620b3c",
  captured_at: "2026-09-11T10:13:42Z",
};

export const DEMO_AUDIT_BUNDLE_JSON = JSON.stringify(
  {
    name: "metadata",
    version: "0.0.0",
    sha256: DEMO_AUDIT_RECORD.current_hash,
    ledgers: [
      {
        sha256: DEMO_AUDIT_RECORD.previous_hash,
        solver_parameters: {
          presentation: "5",
          times: 10,
          masking: true,
          parameter: false,
        },
      },
    ],
    immutable_s3_object_lock_pointers: {
      sha256: DEMO_AUDIT_RECORD.input_hash,
    },
  },
  null,
  2
);