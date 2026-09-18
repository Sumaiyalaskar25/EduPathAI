export interface CompliancePillar {
  id: string;
  label: string;
  description: string;
  score: number; // 0..1
  target: number;
  status: "on-track" | "attention" | "behind";
}

export const DEMO_COMPLIANCE_PILLARS: CompliancePillar[] = [
  {
    id: "credit",
    label: "Credit Framework Alignment",
    description: "Recognition reflects NEP 2020 credit-transfer guidelines across all partner HEIs.",
    score: 0.87,
    target: 0.85,
    status: "on-track",
  },
  {
    id: "mobility",
    label: "Multi-Entry / Multi-Exit Support",
    description: "Pathways accommodate lateral entry and partial credit preservation.",
    score: 0.79,
    target: 0.80,
    status: "attention",
  },
  {
    id: "abc",
    label: "ABC / APAAR Integration",
    description: "Identity linkage and academic bank of credits synchronized with national infrastructure.",
    score: 0.94,
    target: 0.90,
    status: "on-track",
  },
  {
    id: "dpdp",
    label: "DPDP Act 2023 Compliance",
    description: "Data minimization, consent logs, encryption, right-to-erasure, purpose limitation.",
    score: 1.0,
    target: 1.0,
    status: "on-track",
  },
  {
    id: "audit",
    label: "Tamper-Evident Audit",
    description: "SHA-256 hash-chained decisions with KMS-envelope keys and S3 Object Lock.",
    score: 1.0,
    target: 1.0,
    status: "on-track",
  },
  {
    id: "review",
    label: "Human-in-the-Loop Gate",
    description: "Every AI-proposed decision reviewed by institutional BoS before publication.",
    score: 0.98,
    target: 0.95,
    status: "on-track",
  },
];

export interface PolicyBrief {
  id: string;
  title: string;
  summary: string;
  recommendation: string;
  affectedStates: string[];
  affectedHEIs: number;
  priority: "high" | "medium" | "low";
  generatedAt: string;
  category: "Curriculum" | "Framework" | "Infrastructure" | "Policy";
}

export const DEMO_POLICY_BRIEFS: PolicyBrief[] = [
  {
    id: "pb1",
    title: "Advanced Graph Algorithms — 78% bridge rate",
    summary:
      "Across 4 IITs and 6 state universities, incoming students show a consistent gap in network-flow and advanced graph competencies at Bloom Level 3+.",
    recommendation:
      "Recommend adding a compulsory network-flow module to the NEP 2020 CS curriculum at the 3rd-year level.",
    affectedStates: ["Maharashtra", "Tamil Nadu", "Delhi", "West Bengal"],
    affectedHEIs: 10,
    priority: "high",
    generatedAt: "2026-09-11T09:00:00Z",
    category: "Curriculum",
  },
  {
    id: "pb2",
    title: "West Bengal → IIT Bombay recognition lag",
    summary:
      "Recognition rate of 66% is 6 points below the national median. Course equivalency alignment requires revision.",
    recommendation:
      "Recommend a joint working group between SPPU, University of Calcutta, Jadavpur University, and IIT Bombay to align outcome definitions.",
    affectedStates: ["West Bengal", "Maharashtra"],
    affectedHEIs: 12,
    priority: "high",
    generatedAt: "2026-09-10T14:30:00Z",
    category: "Framework",
  },
  {
    id: "pb3",
    title: "Recognition rate trending +14% since March",
    summary:
      "AI consensus + board approvals are converging. Cross-model agreement rose to 91% across Gemini and DeepSeek.",
    recommendation:
      "Recommend scaling up the pattern across Tier-2 HEIs to accelerate adoption.",
    affectedStates: ["Karnataka", "Telangana", "Maharashtra", "Delhi NCR"],
    affectedHEIs: 84,
    priority: "low",
    generatedAt: "2026-09-09T11:15:00Z",
    category: "Policy",
  },
  {
    id: "pb4",
    title: "V-Lab integration gap in 3 southern states",
    summary:
      "V-Lab practical credit recognition is 22% lower than lecture-based credit recognition in Tamil Nadu, Kerala, and Andhra Pradesh.",
    recommendation:
      "Recommend onboarding 24 additional V-Lab channels and revising practical-credit recognition policy.",
    affectedStates: ["Tamil Nadu", "Kerala", "Andhra Pradesh"],
    affectedHEIs: 46,
    priority: "medium",
    generatedAt: "2026-09-08T16:45:00Z",
    category: "Infrastructure",
  },
  {
    id: "pb5",
    title: "Cache hit rate exceeds 85% — cost efficiency milestone",
    summary:
      "AI Gateway cache hit rate crossed 85%. LLM cost per decision reduced by 62% since launch.",
    recommendation:
      "Recommend expanding semantic cache TTL from 7d to 30d for high-traffic curriculum versions.",
    affectedStates: ["All India"],
    affectedHEIs: 840,
    priority: "low",
    generatedAt: "2026-09-07T08:00:00Z",
    category: "Infrastructure",
  },
];

export const DEMO_POLICY_STATS = {
  overallCompliance: 0.93,
  complianceTarget: 0.90,
  activeBriefs: 5,
  heisCovered: 840,
  studentsBenefited: 1420000,
  yearOverYearGrowth: 0.34,
};