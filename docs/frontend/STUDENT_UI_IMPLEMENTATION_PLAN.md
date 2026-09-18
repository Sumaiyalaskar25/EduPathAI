# Student UI — Implementation Plan

**Source of truth:** `docs/frontend/ui_design_student.pdf` (the ONLY design source; the old architecture PDF was deleted and is not used).
**Scope of plan covers:** all 6 screens shown in the PDF, their layout, content, and required components. **No application code is modified** in this phase.

---

## 0. How this plan was produced (read this first)

`docs/frontend/ui_design_student.pdf` is a **6-page image-only PDF** (verified: zero embedded text/font objects; the 6 pages are JPEG screenshots ~1671×933, merged via iLovePDF). Because it has no text layer, the plan was built from:

1. **OCR** of every page (Windows built-in OCR, en-US) — transcriptions of all visible strings **with their bounding boxes** (x/y/width) so geometry is preserved, not guessed.
2. **Pixel sampling** of each screenshot (median patches) to characterize the visible palette.

### Classification tags used for every design property
- **[VIS]** — Explicitly visible in the PDF (in the screenshot: string, geometry, or color).
- **[WRI]** — Explicitly written in the PDF (typed text/code instructions). **This PDF has no text layer, so [WRI] is never applicable**; where this matters it is stated explicitly.
- **[NS]** — Not specified in the PDF (the plan says so instead of inventing).

### Honesty notes / fidelity caveats
- Strings are real OCR output from the visible screens; a few are partially garbled by the render/OCR. Where a string is low-confidence it is flagged `(ocr)` and listed again in §11.
- Colors are **hue guidance only**: sampled from JPEG screenshots (re-encoded at quality 60), so exact hex cannot be recovered. Exact color values are therefore [NS] (see §11); the visible hue family is [VIS].
- Spacing, border radius, and shadow **numeric values** are not measurable from screenshots beyond relative geometry → [NS], with relative observations marked [VIS].
- Fonts: the UI renders a sans-serif face and the JSON panel renders a monospace face. The specific typefaces are [NS].
- No aspect of the PDF implies mobile/tablet layouts, hover, loading, empty, error, or animation behavior. All such properties are [NS] and are **not invented here**.

---

## 1. Screen inventory

| # | Screen (as shown) | PDF page | Shell |
|---|---|---|---|
| S1 | Landing / marketing hero — "Intelligent Academic Mobility" | page 5 | Pre-login, top nav |
| S2 | Identity Mode Selection / sign-in | page 4 | Pre-login, top nav |
| S3 | Student Academic Tree & Competency Explorer | page 3 | Authenticated, left sidebar |
| S4 | Path-Solve Optimizer (Pathway Solver) | page 2 | Authenticated, left sidebar |
| S5 | Gap-Find & BridgePath (Gap Analysis) | page 1 | Authenticated, left sidebar |
| S6 | Cryptographic Decision Bundle Explorer (Ledger) | page 0 | Authenticated, left sidebar |

Route mapping is given in §9 (paths themselves are not named in the PDF → [NS]).

---

## 2. Shared shells

### 2.1 Pre-login shell (S1, S2) — [VIS]
Top header bar (≈70 px tall, full width), light background:
- **Left:** brand block — logo mark + "EduPathAI" wordmark with "Ministry of Education" tagline beneath. [VIS]
- **Center:** nav links `Framework | Institutional Network | Credit Simulator | About`. [VIS]
- **Right:** `Reviewer Access` link, then a `Student Login via APAAR` call-to-action. [VIS]
- No sidebar, no footer block visible in either page. [VIS]

### 2.2 Authenticated shell (S3–S6) — [VIS]
Two-region app frame:
- **Left sidebar (≈180–200 px wide):** brand block at top (logo + "EduPathAI" + "Ministry of Education" subtitle) [VIS]; primary navigation, items from top: `Tree View`, `Pathway Solver`, `Gap Analysis`, `Ledger` [VIS]; a gap then an **unlabeled icon** is visible above [NS identity] `Profile` at the bottom [VIS]. The **active** item carries a tinted highlight (mint/teal, sampled) [VIS / approx].
- **Main region:** header strip + scrollable page body.

### 2.3 Authenticated header strip (S3–S6) — [VIS]
- Left inside main area: **page title block** (bold title line + smaller subtitle line), page-specific text (§§4–7).
- Center-right: **student identity line** `APAAR: 9081.****.2201 · B.Tech Computer Science & Engineering`. [VIS]
- Far right: **context pills** (page-specific): e.g. S6 `Chain ID: global-inst-iitb-2026` and `Chain Integrity: 100% Verified`; S3/S4 `72% Recognized` and `IIT Bombay · Curriculum v2026.1`; S5 `72% Content Alignment`. [VIS]

---

## 3. S1 — Landing ("Intelligent Academic Mobility") [page 5]

### Layout [VIS]
Header (as §2.1) → hero (left-aligned) → feature grid (3 columns) at bottom. No footer visible.

### Sections & text
1. **Hero title:** "Intelligent Academic Mobility." (line 1) and "Tamper-Proof Recognition." (line 2) — large type. [VIS]
2. **Hero paragraph:** "The National AI-driven engine for seamless credit transfer, alignment, and authentication across India's higher education ecosystem." [VIS]
3. **Instant-sync input:** placeholder "Enter APAAR ID / ABC ID for instant sync". [VIS]
4. **Stats row:** `14.2M | Credits Transferred`, `HEIs Integrated`, `Error Tolerance`, and a fourth stat `(ocr: "university Credits")`. [VIS / low-confidence]
5. **Feature cards (3):**
   - **RECOGNITION FRAMEWORK** — "Deterministic Solver", "Credit-matching algorithms". [VIS]
   - **Cross-institutional Recognition** — "Course A" → "Course B" with "96% Alignment" (alignment bar diagram). [VIS]
   - **WORM Audit Ledger** — "SHA-256", "Syllabus", "Tamper-Proof". [VIS] (WORM = Write Once Read Many, inferred from context; label itself visible)

### Component-level spec
- Primary CTA button: `Student Login via APAAR` (header). [VIS]
- Input + button row at hero (placeholder above). Secondary action text under stats row. [VIS]

### States, responsive, animation, a11y
- Loading/empty/error/hover/selected: [NS]. Mobile/breakpoints: [NS]. Animation/motion: [NS]. Accessibility: [NS] (no a11y info in PDF).

---

## 4. S2 — Identity Mode Selection / sign-in [page 4]

### Layout [VIS]
Header (as §2.1) → **split body**: dark left panel (≈500–550 px) with light text; light right panel.

### Left panel (dark navy, approximate) — [VIS / approx colors]
1. Heading "Identity Mode Selection". [VIS]
2. Three stacked selectable mode cards:
   - `Learner / APAAR`
   - `Institutional / BOS Reviewer`
   - `Ministry / State Nodal Officer`
3. Footer caption "hash-verified". [VIS]

### Right panel (light) — [VIS]
1. Heading "Access via DigiLocker & ABC ID". [VIS]
2. Text input, placeholder "Enter 12-digit APAAR / ABC ID". [VIS]
3. Primary button `Verify & Fetch`. [VIS]
4. "OR" divider. [VIS]
5. Alternative method block "Biometric / OTP". [VIS]
6. "Connect with MeriPehchan" row (with an input/action). [VIS]
7. Trust footer:
   - "DPDP Act (2023) privacy consent micro-card" [VIS]
   - "Zero PII persistence · Tokenized verification only" [VIS]
   - "Consent to secure data processing under DPDP Act (2023)" [VIS]
   - `ISO/IEC 27001` badge. [VIS]

### Selected states [NS] — cards are visibly distinct/stacked, but no explicit active-card indicator is legible.

### Colors [VIS / approx]
Left panel dark navy-slate (≈ #2E3F54 family); right panel near-white (≈ #F2F5F8); primary button dark teal-navy (≈ #193845–#223959).

### States / responsive / animation / a11y: [NS].

---

## 5. S3 — Student Academic Tree & Competency Explorer [page 3]

### Page title & pills [VIS]
- Title: "Student Academic Tree" with subtitle "& Competency Explorer".
- Right pills: `72% Recognized`, `IIT Bombay | Curriculum v2026.1`.

### 5.1 Academic Tree (the centerpiece) — [VIS]
- Rooted, left-to-right hierarchical tree rendered on the light canvas (main area x≈210–1000).
- **Root/roof stat chip:** "48 Recognized Credits" (light mint chip, top-left of the tree). [VIS / approx]
- **Course node:** "Databases" (single visible text node). [VIS]
- **Floating count chips:** two "14 Bridge Credits" chips associated with bridge branches (top-right of the tree, twice), plus a "Future Electives" node/chip (right-lower). [VIS]
- **Semester row at the bottom:** "Sem 1", "Sem 2", "Sem 3", "Sem 4" labels along the tree's bottom. [VIS]
- **Node colors:** recognized/outcome nodes mint-green (≈ #51–60 C8 A1), bridge nodes amber (≈ #E9BF76), edges light gray; text labels under/next to nodes. [VIS / approx]
- Exact tree geometry (branch angles, node radii, spacing) — [NS]; only relative structure above is visible.

### 5.2 Competency-explorer right panel — [VIS]
A card on the right (x≈1278–1640):
- Header: "Competency Node:" + "Distributed Systems (CS-401)". [VIS]
- Badge: "A BRIDGE REQUIRED (0.78 Semantic Coverage)" (amber). [VIS]
- Section "Prerequisites & Alignment" with line "Direct prerequisites satisfied (3/3)"; checklist: `Computer Networks`, `Operating Systems`, `Data Structures`. [VIS]
- Section "Course Equivalency Gap:" with example "Consensus protocols (Paxos/Raft)". [VIS]
- CTA: "Enroll in NPTEL Bridge Course (20h)" (with an arrow glyph). [VIS]

### 5.3 States / responsive / animation / a11y
- Selected (node) state: opening the right panel is implied by the panel content, but the explicit selection highlight is [NS]. Hover/loading/empty/error: [NS]. Mobile layout for the tree: [NS]. Animations (grow/pulse/glow): [NS] — the shared `tree-grow`/`pulse-glow` tokens are NOT evidenced by this PDF and must not be claimed from it.

---

## 6. S4 — Path-Solve Optimizer (Pathway Solver) [page 2]

### Page title & pills [VIS]
- Title: "Path-Solve Optimizer:" / subtitle "Multi-Objective Degree Pathway Generator".
- Right pills: `72% Recognized`, `IIT Bombay | Curriculum v2026.1`.

### 6.1 Pathway summary row (3 cards) — [VIS]
1. `Fastest Path` — "24 credits/sem" — "Minimize Graduation Time: 3 Semesters · high workload".
2. `Balanced Path` — "18 credits/sem" — "Optimal workload variance: 4 Semesters".
3. `Maximum Preservation` — "100% Credit Retention" — "4 Semesters + summer bridge".

### 6.2 Term roadmap grid (4 semester columns) — [VIS]
- Headers: `Semester V - Spring 2027` (18 Credits) · `Semester VI - Fall 2027` (16 Credits) · `Semester VII - Spring 2028` (14 Credits) · `Semester VIII - Fall 2028` (12 Credits).
- **Course chips** with credits and type tags (`Theory`, `Lab`, `Theory & Lab`):
  - Sem V (visible): Distributed Systems (CS-401) 4 · Theory; Computer Networks 4 · Theory & Lab; Operating Systems 4 · Theory.
  - Sem VI (visible): Artificial Intelligence · High-Performance Computing 4 · Lab; Software Engineering 4 · Theory.
  - Sem VII (visible): Natural Language Processing; Machine Learning 4; Interdisciplinary Elective 3.
  - Sem VIII (visible): Capstone Project (CS-401) 4 · Theory; Open Elective II 6; Ethics in AI 3.
- **Summer Bridge card** between Sem V and VI: "Summer Bridge: Advanced Graph Algorithms (SWAYAM - 4 Weeks)" · 4 Credits · Theory. [VIS]

### 6.3 Footer bar — [VIS]
- Left: "Workload Variance" label + indicator bar.
- Center: "Solver Confidence: OPTIMAL (CBC 9.10)" (green text/badge).
- Right: primary button "Lock and Submit Pathway to Academic Council".

### 6.4 Selected state [VIS, weak]
The three summary cards have different header tints (warm beige / cool mint / rose), indicating at most one highlighted selection, but no explicit check/ring is legible → treat as a weak signal; exact selected style [NS].

### 6.5 Hover/loading/empty/error/responsive/animation/a11y: [NS].

---

## 7. S5 — Gap-Find & BridgePath (Gap Analysis) [page 1]

### Breadcrumb [VIS]
`Source: University of Calcutta (Data Structures) → Target: IIT Delhi (Advanced Data Structures & Algorithms)` (single line under header).

### Right pill [VIS]
`72% Content Alignment` (top-right of header).

### 7.1 Curriculum Outcome Delta (left-main) — [VIS]
- Two compare columns with a center arrow/connector column:
  - **Source outcomes:** 1. Memory Allocation · 2. Complexity Analysis · 3. Linear Arrays & Lists · 4. Trees & Simple Search · 5. Search & Sort Algorithms · 6. Basic Graph Traversal.
  - **Target outcomes:** Dynamic Allocation · Amortized Complexity · Advanced Sequences · Balanced Trees & Red-Black Trees · External Sorting & Hashing · Advanced Graph & Network Flows.
- Status chips beneath the last pair:
  - `DIRECT MATCH (Bloom Level - Apply)` (green) [VIS / approx]
  - `GAP DETECTED: Missing Network Flow Algorithms` (amber) [VIS / approx]

### 7.2 Bloom's Taxonomy Cognitive Depth Coverage (middle-right) — [VIS]
- Heading "Bloom's Taxonomy Cognitive Depth Coverage".
- Chip: `DIRECT MATCH (Bloom Level 4 - Analyze)`.
- Chart with axis labels (Analyze, Create, "Bloom level 2/3", ...) and legend "Source | Target" with footer "Cognitive Depth Coverage". Exact chart geometry/details: [NS].

### 7.3 Recommended Bridge Courses — BridgePath Engine (right column) — [VIS]
- Heading + "Recommended Bridge Courses" / "BridgePath Engine".
- **Card 1:** `NPTEL: Analysis of Algorithms Unit 3 & 4` · "Duration: 18 Hours · Online Lab Included" · chips `100% Outcome Coverage`, `Institution Approved` · button `+ Add to Academic Plan`.
- **Card 2:** `SWAYAM: Advanced Algorithmic Thinking Micro-Module` · "Duration: 12 Hours · Self-Paced" · button `+ Add to Academic Plan`.

### 7.4 Footer bar — [VIS]
- Left: "Workload Variance".
- Center: `HEI Board of Studies pre-approved bridge pathway` (with check icon).
- Right: primary button `Proceed & Update Academic Plan`.

### 7.5 Hover/selected/loading/empty/error/responsive/animation/a11y: [NS].

---

## 8. S6 — Cryptographic Decision Bundle Explorer (Ledger) [page 0]

### Page title & intro [VIS]
- Title: "Cryptographic Decision Bundle Explorer"; subtitle: "Tamper-Evident Ledger".
- Paragraph: "The sovereign audit trace ensures immutable, tamper-evident verification of AI and human academic decisions."
- Header pills: `Chain ID: global-inst-iitb-2026`, `Chain Integrity: 100% Verified`.

### 8.1 Status cards (left column) — [VIS]
1. **Identity Tokenized & Enrolled** — "DigiLocker APAAR handshake"; right-aligned mono chip `7f83b1657…`.
2. **Multi-Model AI Extraction & Consensus** — "Gemini 2.0 Flash + DeepSeek"; badge `Consensus Score: 0.94`; lines `v4.2 Prompt Engine` and timestamp `(ocr: "Tue-O$3T 17:35 AM")`.
3. **Deterministic Recognition Gate** — pill `Status: BRIDGE_REQUIRED`; lines "Zero hallucination rule applied", "Rule #7 matched: Missing Network Flow Algorithms"; link `Review Bridge Requirements`.
4. **Human Board Approval** — "Signed by BOS Convener Prof. S. Sen via Aadhaar e-Sign".

### 8.2 JSON code panel (right column, dark) — [VIS / approx colors ≈ #131A2E]
- Window title `decision_bundle.json`. [VIS]
- Monospace JSON lines (visible, exact formatting partial): `"name": "metadata"`, `"version"`, `"sha256": "4a7b9c2d…"`, `"ledgers"`, `"Solver parameters": { "presentation": "50", "times": 10, "maximizing": true, "parameter": false }`, "immutable S3 Object Lock pointers", `"sha256": "laa7…"`. [VIS]
- The dark code surface and the right-tail key/value layout are visible; exact JSON string content is partially garbled by OCR → [VIS / low confidence].

### 8.3 Footer bar — [VIS]
- Left: `Audit Sync / Status`.
- Center: `HEI Board of Studies pre-approved bridge pathway` (check icon).
- Right, stacked controls: `Export Cryptographic Proof (PDF)` (steel-blue button) · `Replay Exact Decision State` (dark slate) · `Proceed & Update Academic Plan` (navy, wraps to two lines).

### 8.4 Hover/selected/loading/empty/error/responsive/animation/a11y: [NS].

---

## 9. Required routes

Paths are not named in the PDF ([NS]); the screen→slot mapping is:

| Screen | Suggested route (suggestion, [NS]) |
|---|---|
| S1 Landing | `/` (pre-login default) |
| S2 Identity Mode Selection | `/auth` (pre-login) |
| S3 Academic Tree | `/tree` |
| S4 Pathway Solver | `/pathways` |
| S5 Gap Analysis | `/gaps` |
| S6 Ledger Explorer | `/ledger` |
| Profile (nav item only; screen not shown) | `/profile` ([NS] content) |

---

## 10. Required components (derived from the screens)

### Shared (pre-login)
- `TopNav` — brand + centered links + right CTAs (§2.1) [VIS]; item list frozen to the 5 visible links.
- `LandingHero`, `InstantSyncInput`, `StatsRow` (S1).
- `IdentityPanel` — dark left card list (S2).
- `SignInForm` — input `Verify & Fetch`, OR divider, Biometric/OTP, MeriPehchan row, trust footer (S2).

### App shell (authenticated)
- `AppShell` + `Sidebar` (brand, nav items, active highlight, bottom icon + Profile) (§2.2).
- `PageHeader` (title/subtitle, identity line `APAAR: 9081.****.2201 · B.Tech Computer Science & Engineering`, right pills) (§2.3).
- `ContextPill` (right-header pill: `72% Recognized`, `Chain Integrity: 100% Verified`, `72% Content Alignment`, etc.).

### Academic Tree (S3)
- `AcademicTree` (rooted L-to-R tree with edges, nodes, semester row, stat chips).
- `TreeNode` (mint green / amber, label under node — colors approx).
- `CompetencyDetailPanel` (title, badge, prerequisites checklist, equivalency gap, CTA).

### Pathway Solver (S4)
- `PathwaySummaryCard` (3 variants), `PathwayPlanGrid`/`SemesterColumn`, `CourseChip` (credits + Theory/Lab tag), `SummerBridgeCard`, `WorkloadVarianceIndicator`, `SolverConfidenceBadge`.

### Gap Analysis (S5)
- `OutcomeDeltaTable` (source/target compare + arrows), `MatchChip` (DIRECT MATCH / GAP DETECTED), `BloomCoverageChart`, `BridgeCourseCard` (duration, coverage chips, Add-to-Plan button).

### Ledger (S6)
- `LedgerStatusCard`, `JsonPanel` (title bar + mono body), footer CTA trio.

### Shared UI additions needed in `packages/ui` (each [NS] in the PDF but structurally implied by the screens)
- `DataChip` / `StatusPill`, `CheckItem`, `FooterActionBar`, `KeyValueRow`.

---

## 11. Information that cannot be determined from the PDF ([NS] list)

1. **Exact color values** — palette visible but JPEG-substituted (Q60); hue families identified: light warm canvas, navy/teal primary (~#1E3A54–#3D6771), mint DIRECT green (~#51BA8E), amber BRIDGE (~#E9BF76), dark navy code surface (~#131A2E), warm-light surfaces.
2. **Font families and weights** — sans + mono visible; identities unknowable.
3. **Exact spacing, padding, grid gaps, border radius, and shadow values.**
4. **All hover, loading, empty, and error states** (no such screens in the PDF).
5. **Animations/motion** — static screenshots; nothing claimable about motion, timing, or easings.
6. **Responsive/mobile/tablet behavior** — screenshots are landscape desktop only.
7. **Accessibility requirements** — no a11y content in this PDF.
8. **Sidebar width and active-item style** beyond a tinted highlight (approx).
9. **The unlabeled sidebar icon** above Profile.
10. **Profile screen content** (route slot only).
11. **Which pathway card is "selected"** on S4 (weak tint signal only).
12. **Bloom chart internals** (series type, scale) and **JSON panel exact formatting**.
13. **Garbled OCR strings** (`(ocr)` flags): "Tue-O$3T 17:35 AM", "14.2M/HEIs Integrated" adjacent labels, "university Credits", "Direct prerequisites satisfied (3/3)" is legible but the checklist glyphs count is approximate.
14. **Split-panel background treatment on S2** (flat vs gradient — only hue sampled).
15. **Current shared design tokens diverge from the visible hue family**: the shared foundation uses a violet `brand-500` accent, while the visible student UI uses a navy/teal primary. Whether to re-tune the shared `brand` scale or overlay a student-wide accent is a **decision point [NS]** that must be settled before implementation (affects `packages/design-system/src/tokens.css`).

---

## 12. Required design tokens (grounded in this PDF)

| Token | Based on | Class |
|---|---|---|
| `canvas` background (light warm gray) | S1–S6 surfaces | [VIS approx] / exact [NS] |
| `surface` card background (near-white) | S3 panel, S4 chips, S5 cards | [VIS approx] |
| Primary fill (navy/teal) | S1 login CTA, S2 Verify&Fetch, S4 Lock&Submit, S6 Proceed | [VIS approx] |
| Secondary/dark slate fill | S6 Replay button | [VIS approx] |
| Steel-blue accent | S6 Export PDF button | [VIS approx] |
| DIRECT green (mint) | S3 nodes, S5 DIRECT MATCH chips, S4 Solver Confidence | [VIS approx] |
| BRIDGE amber | S3 badge, S5 GAP/chips, S0 BRIDGE_REQUIRED pill | [VIS approx] |
| Dark code surface | S6 JSON panel | [VIS approx] |
| Text primary (dark), text muted (grays in pills) | visible | [VIS approx] |
| Mono font for JSON | S6 | [VIS] (face [NS]) |
| Sans font for UI | S1–S6 | [VIS] (face [NS]) |

Anything not in this table (hover, glow, pulse, skeleton, breakpoints, elevations) is [NS] and must be **introduced only as a deliberate, budgeted decision** — not as a PDF requirement.

---

## 13. Required assets

- **Brand mark:** logo mark + "EduPathAI" wordmark + "Ministry of Education" tagline (§2.1, §2.2) — drawn/vector; source not provided → [NS].
- **Icons:** glyphs are visible but their source library is not specified [NS]. lucide-react (already in the stack) is the pragmatic source of equivalents: TreePine (Tree View), Route/Compass (Pathway Solver), Search (Gap Analysis), BookOpen/ScrollText (Ledger), User (Profile), ArrowRight/Plus (Add to Plan, BridgeCourse CTA), CheckCircle (Pre-approved), Download/FileDown (Export PDF), Replay (Replay state), ShieldCheck (Chain Integrity).
- **Fonts:** sans (UI) + mono (JSON) — [NS] identity; JetBrains Mono already provisioned in the design system.
- **No image assets** appear in any screen (all graphics are drawn UI). [VIS]

---

## 14. Recommended implementation order

1. **Foundation alignment (decision-gate):** resolve the violet-vs-navy/teal accent question (§11.15) by extending/overriding tokens for the student app; add missing shared primitives (StatusPill, CheckItem, KeyValueRow).
2. **Pre-login shell + S1 Landing** (TopNav, hero, input, stats, feature grid) and **S2 Identity Mode Selection** (split panel, three mode cards, form + trust footer).
3. **Authenticated AppShell + Sidebar + PageHeader** with the 4 functional routes plus `/profile` placeholder.
4. **S3 Academic Tree** (centerpiece): static tree layout + mint/amber node styling + CompetencyDetailPanel; wire `/tree`.
5. **S4 Pathway Solver**: summary cards, 4-semester grid, course chips, summer bridge, footer bar; wire `/pathways`.
6. **S5 Gap Analysis**: outcome delta columns + DIRECT/GAP chips, Bloom chart (static first), bridge-course cards; wire `/gaps`.
7. **S6 Ledger**: status cards + JSON panel + footer CTAs; wire `/ledger`.
8. **Hygiene pass** (explicitly beyond the PDF, budgeted decisions): loading skeletons, empty/error states, keyboard & focus a11y, responsive breakpoints, then `typecheck` + `lint` + `build` + visual QA at the sampled desktop size.

---

## 15. Summary (for the terminal)

- **Design source:** `docs/frontend/ui_design_student.pdf` (6-page, image-only) — read via OCR + pixel sampling; all content above is [VIS] unless marked [NS].
- **Screens:** Landing → Identity selection → Academic Tree → Pathway Solver → Gap Analysis → Ledger (+ visible Profile nav slot).
- **No [WRI] properties exist** (no text layer). Most states/animations/mobile are [NS] and were not invented.
- **Key finding:** the visible palette is light-warm + navy/teal primary + mint/amber semantics — different from the shared violet brand tokens; a token decision gate is required before coding.
- **Plan file:** `docs/frontend/STUDENT_UI_IMPLEMENTATION_PLAN.md` — routes, components, assets, tokens, unknowns, and a 8-step implementation order included.