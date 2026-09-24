/**
 * web/lib/constants/pathway-modes.ts
 * ────────────────────────────────────────────────────────────────
 * Human-friendly labels for the backend's PathwayMode enum values.
 * This is the one part of the old DEMO_PATHWAYS that was legitimate
 * static UI config (an enum → display-name mapping) rather than
 * fabricated numbers — those numbers now come from the real solved
 * pathway (see lib/transforms/pathway.ts#pathwaysToOptions).
 * ────────────────────────────────────────────────────────────────
 */
import type { PathwayMode } from "@/lib/api/types";

export const MODE_LABELS: Record<PathwayMode, string> = {
    FASTEST: "Fastest Path",
    BALANCED: "Balanced Path",
    MAX_PRESERVATION: "Maximum Preservation",
};
