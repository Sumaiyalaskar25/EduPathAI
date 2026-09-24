/**
 * web/lib/view-models/gaps.ts
 * ────────────────────────────────────────────────────────────────
 * Display-only shapes for the gaps page components. These used to
 * live in lib/constants/demo-gaps.ts alongside fake business data —
 * moved out so "demo" no longer appears anywhere in the types real
 * pages depend on. No runtime constants here, only types.
 * ────────────────────────────────────────────────────────────────
 */

export interface OutcomeRow {
    id: string;
    sourceTopic: string;
    targetTopic: string;
    status: "match" | "gap";
    gapBadge?: string;
    matchBadge?: string;
}

export interface BridgeCourse {
    id: string;
    /** Real resource_provider text (e.g. "NPTEL", "SWAYAM", "VLAB", "HEI") —
     *  open string, not a 3-value enum: the old literal union silently
     *  relabeled any unrecognized provider as "NPTEL". */
    provider: string;
    title: string;
    durationHours: number;
    coverage?: string;
    tags: string[];
}
