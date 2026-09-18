# EduPathAI — Frontend

> **Next.js 14 · TypeScript · Tailwind · Framer Motion**
> Complete frontend for EduPathAI — India's NEP 2020 academic mobility platform.

**This README is for the backend team.** Read it first, then read [`docs/API_INTEGRATION.md`](./docs/API_INTEGRATION.md) for the full page-by-page wiring.

---

## 1. Quick Start

cd web
npm install
npm run dev

→ http://localhost:3000

Environment (.env.local):
NEXT_PUBLIC_API_URL=http://localhost:8080

Change this to point at your backend. Nothing else needs to change — every network call goes through lib/api/client.ts, which reads this variable.

---

## 2. Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5.3 (strict) |
| Styling | Tailwind CSS 3.4.7 + custom tokens |
| Animation | Framer Motion 11.3.19 |
| Server State | TanStack Query 5.51.1 |
| Icons | lucide-react |
| Charts | Recharts 2.12.7 |
| Theme | next-themes (light + dark) |
| Toasts | sonner |

---

## 3. Directory Structure

web/
├── app/                        Next.js App Router — every folder = a URL
│   ├── layout.tsx              root layout
│   ├── page.tsx                / (login page)
│   ├── loading.tsx             global loading state
│   ├── error.tsx               global error boundary
│   ├── not-found.tsx           404 page
│   ├── student/
│   │   ├── page.tsx            /student (dashboard)
│   │   ├── tree/page.tsx
│   │   ├── pathways/page.tsx
│   │   ├── pathways/submit/page.tsx
│   │   ├── gaps/page.tsx
│   │   ├── audit/page.tsx
│   │   ├── audit/[decisionId]/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── bridges/[bridgeId]/page.tsx
│   │   ├── courses/[courseId]/page.tsx
│   │   └── plan/update/page.tsx
│   ├── hei/
│   │   ├── page.tsx
│   │   ├── approved/page.tsx
│   │   └── institutions/page.tsx
│   └── gov/
│       ├── page.tsx
│       ├── mobility/page.tsx
│       └── policy/page.tsx
├── components/                 Reusable UI
│   ├── layout/                 TopBar, Sidebar, BottomStrip, MobileNav
│   ├── auth/                   login pieces
│   ├── tree/                   tree infographic + competency panel
│   ├── ledger/                 audit timeline + code panel
│   ├── gaps/                   outcome table + radar + bridge cards
│   ├── pathways/               semester columns + course tiles
│   ├── profile/                identity + consent cards
│   ├── hei/                    review queue
│   ├── gov/                    mobility dashboard
│   ├── feedback/               skeletons, confirmations
│   └── providers/              QueryProvider
├── lib/
│   ├── api/
│   │   ├── types.ts            FROZEN API CONTRACT (mirrors schemas.py)
│   │   └── client.ts           fetch helpers
│   ├── constants/demo-*.ts     DEMO DATA
│   └── utils/cn.ts
├── hooks/
├── styles/tokens.css
├── styles/globals.css
└── docs/API_INTEGRATION.md

---

## 4. The API Contract

All API types are in lib/api/types.ts. This file mirrors services/schemas.py exactly.

Key types:

PathwayResponse {
  recognition: RecognitionSummary;
  gaps: Gap[];
  pathways: Pathway[];
  matches?: MatchResult[];
  bridges?: Bridge[];
  trace_id: string;
  decision_id: string;
  audit_event_ids: string[];
  bundle: DecisionBundle;
}

AuditRecord {
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
  auditor_name?: string;
  auditor_role?: string;
}

---

## 5. The API Client

Every network request goes through lib/api/client.ts.

import { requestPathway, getAudit } from "@/lib/api/client";

const response = await requestPathway("student-001", "BTech-CSE", "IIT-Bombay");
const audit = await getAudit("dec-9f83b165-a1");

Adding a new endpoint:
1. Add the response type to lib/api/types.ts
2. Add a fetch function to lib/api/client.ts
3. Import and use it in a page via React Query

---

## 6. Demo Data → Real Data

Every page reads from lib/constants/demo-*.ts. Swap them for useQuery calls.

| Demo file | Backend endpoint | Used by |
|---|---|---|
| demo.ts | (auth) | Top bar, all pages |
| demo-pathway-infographic.ts | POST /v1/pathway/request | Dashboard, tree |
| demo-pathways.ts | POST /v1/pathway/request | Pathway solver |
| demo-gaps.ts | POST /v1/pathway/request | Gap analysis |
| demo-ledger.ts | GET /v1/audit/list | Ledger |
| demo-audit.ts | GET /v1/audit/{decisionId} | Decision replay |
| demo-profile.ts | GET /v1/student/{id} | Profile |
| demo-bridges.ts | GET /v1/bridges/{id} | Bridge detail |
| demo-courses.ts | GET /v1/courses/{id} | Course detail |
| demo-hei.ts | GET /v1/hei/{id}/queue | HEI review queue |
| demo-hei-approved.ts | GET /v1/hei/{id}/approved | HEI history |
| demo-hei-institutions.ts | GET /v1/hei/institutions | HEI directory |
| demo-gov.ts | GET /v1/gov/aggregate | Gov overview |
| demo-gov-mobility.ts | GET /v1/gov/mobility | Gov mobility |
| demo-gov-policy.ts | GET /v1/gov/policy | Gov policy |

Example — swapping the dashboard:

"use client";
import { useQuery } from "@tanstack/react-query";
import { requestPathway } from "@/lib/api/client";

export default function StudentHome() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pathway", "student-001"],
    queryFn: () => requestPathway("student-001", "BTech-CSE", "IIT-Bombay"),
  });
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} />;
  return <DashboardContent data={data} />;
}

---

## 7. Running with the Real Backend

From repo root:
uvicorn services.main:app --reload --port 8080

In web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8080

Frontend:
cd web
npm run dev

Login at http://localhost:3000:
- Learner / APAAR → /student
- Institutional BoS Reviewer → /hei
- Ministry / State Nodal Officer → /gov

Login is currently a mock — it routes based on identity mode. Real auth is the backend team's call.

---

## 8. Auth Flow

User visits /
  → Chooses identity mode (learner / bos / ministry)
  → Enters 12-digit APAAR ID + checks DPDP consent
  → Clicks "Verify & Fetch"
  → Routes to:
      learner  → /student
      bos      → /hei
      ministry → /gov

Real integration: replace the setTimeout in components/auth/DigiLockerAccess.tsx with an actual auth call. Route logic is already wired via IDENTITY_ROUTES.

---

## 9. Role-Based Navigation

| URL prefix | Nav shown |
|---|---|
| /student/* | Dashboard, Tree, Pathway Solver, Gap Analysis, Ledger, Profile |
| /hei/* | Review Queue, Approved, Institutions |
| /gov/* | Overview, Mobility, Policy |

---

## 10. Design System

styles/tokens.css:
--brand-500: 26 42 82         navy
--accent: 16 185 129          emerald
--bg-canvas: 244 237 224      warm cream
--direct: 16 185 129          recognition: direct
--bridge: 245 158 11          recognition: bridge
--missing: 244 63 94          recognition: missing
--review: 100 116 139         recognition: review

Dark mode via next-themes + overrides in globals.css. Toggle is in top bar.

---

## 11. Common Issues

| Symptom | Fix |
|---|---|
| Cannot find module '@/lib/api/types' | Check tsconfig.json path alias @/* → project root |
| 404 on a new route | Use folder structure: app/gov/policy/page.tsx — not app/gov/policy.tsx |
| Typecheck fails after adding endpoint | Add response type to lib/api/types.ts first |
| API call fails with CORS | Add http://localhost:3000 to backend CORS |
| Data stale after backend change | Change staleTime in components/providers/QueryProvider.tsx |

---

TL;DR: Change NEXT_PUBLIC_API_URL, add any new endpoint to lib/api/client.ts, swap demo-* constants for useQuery calls per page. Components don't need to change — they already accept the real API shape.