# EduPathAI Frontend — Setup & Foundation

This document explains the frontend monorepo foundation, how to install it, and how to run each portal.

## 1. Overview

The frontend is an **npm workspaces monorepo** of three Next.js applications and six shared packages. The backend (`services/`, `test/`) is **untouched**; `services/schemas.py` remains the frozen source of truth for every API type.

```
apps/
  student/      Next.js student portal (primary, implemented first)
  hei/          HEI reviewer portal (foundation placeholder)
  government/   Government analyst dashboard (foundation placeholder)
packages/
  ui/           Shared React components (Button, Card, Badge, StatusBadge, ...)
  design-system Design tokens (CSS variables), Tailwind preset
  api-types     Frozen TS mirror of services/schemas.py
  api-client    Shared API client skeleton + React Query factory
  auth          Role types + session/access contracts
  config        App registry, ports, shared constants
```

### Tech stack

> The original UI design spec pinned Next.js 14.2.5, but that release line carries critical
> published vulnerabilities (cache poisoning, SSRF, auth-bypass in middleware). The frontend was
> therefore built on the **maintained Next.js 16 line** with equivalent APIs, so the foundation
> starts secure. The design tokens and component styling still follow the frozen spec exactly.

| Tool | Version |
| --- | --- |
| Next.js | 16.3.5 (App Router, TypeScript, Tailwind) |
| React | 19.3.0 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 3.4.19 |
| Framer Motion | 13.4.0 |
| TanStack React Query | 5.103.1 |
| Zustand | 5.0.15 |
| Lucide React | 0.577.0 |
| class-variance-authority / clsx / tailwind-merge | 0.7.0 / 2.1.1 / 2.4.0 |
| ESLint | 9.39.5 (flat config) + `eslint-config-next` |

Package manager is **npm** (not pnpm). Apps lint with ESLint **flat config**
(`eslint.config.mjs`); shared packages use `typescript-eslint` recommended flat config.

## 2. Prerequisites

- Node.js **>= 20.9.0** (verified on Node 24)
- npm **>= 9**

## 3. Install dependencies

From the repository root (where this `package.json` workspace config lives):

```bash
npm install
```

This installs every workspace and hoists shared dependencies. The lockfile is `package-lock.json`.

## 4. Start the applications

| Application | Port | Command |
| --- | --- | --- |
| Student | 3000 | `npm run dev:student` |
| HEI reviewer | 3001 | `npm run dev:hei` |
| Government analyst | 3002 | `npm run dev:government` |

Equivalently, per workspace:

```bash
npm run dev -w @edupathai/student
npm run dev -w @edupathai/hei
npm run dev -w @edupathai/government
```

Production builds (all workspaces):

```bash
npm run build
```

Start a production build for one app:

```bash
npm start -w @edupathai/student
```

## 5. Verification commands

| Check | Command |
| --- | --- |
| TypeScript across every workspace | `npm run typecheck` |
| ESLint across every workspace | `npm run lint` |
| Production build across every workspace | `npm run build` |
| Single app (e.g. student) | `npm run build -w @edupathai/student` |

## 6. API client & backend contract

- The backend FastAPI server runs at `http://127.0.0.1:8000` by default.
- Override per app with an environment variable:

```bash
# apps/*/ .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

- `packages/api-client` exposes `createApiClient()`, typed `get`/`post`, `createBackendApi()` and `createQueryClient()`.
- **Only backend-implemented routes** are wired (from `services/api/server.py`):

| Method | Route | Typed helper |
| --- | --- | --- |
| `POST` | `/v1/pathway/request` | `requestPathway(body: PathwayRequest)` |
| `GET` | `/v1/audit/{decision_id}` | `getAuditRecord(decisionId)` |
| `GET` | `/health` | `health()` |

New endpoints must be re-negotiated with the backend owner before being added.

## 7. Design system

- Tokens live in `packages/design-system/src/tokens.css` and are imported by every app root layout.
- `packages/design-system/src/tailwind-preset.ts` provides the shared Tailwind theme:
  - **Brand (Violet)**: `brand-50/100/500/600/700`
  - **Semantic recognition colors**: `direct` (Emerald), `bridge` (Amber), `missing` (Rose), `review` (Slate), `conflict` (Fuchsia)
  - **Surface**: `canvas`, `surface`, `elevated`, `subtle`, `strong`, `primary`, `secondary`, `muted`
  - Typography (`sans`, `mono`, `display`), shadows (`glow`), motion easings, keyframe animations.
- Every app's `tailwind.config.ts` includes the preset and scans `apps/*`, plus `../../packages/ui/src` so shared component classes are generated.

## 8. Roles

Shared role types live in `packages/auth`:

```ts
type AppRole = "student" | "hei_reviewer" | "government_analyst";
```

Helpers: `ROLE_DEFINITIONS`, `ROLE_LABELS`, `isAppRole`, `hasRole`, `hasAnyRole`, and portal access mapping (`PORTAL_ACCESS`, `canAccessPortal`) for future route guarding.

## 9. API types

`packages/api-types` mirrors `services/schemas.py` one-to-one. Included enum types: `RecognitionStatus`, `GapType`, `BridgeMode`, `PathwayMode`, `SolverStatus`. Included interfaces: `DecisionBundle`, `EvidenceRef`, `MatchResult`, `Gap`, `Bridge`, `TermPlan`, `Pathway`, `AuditRecord`, `RecognitionSummary`, `PathwayResponse` (+ `SolveRequest`, `SolveResponse`, request-body and health types). Do not extend these without backend re-negotiation.

## 10. Shared UI components (`packages/ui`)

`Button`, `Card`, `Badge`, `StatusBadge` (maps `RecognitionStatus` to semantic colors), `EmptyState`, `LoadingSkeleton` (Framer Motion), `PageHeader`, plus the `cn()` class-merge helper.

## 11. What ships later (out of scope of this foundation)

Login, onboarding, the Academic Tree, pathway pages, BridgePath, and audit pages are intentionally **not** implemented. HEI review and government analytics extend the same foundation.

## 12. Repository layout at a glance

```text
apps/student            Next.js student portal (port 3000)
apps/hei                Next.js HEI portal (port 3001)
apps/government         Next.js government dashboard (port 3002)
packages/ui             Shared UI components
packages/design-system  Design tokens + Tailwind preset
packages/api-types      Frozen TS mirror of services/schemas.py
packages/api-client     API client skeleton + React Query factory
packages/auth           Roles, sessions, portal access
packages/config         App registry, ports, constants
tsconfig.base.json      Shared compiler options
```