/**
 * web/lib/constants/auth-ui.ts
 * ────────────────────────────────────────────────────────────────
 * Static UI config for the sign-in flow: role-selector copy, landing
 * nav links, and trust badges. Legitimately static (labels/icons, not
 * business data) — this file used to be lib/constants/demo-auth.ts,
 * but "demo" was misleading once the badge text stopped making false
 * certification claims (see AUTH_BADGES below).
 * ────────────────────────────────────────────────────────────────
 */

export type IdentityMode = "learner" | "bos" | "ministry";

export interface IdentityOption {
    key: IdentityMode;
    label: string;
    description: string;
}

export const IDENTITY_OPTIONS: IdentityOption[] = [
    {
        key: "learner",
        label: "Learner / APAAR",
        description: "Verify credits, build your academic tree",
    },
    {
        key: "bos",
        label: "Institutional BoS Reviewer",
        description: "Review and approve recognition decisions",
    },
    {
        key: "ministry",
        label: "Ministry / State Nodal Officer",
        description: "Monitor mobility patterns and policy signals",
    },
];

export const AUTH_NAV = [
    { href: "#framework", label: "Framework" },
    { href: "#network", label: "Institutional Network" },
    { href: "#simulator", label: "Credit Simulator" },
    { href: "#about", label: "About" },
];

export const AUTH_BADGES = {
    hashVerified: "hash-verified",
    // No ISO/IEC 27001 certification or NACF compliance audit backs this
    // deployment — those are specific, checkable claims this repo can't
    // support. Factual, unfalsifiable descriptions of what the system
    // actually does (hash-chained audit ledger, policy-gated recognition)
    // instead, per the security-claim-cleanup pass.
    certification: "Audit trail protected",
    certificationSub: "SHA-256 chained",
    compliance: "Policy-aware workflow",
    complianceFull: "Policy-aware recognition workflow",
};
