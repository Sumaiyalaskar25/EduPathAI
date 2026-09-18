# API Integration Guide — Every Page, Every Endpoint

This is the definitive reference for wiring the frontend to the backend.
Every route, its data needs, and every CTA button.

---

## Route Index

| Route | Role | Purpose | Endpoint(s) |
|---|---|---|---|
| / | public | Login / identity | (auth — TBD) |
| /student | student | Dashboard | POST /v1/pathway/request |
| /student/tree | student | Tree infographic | POST /v1/pathway/request |
| /student/pathways | student | Pathway solver | POST /v1/pathway/request |
| /student/pathways/submit | student | Submit confirmation | POST /v1/pathway/submit |
| /student/gaps | student | Gap analysis | POST /v1/pathway/request |
| /student/audit | student | Ledger list | GET /v1/audit/list |
| /student/audit/[decisionId] | student | Replay | GET /v1/audit/{id} |
| /student/profile | student | Identity + consent | GET /v1/student/{id} |
| /student/bridges/[id] | student | Bridge detail | GET /v1/bridges/{id} |
| /student/courses/[id] | student | Course detail | GET /v1/courses/{id} |
| /student/plan/update | student | Confirmation | (POST /v1/plan/update) |
| /hei | hei | Review queue | GET /v1/hei/{id}/queue |
| /hei/approved | hei | Decision history | GET /v1/hei/{id}/approved |
| /hei/institutions | hei | Directory | GET /v1/hei/institutions |
| /gov | gov | Overview | GET /v1/gov/aggregate |
| /gov/mobility | gov | Mobility deep dive | GET /v1/gov/mobility |
| /gov/policy | gov | Policy signals | GET /v1/gov/policy |

---

## Request Flow (Student)

1. POST /v1/pathway/request with {student_id, target_programme, institution}
2. Response: PathwayResponse containing recognition, gaps, pathways, matches, bridges, trace_id, decision_id, audit_event_ids, bundle
3. Frontend caches under queryKey: ["pathway", studentId, programme, institution]
4. Every student page reads from this cache

---

## Auth Flow

Login page: /
User picks identity mode → enters APAAR → checks consent → clicks Verify
→ router.push(IDENTITY_ROUTES[mode])
   learner  → /student
   bos      → /hei
   ministry → /gov

Real auth: replace setTimeout in components/auth/DigiLockerAccess.tsx

---

## CTA Wiring Table

| Button | Page | Action |
|---|---|---|
| Verify & Fetch | / | POST /v1/auth/verify → route by mode |
| Review pathway | /student | → /student/pathways |
| View gaps | /student | → /student/gaps |
| Proceed & Update Academic Plan | /student, /student/tree | → /student/plan/update |
| Lock and Submit Pathway | /student/pathways | → /student/pathways/submit |
| Enroll via NPTEL/SWAYAM/V-Lab | /student/bridges/[id] | Opens external URL |
| Add to Academic Plan | /student/gaps, /student/bridges/[id] | POST /v1/plan/add |
| View related gaps | /student/courses/[id] | → /student/gaps |
| Export Cryptographic Proof (PDF) | /student/audit/[id] | GET /v1/audit/{id}/pdf |
| Replay exact decision state | /student/audit/[id] | GET /v1/audit/{id}/replay |
| Contest this decision | /student/audit/[id] | POST /v1/audit/{id}/contest |
| Download my data (DPDP) | /student/profile | GET /v1/student/{id}/export |
| Approve | /hei | POST /v1/hei/decision/{id}/approve |
| Reject | /hei | POST /v1/hei/decision/{id}/reject |
| View details | /hei/approved | → /student/audit/{decisionId} |
| Enroll in all bridges | /student/tree | POST /v1/plan/enroll-all |
| Export flow data | /gov/mobility | GET /v1/gov/mobility/export |
| Export policy bundle | /gov/policy | GET /v1/gov/policy/export |
| Export PDF (per brief) | /gov/policy | GET /v1/gov/briefs/{id}/pdf |

---

## Endpoint Reference

### POST /v1/pathway/request
Request: { student_id, target_programme, institution }
Response: PathwayResponse

### GET /v1/audit/list
Response: AuditRecord[] (summaries)

### GET /v1/audit/{decisionId}
Response: AuditRecord

### GET /v1/student/{id}
Response: { identity, consents, decisions, security }

### GET /v1/bridges/{id}
Response: BridgeDetail

### GET /v1/courses/{id}
Response: CourseDetail

### GET /v1/hei/{id}/queue
Response: HeiReviewItem[]

### GET /v1/hei/{id}/approved
Response: HeiApprovedRecord[]

### GET /v1/hei/institutions
Response: HeiInstitution[]

### GET /v1/gov/aggregate
Response: { stats, flows, friction, trend, regions, signals, latency }

### GET /v1/gov/mobility
Response: { sankeyNodes, sankeyLinks, cohorts, regional }

### GET /v1/gov/policy
Response: { pillars, briefs, stats }

---

## Error Handling

Every page assumes:
- 200 → render data
- 4xx → show error state with retry
- 5xx → fall back to REVIEW banner

React Query default in components/providers/QueryProvider.tsx:
  staleTime: 60_000
  retry: 1
  refetchOnWindowFocus: false

---

## Request/Response Examples

POST /v1/pathway/request
Request:
{
  "student_id": "student-001",
  "target_programme": "BTech-CSE",
  "institution": "IIT-Bombay"
}

Response (abbreviated):
{
  "recognition": { "direct": 48, "bridge": 14, "missing": 6, "review": 2, "policy_conflict": 0 },
  "gaps": [...],
  "pathways": [...],
  "matches": [...],
  "bridges": [...],
  "trace_id": "pathway-request-9f83b165",
  "decision_id": "dec-9f83b165-a1",
  "audit_event_ids": ["al-9f83b165", "al-9f83b166"],
  "bundle": {...}
}

---

## Rules

1. All API types live in lib/api/types.ts. Never define API types in components.
2. All network calls live in lib/api/client.ts. Never fetch() directly in components.
3. Use TanStack Query (useQuery / useMutation) in pages — not raw useEffect.
4. Show skeletons while loading (components/feedback/Skeleton.tsx).
5. Show error state on failure — never silently ignore.