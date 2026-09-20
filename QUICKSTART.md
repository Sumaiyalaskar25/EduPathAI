# Quickstart — Running the Full Stack

This covers what changed to make EduPathAI a working application end to
end: a real Postgres-backed API surface behind every frontend page, and
every button wired to it. See `README.md` for the algorithmic/architecture
deep dive (matching, solver, audit ledger) — that part was already real.

## 1. One command (Docker)

```bash
cp .env.example .env            # fill in an LLM key if you have one (optional)
docker compose up --build
```

This starts Postgres (with pgvector), applies every migration in
`db/migrations/`, then starts the API on :8000 and the web app on :3000.

Seed some real demo data (runs the actual pipeline for 5 students, not
fake rows — see `scripts/seed.py`):

```bash
docker compose exec api python scripts/seed.py
```

Open http://localhost:3000. On the identity screen:
- **Learner**: type any 12-digit number ending in one of the seeded
  APAAR suffixes (see `data/identity_directory.json`), e.g. `000000002201`.
- **BoS Reviewer** / **Ministry**: any 12-digit number works — those
  roles resolve to a fixed reviewer/officer identity in the same fixture.

## 2. Manual setup (no Docker)

**Backend**
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL to a local Postgres+pgvector instance
for f in db/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
python scripts/seed.py
uvicorn services.api.server:app --reload
```

**Frontend** (separate terminal)
```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

## 3. What's real vs. what's still a known gap

Real: auth (mock DigiLocker, real signed sessions), the full pathway
pipeline (real matcher + real MILP solver + real persistence), the audit
ledger (hash-chained, HEI approve/reject appends real chained events, PDF
export is a real generated PDF), student dashboard/pathways/gaps/profile,
HEI review queue, gov aggregate dashboard (real SQL aggregation — numbers
are small until you seed more data, which is correct behavior, not a bug).

Known gaps, left honestly rather than faked:
- **Academic Tree page** (`/student/tree`) — still the original static
  D3-style layout; making it dynamic needs a real graph-layout pass.
- **HEI "Approved" / "Institutions" pages, Gov "Mobility" / "Policy"
  sub-pages** — backend endpoints exist and are real
  (`services/api/routes/hei.py`, `gov.py`); the frontend for these
  specific sub-pages hasn't been rewired off demo data yet.
- **Bridges/Courses detail pages** (`/student/bridges/[id]`,
  `/student/courses/[id]`) — same: real endpoints, page not yet rewired.
- **Latency/SLA stats** on the gov dashboard — no request-timing
  instrumentation exists yet, so that one panel stays on illustrative
  numbers.
- Course *matching* is still fixture-driven (`test/fixtures/*/gold.json`)
  rather than a real curriculum database — every pathway request
  evaluates the same 3 known course pairs regardless of student
  profile. Wiring real curricula into `courses`/`learning_outcomes`
  (already in the schema) is the natural next step.
