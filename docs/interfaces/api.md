# Interface: API & Gateway

## Endpoints

### 1. `POST /v1/pathway/request`
Initiates end-to-end pathway generation.

**Request:**
```json
{
  "student_id": "student-001",
  "target_programme": "BTech-CSE",
  "institution": "IIT-Bombay"
}
```

**Response (`PathwayResponse`):**
```json
{
  "recognition": {
    "direct": 1,
    "bridge": 2,
    "missing": 0,
    "review": 0,
    "policy_conflict": 0
  },
  "gaps": [...],
  "pathways": [...],
  "trace_id": "otel-trace-uuid",
  "decision_id": "decision-uuid",
  "audit_event_ids": ["audit-uuid"],
  "bundle": { ... }
}
```

### 2. `GET /v1/audit/{decision_id}`
Retrieves tamper-evident cryptographic audit records for a decision.

### 3. `GET /health`
Liveness and readiness check.
