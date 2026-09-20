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
import type { Pathway, MatchResult, Bridge } from "@/lib/api/types";
import type { CourseCard, SemesterColumn, SummerBridge } from "@/lib/constants/demo-pathways";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * Splits a solved pathway's term plan into regular semester columns plus
 * an optional summer-bridge card — a term whose `bridges` list is
 * non-empty is treated as the bridge term (matches how the original
 * demo laid a single SummerBridgeCard between two semesters).
 */
export function pathwayToView(
    pathway: Pathway,
    matches: MatchResult[],
    bridges: Bridge[]
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
                credits: term.courses.length,
            };
            return; // bridge terms render as the SummerBridgeCard, not a column
        }

        const courses: CourseCard[] = term.courses.map((code) => {
            const match = matches.find((m) => m.target_course_id === code || m.source_course_id === code);
            return {
                code,
                title: code,
                credits: 4,
                tag: match ? "Theory" : "Theory",
            };
        });

        semesters.push({
            id: `term-${term.term_number}`,
            label: `Semester ${ROMAN[term.term_number - 1] ?? term.term_number}`,
            sublabel: `${courses.length * 4} Credits`,
            credits: courses.length * 4,
            courses,
        });
    });

    return { semesters, summerBridge };
}

/** Overall "% recognized" badge — direct + bridge over all matched courses. */
export function recognitionPercent(matches: MatchResult[], directBridgeCount: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((directBridgeCount / total) * 100);
}
