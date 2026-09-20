/**
 * web/lib/transforms/audit.ts
 */
export interface ParsedRecommendation {
    summary: string;
    confidence?: number;
    provider?: string;
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
            return { summary: parsed.summary, confidence: parsed.confidence, provider: parsed.provider };
        }
        if ("direct" in parsed || "bridge" in parsed) {
            const parts: string[] = [];
            if (parsed.direct) parts.push(`${parsed.direct} direct match${parsed.direct === 1 ? "" : "es"}`);
            if (parsed.bridge) parts.push(`${parsed.bridge} needing a bridge`);
            if (parsed.missing) parts.push(`${parsed.missing} missing`);
            if (parsed.review) parts.push(`${parsed.review} flagged for review`);
            if (parsed.policy_conflict) parts.push(`${parsed.policy_conflict} policy conflict${parsed.policy_conflict === 1 ? "" : "s"}`);
            return { summary: parts.length ? parts.join(", ") : "No recognizable courses in this pass." };
        }
        return { summary: raw };
    } catch {
        return { summary: raw };
    }
}
