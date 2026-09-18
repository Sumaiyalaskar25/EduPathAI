export const DEMO_GOV_STATS = {
  totalStudents: 1420000,
  heisIntegrated: 840,
  creditsTransferred: 14200000,
  errorTolerance: 0.01,
  avgDecisionTime: "2.4s",
  recognitionRate: 0.72,
};

export interface MobilityFlow {
  source: string;
  target: string;
  students: number;
  recognition: number; // 0..1
}

export const DEMO_MOBILITY_FLOWS: MobilityFlow[] = [
  { source: "University of Calcutta", target: "IIT Bombay", students: 1240, recognition: 0.72 },
  { source: "Anna University", target: "IIT Delhi", students: 982, recognition: 0.81 },
  { source: "VIT Vellore", target: "IIT Kanpur", students: 741, recognition: 0.88 },
  { source: "NIT Trichy", target: "IIT Madras", students: 615, recognition: 0.79 },
  { source: "BITS Pilani", target: "IIT Bombay", students: 543, recognition: 0.91 },
  { source: "Delhi University", target: "IIT Delhi", students: 428, recognition: 0.68 },
  { source: "Savitribai Phule Pune Univ", target: "IIT Bombay", students: 387, recognition: 0.65 },
];

export interface FrictionCourse {
  course: string;
  bridgeRate: number; // 0..1
  missingRate: number; // 0..1
  decisions: number;
}

export const DEMO_FRICTION_COURSES: FrictionCourse[] = [
  { course: "Advanced Graph Algorithms", bridgeRate: 0.78, missingRate: 0.22, decisions: 340 },
  { course: "Distributed Systems",        bridgeRate: 0.64, missingRate: 0.18, decisions: 512 },
  { course: "Machine Learning",           bridgeRate: 0.42, missingRate: 0.08, decisions: 780 },
  { course: "Operating Systems",          bridgeRate: 0.38, missingRate: 0.05, decisions: 640 },
  { course: "Database Systems",           bridgeRate: 0.21, missingRate: 0.04, decisions: 890 },
  { course: "Data Structures",            bridgeRate: 0.14, missingRate: 0.02, decisions: 1120 },
  { course: "Computer Networks",          bridgeRate: 0.11, missingRate: 0.03, decisions: 720 },
];

export interface TrendPoint {
  month: string;
  decisions: number;
  recognition: number; // 0..1
}

export const DEMO_MOBILITY_TREND: TrendPoint[] = [
  { month: "Mar", decisions: 8200,  recognition: 0.58 },
  { month: "Apr", decisions: 11400, recognition: 0.61 },
  { month: "May", decisions: 14200, recognition: 0.63 },
  { month: "Jun", decisions: 16800, recognition: 0.66 },
  { month: "Jul", decisions: 19500, recognition: 0.69 },
  { month: "Aug", decisions: 22100, recognition: 0.71 },
  { month: "Sep", decisions: 24800, recognition: 0.72 },
];

export interface RegionSignal {
  state: string;
  students: number;
  heis: number;
  recognition: number;
}

export const DEMO_REGION_SIGNALS: RegionSignal[] = [
  { state: "Maharashtra",   students: 268000, heis: 142, recognition: 0.78 },
  { state: "Tamil Nadu",    students: 241000, heis: 128, recognition: 0.74 },
  { state: "Karnataka",     students: 198000, heis: 96,  recognition: 0.81 },
  { state: "Delhi NCR",     students: 187000, heis: 74,  recognition: 0.69 },
  { state: "Uttar Pradesh", students: 156000, heis: 88,  recognition: 0.63 },
  { state: "West Bengal",   students: 142000, heis: 68,  recognition: 0.66 },
  { state: "Telangana",     students: 128000, heis: 58,  recognition: 0.77 },
];

export interface PolicySignal {
  id: string;
  severity: "critical" | "attention" | "informational";
  title: string;
  description: string;
  affectedInstitutions: number;
}

export const DEMO_POLICY_SIGNALS: PolicySignal[] = [
  {
    id: "ps1",
    severity: "critical",
    title: "Advanced Graph Algorithms shows 78% bridge rate",
    description:
      "Consistent across 4 major institutions. Recommendation: update NEP 2020 credit framework to include network-flow competencies at Level 3.",
    affectedInstitutions: 4,
  },
  {
    id: "ps2",
    severity: "attention",
    title: "West Bengal → IIT Bombay recognition lags 6% below national median",
    description:
      "Data structure and OS equivalency alignment requires curriculum revision.",
    affectedInstitutions: 12,
  },
  {
    id: "ps3",
    severity: "informational",
    title: "Recognition rate trending up 14% since March",
    description:
      "AI consensus + board approvals are converging. Health of the recognition pipeline improving.",
    affectedInstitutions: 840,
  },
];

export const DEMO_LATENCY_STATS = {
  apiP50: "5ms",
  apiP95: "15ms",
  solverP50: "2.4s",
  solverP95: "16.8s",
  solverP99: "48.7s",
  llmP50: "3.2s",
  llmP95: "12.4s",
  cacheHitRate: 0.85,
};