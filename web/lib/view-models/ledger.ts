/**
 * web/lib/view-models/ledger.ts
 * ────────────────────────────────────────────────────────────────
 * Display-only shape for one row of the audit decision timeline.
 * Previously lived in lib/constants/demo-ledger.ts alongside fake
 * fixture events (DEMO_LEDGER_EVENTS, DEMO_BUNDLE_JSON) that had no
 * real callers — this keeps only the type.
 * ────────────────────────────────────────────────────────────────
 */

export interface LedgerEvent {
    id: string;
    kind: "identity" | "ai" | "gate" | "human";
    title: string;
    subtitle: string;
    badge?: { label: string; tone: "neutral" | "amber" | "green" };
    rightLabel?: string;
    highlight?: boolean;
    overlay?: string;
    icon: "check" | "sparkle" | "warn" | "user";
}
