/**
 * web/lib/transforms/audit.ts
 */
export interface ParsedRecommendation {
    summary: string;
    headline: string;
    directCount: number;
    bridgeCount: number;
    missingCount: number;
    reviewCount: number;
    confidence?: number;
    provider?: string;
    model?: string;
}

/**
 * ai_recommendation is stored as a JSON string (services/matching/explain.py):
 * either an LLM-narrated `{summary, provider, model, confidence, deterministic_summary}`
 * when a provider key is configured, or the plain deterministic
 * `{direct, bridge, missing, review, policy_conflict}` counts otherwise.
 */
export function parseAiRecommendation(raw: string): ParsedRecommendation {
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.summary === "string") {
            return {
                summary: parsed.summary,
                headline: parsed.headline || parsed.summary.split(".")[0] || "Curriculum Pathway Alignment",
                directCount: parsed.direct ?? 1,
                bridgeCount: parsed.bridge ?? 2,
                missingCount: parsed.missing ?? 0,
                reviewCount: parsed.review ?? 0,
                confidence: parsed.confidence,
                provider: parsed.provider,
                model: parsed.model,
            };
        }
        if ("direct" in parsed || "bridge" in parsed) {
            const parts: string[] = [];
            const direct = Number(parsed.direct || 0);
            const bridge = Number(parsed.bridge || 0);
            const missing = Number(parsed.missing || 0);
            const review = Number(parsed.review || 0);
            const conflict = Number(parsed.policy_conflict || 0);

            if (direct) parts.push(`${direct} direct match${direct === 1 ? "" : "es"}`);
            if (bridge) parts.push(`${bridge} needing a bridge`);
            if (missing) parts.push(`${missing} missing`);
            if (review) parts.push(`${review} flagged for review`);
            if (conflict) parts.push(`${conflict} policy conflict${conflict === 1 ? "" : "s"}`);

            const headline = direct > 0 && bridge > 0
                ? `${direct} Direct Transfer · ${bridge} Bridge Pathway`
                : direct > 0
                ? `${direct} Direct Transfer Validated`
                : `${bridge} Bridge Modules Assigned`;

            return {
                summary: parts.length ? parts.join(", ") : "No recognizable courses in this pass.",
                headline,
                directCount: direct,
                bridgeCount: bridge,
                missingCount: missing,
                reviewCount: review,
                confidence: parsed.confidence,
                provider: parsed.provider,
                model: parsed.model,
            };
        }
        return {
            summary: raw,
            headline: raw.slice(0, 45),
            directCount: 0,
            bridgeCount: 0,
            missingCount: 0,
            reviewCount: 0,
        };
    } catch {
        return {
            summary: raw,
            headline: raw.slice(0, 45) || "Recognition Event",
            directCount: 0,
            bridgeCount: 0,
            missingCount: 0,
            reviewCount: 0,
        };
    }
}
