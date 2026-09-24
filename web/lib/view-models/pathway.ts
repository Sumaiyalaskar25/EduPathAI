/**
 * web/lib/view-models/pathway.ts
 * ────────────────────────────────────────────────────────────────
 * Display-only shapes for pathway/plan components. Previously in
 * lib/constants/demo-pathways.ts next to fabricated fixture data —
 * moved out so nothing "demo" remains in the types real pages use.
 * ────────────────────────────────────────────────────────────────
 */
import type { PathwayMode } from "@/lib/api/types";

export interface PathwayOption {
    key: PathwayMode;
    title: string;
    creditLine: string;
    subtitle: string;
}

export interface CourseCard {
    code: string;
    title: string;
    credits: number | null;
    tag: string;
}

export interface SemesterColumn {
    id: string;
    label: string;
    sublabel: string;
    credits: number;
    courses: CourseCard[];
}

export interface SummerBridge {
    title: string;
    provider: string;
    duration: string;
    credits: number | null;
}
