/**
 * web/lib/transforms/pathway.ts
 * ────────────────────────────────────────────────────────────────
 * The pathway UI components (SemesterColumn, SummerBridgeCard, ...)
 * were built against lib/constants/demo-pathways.ts shapes. Rather
 * than rewrite those components, these functions convert the real
 * `Pathway` the backend returns (services/schemas.py: mode / terms /
 * terms_plan) into the same shapes — so the polished UI is unchanged
 * and the data underneath it is real.
 * ────────────────────────────────────────────────────────────────
 */
import type { Pathway, MatchResult, Bridge, CourseDetail } from "@/lib/api/types";
import type { CourseCard, SemesterColumn, SummerBridge, PathwayOption } from "@/lib/view-models/pathway";
import { MODE_LABELS } from "@/lib/constants/pathway-modes";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** Real `modality` is free text from the course catalog (e.g. "theory",
 *  "theory+lab", "lab") — this only reformats it into the three display
 *  buckets the UI already has styling for. It never invents a modality
 *  for a course whose real value is missing. */
function normalizeModality(modality: string | undefined): string {
    if (!modality) return "Unknown";
    const m = modality.toLowerCase();
    const hasLab = m.includes("lab");
    const hasTheory = m.includes("theory") || !hasLab;
    if (hasLab && hasTheory) return "Theory & Lab";
    if (hasLab) return "Lab";
    return "Theory";
}

/**
 * Splits a solved pathway's term plan into regular semester columns plus
 * an optional summer-bridge card — a term whose `bridges` list is
 * non-empty is treated as the bridge term (matches how the original
 * demo laid a single SummerBridgeCard between two semesters).
 *
 * `courseCatalog` is a code → CourseDetail lookup (from GET
 * /v1/courses/{code}, batch-fetched by the caller with useQueries) —
 * this function only ever reads real fields off it. A code the catalog
 * doesn't have yet renders with the code as its title and credits
 * "unknown" rather than a fabricated number.
 */
export function pathwayToView(
    pathway: Pathway,
    matches: MatchResult[],
    bridges: Bridge[],
    courseCatalog: Map<string, CourseDetail> = new Map()
): { semesters: SemesterColumn[]; summerBridge: SummerBridge | null } {
    const bridgeById = new Map(bridges.map((b) => [b.bridge_id, b]));
    const semesters: SemesterColumn[] = [];
    let summerBridge: SummerBridge | null = null;

    pathway.terms_plan.forEach((term, i) => {
        if (term.bridges.length > 0 && !summerBridge) {
            const first = bridgeById.get(term.bridges[0]);
            summerBridge = {
                title: first ? first.resource_id : `Bridge resource (${term.bridges.length})`,
                provider: first?.resource_provider ?? "External",
                duration: first ? `${first.duration_hours}h` : "—",
                credits: null, // bridges don't carry a credit value in the real API
            };
            return; // bridge terms render as the SummerBridgeCard, not a column
        }

        const courses: CourseCard[] = term.courses.map((code) => {
            const detail = courseCatalog.get(code);
            return {
                code,
                title: detail?.name ?? code,
                credits: detail?.credits ?? null,
                tag: normalizeModality(detail?.modality),
            };
        });

        const knownCredits = courses.reduce((s, c) => s + (c.credits ?? 0), 0);
        const anyKnown = courses.some((c) => c.credits !== null);
        const allKnown = courses.every((c) => c.credits !== null);
        const sublabel = !anyKnown ? "Credits unknown" : allKnown ? `${knownCredits} Credits` : `${knownCredits}+ Credits`;

        semesters.push({
            id: `term-${term.term_number}`,
            label: `Semester ${ROMAN[term.term_number - 1] ?? term.term_number}`,
            sublabel,
            credits: knownCredits,
            courses,
        });
    });

    return { semesters, summerBridge };
}

/** Overall "% recognized" badge — direct + bridge over all matched courses.
 *  @deprecated superseded by toRecognitionView in lib/transforms/recognition.ts,
 *  which every real caller now uses; this duplicate was never called. */

/**
 * Builds the pathway-tab metadata (title/creditLine/subtitle) shown per
 * solver objective from the REAL solved pathways — replaces the old
 * DEMO_PATHWAYS fixture, which hardcoded numbers like "24 credits/sem"
 * regardless of what the solver actually returned. Only the mode→title
 * mapping (MODE_LABELS) is still static, because that's just a display
 * name for an enum value, not a fact about this student's pathway.
 */
export function pathwaysToOptions(pathways: Pathway[]): PathwayOption[] {
    return pathways.map((p) => {
        const termLabel = `${p.terms} semester${p.terms === 1 ? "" : "s"}`;
        const subtitle =
            p.bridge_burden > 0
                ? `${p.bridge_burden} bridge course${p.bridge_burden === 1 ? "" : "s"} · ${termLabel}`
                : `No bridges needed · ${termLabel}`;
        return {
            key: p.mode,
            title: MODE_LABELS[p.mode] ?? p.mode,
            creditLine: termLabel,
            subtitle,
        };
    });
}
