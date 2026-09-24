/**
 * web/lib/transforms/gaps.ts
 * ────────────────────────────────────────────────────────────────
 * Converts the real PathwayResponse (matches / gaps / bridges) into
 * the shapes components/gaps/* already render.
 * ────────────────────────────────────────────────────────────────
 */
import type { MatchResult, Gap, Bridge } from "@/lib/api/types";
import type { OutcomeRow, BridgeCourse } from "@/lib/view-models/gaps";
import type { RadarAxisPoint } from "@/components/gaps/BloomRadar";

export function matchesAndGapsToOutcomeRows(matches: MatchResult[], gaps: Gap[]): OutcomeRow[] {
    const rows: OutcomeRow[] = [];

    matches.forEach((m, i) => {
        const isGap = m.outcome_coverage < 0.6 || m.missing_outcomes.length > 0;
        rows.push({
            id: `match-${i}`,
            sourceTopic: m.source_course_id,
            targetTopic: m.target_course_id,
            status: isGap ? "gap" : "match",
            matchBadge: !isGap
                ? `DIRECT MATCH (${Math.round(m.outcome_coverage * 100)}% outcome coverage)`
                : undefined,
            gapBadge: isGap
                ? `GAP: ${m.missing_outcomes[0] ?? "Below coverage threshold"}`
                : undefined,
        });
    });

    gaps.forEach((g, i) => {
        (g.missing_outcomes.length ? g.missing_outcomes : [g.description]).forEach((outcome, j) => {
            rows.push({
                id: `gap-${i}-${j}`,
                sourceTopic: "—",
                targetTopic: outcome,
                status: "gap",
                gapBadge: `${g.gap_type}: ${g.description}`,
            });
        });
    });

    return rows;
}

export function matchesToRadar(matches: MatchResult[]): RadarAxisPoint[] {
    if (matches.length === 0) {
        return [
            { axis: "Semantic", source: 0, target: 0 },
            { axis: "Coverage", source: 0, target: 0 },
            { axis: "Assessment", source: 0, target: 0 },
            { axis: "Credits", source: 0, target: 0 },
            { axis: "Domain", source: 0, target: 0 },
        ];
    }
    const avg = (f: (m: MatchResult) => number) => (matches.reduce((s, m) => s + f(m), 0) / matches.length) * 100;
    const min = (f: (m: MatchResult) => number) => Math.min(...matches.map(f)) * 100;

    const dims: Array<[string, (m: MatchResult) => number]> = [
        ["Semantic", (m) => m.semantic_score],
        ["Coverage", (m) => m.outcome_coverage],
        ["Assessment", (m) => m.assessment_match],
        ["Credits", (m) => (m.credit_compatibility ? 1 : 0)],
        ["Domain", (m) => (m.domain_alignment ? 1 : 0)],
    ];

    return dims.map(([axis, f]) => ({ axis, source: Math.round(min(f)), target: Math.round(avg(f)) }));
}

export function bridgesToCourseCards(bridges: Bridge[]): BridgeCourse[] {
    return bridges.map((b) => ({
        id: b.bridge_id,
        provider: b.resource_provider,
        title: b.title || b.resource_id,
        durationHours: b.duration_hours,
        coverage: `${Math.round(b.competency_coverage * 100)}% Outcome Coverage`,
        tags: [
            b.assessment_available ? "Assessment Included" : "Self-Paced",
            b.prerequisite_met ? "Prerequisites Met" : "Prerequisite Pending",
        ],
    }));
}
