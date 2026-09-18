export const DEMO_IDENTITY = {
  fullName: "Aarav Sharma",
  apaar: "9081 **** 2201",
  abcId: "ABC-2026-8841-2201",
  programme: "B.Tech Computer Science & Engineering",
  institution: "University of Calcutta",
  targetInstitution: "IIT Bombay",
  enrolledOn: "2022-08-01",
  digilockerLinked: true,
  biometricVerified: true,
};

export interface ConsentEntry {
  id: string;
  scope: string;
  purpose: string;
  grantedAt: string;
  expiresAt: string;
  active: boolean;
}

export const DEMO_CONSENTS: ConsentEntry[] = [
  {
    id: "c1",
    scope: "APAAR / ABC identity fetch",
    purpose: "Verify academic records for pathway planning",
    grantedAt: "2024-08-12",
    expiresAt: "2027-08-12",
    active: true,
  },
  {
    id: "c2",
    scope: "DigiLocker document access",
    purpose: "Retrieve transcripts for course matching",
    grantedAt: "2024-08-12",
    expiresAt: "2027-08-12",
    active: true,
  },
  {
    id: "c3",
    scope: "AI processing (Gemini, DeepSeek)",
    purpose: "Structured course outcome extraction",
    grantedAt: "2024-09-04",
    expiresAt: "2026-09-04",
    active: true,
  },
  {
    id: "c4",
    scope: "Learning resource access (NPTEL, SWAYAM)",
    purpose: "Recommend bridge courses",
    grantedAt: "2024-11-18",
    expiresAt: "2026-11-18",
    active: true,
  },
];

export interface DecisionRecord {
  id: string;
  decisionId: string;
  summary: string;
  status: "APPROVED" | "PENDING" | "REVIEW";
  decidedAt: string;
  auditor: string;
}

export const DEMO_DECISIONS: DecisionRecord[] = [
  {
    id: "d1",
    decisionId: "dec-9f83b165-a1",
    summary: "Distributed Systems (CS-401) · BRIDGE REQUIRED",
    status: "APPROVED",
    decidedAt: "2026-09-11T10:14:00Z",
    auditor: "Prof. S. Sen · BoS Convener",
  },
  {
    id: "d2",
    decisionId: "dec-4a7b9c2d-7f",
    summary: "Computer Networks · DIRECT MATCH",
    status: "APPROVED",
    decidedAt: "2026-09-08T14:22:00Z",
    auditor: "Prof. S. Sen · BoS Convener",
  },
  {
    id: "d3",
    decisionId: "dec-1aa775e2-b3",
    summary: "Advanced Graph Algorithms · BRIDGE REQUIRED",
    status: "PENDING",
    decidedAt: "2026-09-18T09:05:00Z",
    auditor: "Awaiting review",
  },
];

export const DEMO_SECURITY = {
  sessionCount: 4,
  lastSignIn: "2026-09-18T06:45:00Z",
  lastSignInLocation: "Kolkata, India",
  mfaEnabled: true,
  chainIntegrity: "100% Verified",
  rawDocsArchived: 3,
};