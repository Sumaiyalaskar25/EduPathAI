/**
 * web/lib/transforms/recognition.ts
 * ────────────────────────────────────────────────────────────────
 * ONE normalized view of a PathwayResponse's `recognition` block.
 * Every screen that shows a "recognized %" or a direct/bridge/
 * missing/review/policy-conflict breakdown must derive it from here
 * instead of recomputing it inline — three call sites (student
 * dashboard, pathways page, tree page) were each doing their own
 * version of this before.
 * ────────────────────────────────────────────────────────────────
 */
import type { RecognitionSummary } from "@/lib/api/types";

export interface RecognitionView {
    direct: number;
    bridge: number;
    missing: number;
    review: number;
    policyConflict: number;
    total: number;
    /**
     * recognizedPercent = round(((direct + bridge) / total) * 100)
     *
     * Direct matches and bridge-eligible courses both count as
     * "recognized" (a bridge is a known, feasible path to recognition);
     * missing, review, and policy-conflict courses do not, since none of
     * those states currently resolve to credit. 0 when there's no
     * recognition data yet (never a placeholder number).
     */
    recognizedPercent: number;
}

export function toRecognitionView(r: RecognitionSummary | undefined): RecognitionView {
    const direct = r?.direct ?? 0;
    const bridge = r?.bridge ?? 0;
    const missing = r?.missing ?? 0;
    const review = r?.review ?? 0;
    const policyConflict = r?.policy_conflict ?? 0;
    const total = direct + bridge + missing + review + policyConflict;
    const recognizedPercent = total ? Math.round(((direct + bridge) / total) * 100) : 0;
    return { direct, bridge, missing, review, policyConflict, total, recognizedPercent };
}

export interface RecognitionBucket {
    key: "Direct" | "Bridge" | "Missing" | "Review" | "Policy Conflict";
    value: number;
    color: string;
}

export function recognitionToBreakdown(v: RecognitionView): RecognitionBucket[] {
    return [
        { key: "Direct", value: v.direct, color: "rgb(16 185 129)" },
        { key: "Bridge", value: v.bridge, color: "rgb(245 158 11)" },
        { key: "Missing", value: v.missing, color: "rgb(244 63 94)" },
        { key: "Review", value: v.review, color: "rgb(100 116 139)" },
        { key: "Policy Conflict", value: v.policyConflict, color: "rgb(190 24 93)" },
    ];
}
