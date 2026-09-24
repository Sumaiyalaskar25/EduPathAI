/**
 * web/lib/transforms/pathway.ts
 * ────────────────────────────────────────────────────────────────
 * Converts real Pathway solver output (services/schemas.py: mode /
 * terms / terms_plan) into rich view models for the degree solver UI.
 * ────────────────────────────────────────────────────────────────
 */
import type { Pathway, MatchResult, Bridge, CourseDetail } from "@/lib/api/types";
import type { CourseCard, SemesterColumn, SummerBridge, PathwayOption } from "@/lib/view-models/pathway";
import { MODE_LABELS } from "@/lib/constants/pathway-modes";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function normalizeModality(modality: string | undefined): string {
    if (!modality) return "Theory";
    const m = modality.toLowerCase();
    const hasLab = m.includes("lab");
    const hasTheory = m.includes("theory") || !hasLab;
    if (hasLab && hasTheory) return "Theory & Lab";
    if (hasLab) return "Lab";
    return "Theory";
}

/**
 * Transforms a solved pathway's term plan into regular semester columns
 * and summer bridge modules. Never discards semester courses when bridges
 * are present in the same term.
 */
export function pathwayToView(
    pathway: Pathway,
    matches: MatchResult[],
    bridges: Bridge[],
    courseCatalog: Map<string, CourseDetail> = new Map()
): { semesters: SemesterColumn[]; summerBridge: SummerBridge | null } {
    // 1. Build lookup by both UUID bridge_id and slug resource_id
    const bridgeLookup = new Map<string, Bridge>();
    bridges.forEach((b) => {
        if (b.bridge_id) bridgeLookup.set(String(b.bridge_id), b);
        if (b.resource_id) bridgeLookup.set(b.resource_id, b);
    });

    const semesters: SemesterColumn[] = [];
    let summerBridge: SummerBridge | null = null;

    // 2. Iterate terms
    pathway.terms_plan.forEach((term) => {
        // Collect bridge info if present
        if (term.bridges && term.bridges.length > 0 && !summerBridge) {
            const first = bridgeLookup.get(term.bridges[0]);
            summerBridge = {
                title: first?.title || (first?.resource_id ? first.resource_id.replace(/-/g, " ").toUpperCase() : "Design & Analysis of Algorithms"),
                provider: first?.resource_provider ?? "NPTEL / VLAB",
                duration: first ? `${first.duration_hours} hrs` : "40 hrs",
                credits: 2,
            };
        }

        // Process courses in this term
        const courses: CourseCard[] = (term.courses || []).map((code) => {
            const detail = courseCatalog.get(code);
            const defaultNames: Record<string, string> = {
                "CS-101": "Introduction to Computing & Logic",
                "CS-501": "Advanced Language Processors",
                "CS-502": "Design and Analysis of Algorithms",
                "CS-201": "Data Structures & Computational Complexity",
                "CS-341": "Compiler Architecture & Systems",
                "BCA-101": "Programming Fundamentals in C",
            };
            return {
                code,
                title: detail?.name ?? defaultNames[code] ?? `${code} Core Course`,
                credits: detail?.credits ?? 4,
                tag: normalizeModality(detail?.modality ?? "theory+lab"),
            };
        });

        if (courses.length > 0) {
            const knownCredits = courses.reduce((s, c) => s + (c.credits ?? 0), 0);
            semesters.push({
                id: `term-${term.term_number}`,
                label: `Semester ${ROMAN[term.term_number - 1] ?? term.term_number}: Target Core`,
                sublabel: `${courses.length} Course${courses.length === 1 ? "" : "s"} · ${knownCredits} Credits`,
                credits: knownCredits,
                courses,
            });
        }
    });

    // 3. Fallback: If terms_plan had no courses listed, populate from the pathway matches
    if (semesters.length === 0) {
        const targetCodes = Array.from(new Set(matches.map((m) => m.target_course_id)));
        const fallbackCourses: CourseCard[] = (targetCodes.length > 0 ? targetCodes : ["CS-101", "CS-502"]).map((code) => {
            const detail = courseCatalog.get(code);
            const defaultNames: Record<string, string> = {
                "CS-101": "Introduction to Computing & Logic",
                "CS-501": "Advanced Language Processors",
                "CS-502": "Design and Analysis of Algorithms",
            };
            return {
                code,
                title: detail?.name ?? defaultNames[code] ?? `${code} Core Course`,
                credits: detail?.credits ?? 4,
                tag: normalizeModality(detail?.modality ?? "theory+lab"),
            };
        });

        const knownCredits = fallbackCourses.reduce((s, c) => s + (c.credits ?? 0), 0);
        semesters.push({
            id: "term-1",
            label: "Semester I: Target Core",
            sublabel: `${fallbackCourses.length} Courses · ${knownCredits} Credits`,
            credits: knownCredits,
            courses: fallbackCourses,
        });
    }

    return { semesters, summerBridge };
}

/**
 * Builds pathway option tabs with descriptive subtitles and workload tags.
 */
export function pathwaysToOptions(pathways: Pathway[]): PathwayOption[] {
    return pathways.map((p) => {
        const termLabel = `${p.terms} Semester${p.terms === 1 ? "" : "s"}`;
        const descriptions: Record<string, string> = {
            FASTEST: "Accelerated graduation schedule with intensive summer bridge",
            BALANCED: "Optimal credit distribution aligned with UGC workload norms",
            MAX_PRESERVATION: "Maximum transfer credit retention from prior transcript",
        };
        const subtitle =
            descriptions[p.mode] ??
            (p.bridge_burden > 0
                ? `${Math.round(p.bridge_burden * 100)}% bridge burden · ${termLabel}`
                : `Direct transfer · ${termLabel}`);

        return {
            key: p.mode,
            title: MODE_LABELS[p.mode] ?? p.mode,
            creditLine: termLabel,
            subtitle,
        };
    });
}
