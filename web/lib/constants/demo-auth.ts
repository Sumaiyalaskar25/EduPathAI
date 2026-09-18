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

export const DEMO_AUTH_BADGES = {
  hashVerified: "hash-verified",
  certification: "ISO/IEC 27001",
  certificationSub: "CERTIFIED",
  compliance: "NACF Compliant",
  complianceFull: "National Academic Credit Framework (NACF) Compliant",
};