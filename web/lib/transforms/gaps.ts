/**
 * web/lib/transforms/gaps.ts
 * ────────────────────────────────────────────────────────────────
 * Converts real PathwayResponse (matches / gaps / bridges) into
 * clean, professionally formatted view models for the Gap Analysis UI.
 * ────────────────────────────────────────────────────────────────
 */
import type { MatchResult, Gap, Bridge } from "@/lib/api/types";
import type { OutcomeRow, BridgeCourse } from "@/lib/view-models/gaps";
import type { RadarAxisPoint } from "@/components/gaps/BloomRadar";

export function matchesAndGapsToOutcomeRows(matches: MatchResult[], gaps: Gap[]): OutcomeRow[] {
    const rows: OutcomeRow[] = [];
    let counter = 1;

    // 1. Process evaluated course matches
    matches.forEach((m) => {
        const isGap = m.outcome_coverage < 0.6 || m.missing_outcomes.length > 0;
        const serialStr = counter < 10 ? `0${counter}` : `${counter}`;
        counter++;

        const defaultNames: Record<string, string> = {
            "CS-341": "Compiler Architecture",
            "CS-501": "Advanced Language Processors",
            "CS-201": "Data Structures & Complexity",
            "CS-502": "Design & Analysis of Algorithms",
            "BCA-101": "Programming Fundamentals in C",
            "CS-101": "Introduction to Computing & Logic",
        };

        const sourceLabel = defaultNames[m.source_course_id]
            ? `${m.source_course_id} · ${defaultNames[m.source_course_id]}`
            : m.source_course_id;

        const targetLabel = defaultNames[m.target_course_id]
            ? `${m.target_course_id} · ${defaultNames[m.target_course_id]}`
            : m.target_course_id;

        rows.push({
            id: serialStr,
            sourceTopic: sourceLabel,
            targetTopic: targetLabel,
            status: isGap ? "gap" : "match",
            matchBadge: !isGap
                ? `DIRECT MATCH (${Math.round(m.outcome_coverage * 100)}% outcome coverage)`
                : undefined,
            gapBadge: isGap
                ? `GAP: ${m.missing_outcomes[0] ?? "Remediation required for target syllabus"}`
                : undefined,
        });
    });

    // 2. Track already reported missing outcomes so we don't repeat them
    const reportedOutcomes = new Set<string>();
    matches.forEach((m) => m.missing_outcomes.forEach((o) => reportedOutcomes.add(o.toLowerCase())));

    // 3. Process residual syllabus gaps not tied to a course match
    gaps.forEach((g) => {
        const outcomes = g.missing_outcomes.length ? g.missing_outcomes : [g.description];
        outcomes.forEach((outcome) => {
            if (reportedOutcomes.has(outcome.toLowerCase())) return;
            reportedOutcomes.add(outcome.toLowerCase());

            const serialStr = counter < 10 ? `0${counter}` : `${counter}`;
            counter++;

            rows.push({
                id: serialStr,
                sourceTopic: "Target Requirement",
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
            { axis: "Semantic", source: 80, target: 90 },
            { axis: "Coverage", source: 75, target: 85 },
            { axis: "Assessment", source: 85, target: 95 },
            { axis: "Credits", source: 90, target: 100 },
            { axis: "Domain", source: 95, target: 100 },
        ];
    }
    const avg = (f: (m: MatchResult) => number) => (matches.reduce((s, m) => s + f(m), 0) / matches.length) * 100;
    const min = (f: (m: MatchResult) => number) => Math.min(...matches.map(f)) * 100;

    const dims: Array<[string, (m: MatchResult) => number]> = [
        ["Semantic", (m) => m.semantic_score],
        ["Coverage", (m) => m.outcome_coverage],
        ["Assessment", (m) => m.assessment_match],
        ["Credits", (m) => (m.credit_compatibility ? 1 : 0.8)],
        ["Domain", (m) => (m.domain_alignment ? 1 : 0.7)],
    ];

    return dims.map(([axis, f]) => ({
        axis,
        source: Math.max(20, Math.round(min(f))),
        target: Math.max(30, Math.round(avg(f))),
    }));
}

export function bridgesToCourseCards(bridges: Bridge[]): BridgeCourse[] {
    // Deduplicate bridges by resource_id/title so duplicate cards are eliminated
    const seen = new Set<string>();
    const unique = bridges.filter((b) => {
        const key = `${b.resource_provider}-${b.resource_id}-${b.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return unique.map((b) => ({
        id: b.bridge_id,
        provider: b.resource_provider,
        title: b.title || b.resource_id.replace(/-/g, " ").toUpperCase(),
        durationHours: b.duration_hours,
        coverage: `${Math.round(b.competency_coverage * 100)}% Outcome Coverage`,
        tags: [
            b.assessment_available ? "Proctored Exam" : "Self-Paced",
            b.prerequisite_met ? "Prerequisites Met" : "Prerequisite Pending",
        ],
    }));
}
