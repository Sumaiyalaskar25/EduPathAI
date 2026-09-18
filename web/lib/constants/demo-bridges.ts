export interface BridgeDetail {
  id: string;
  provider: "NPTEL" | "SWAYAM" | "V-Lab";
  title: string;
  description: string;
  durationHours: number;
  weeks: number;
  coverage: number; // 0..1
  competencies: string[];
  assessmentAvailable: boolean;
  selfPaced: boolean;
  institutionApproved: boolean;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  resourceUrl: string;
  enrollmentDeadline: string;
  satisfiesGapIds: string[];
  prerequisites: string[];
}

export const DEMO_BRIDGES: BridgeDetail[] = [
  {
    id: "nptel-algo-3-4",
    provider: "NPTEL",
    title: "Analysis of Algorithms Unit 3 & 4",
    description:
      "Covers asymptotic analysis, amortized complexity, advanced data structures, and graph algorithm fundamentals aligned to NEP 2020 CS curriculum.",
    durationHours: 18,
    weeks: 6,
    coverage: 1.0,
    competencies: [
      "Amortized complexity analysis",
      "Balanced tree structures",
      "Hash-based data structures",
      "Graph traversal & shortest paths",
    ],
    assessmentAvailable: true,
    selfPaced: false,
    institutionApproved: true,
    language: "English",
    level: "Intermediate",
    resourceUrl: "https://nptel.ac.in/courses/106106145",
    enrollmentDeadline: "2026-10-15",
    satisfiesGapIds: ["CAL-AL-201", "CAL-GT-601"],
    prerequisites: ["Basic algorithms", "Programming fundamentals"],
  },
  {
    id: "swayam-adv-thinking",
    provider: "SWAYAM",
    title: "Advanced Algorithmic Thinking Micro-Module",
    description:
      "Compact self-paced module covering dynamic programming, greedy algorithms, and complexity patterns across real-world problems.",
    durationHours: 12,
    weeks: 4,
    coverage: 0.75,
    competencies: [
      "Dynamic programming",
      "Greedy algorithms",
      "Complexity tradeoffs",
    ],
    assessmentAvailable: true,
    selfPaced: true,
    institutionApproved: true,
    language: "English",
    level: "Intermediate",
    resourceUrl: "https://swayam.gov.in",
    enrollmentDeadline: "2026-11-01",
    satisfiesGapIds: ["CAL-AL-201"],
    prerequisites: ["Data structures"],
  },
  {
    id: "vlab-network-flow",
    provider: "V-Lab",
    title: "Network Flow Simulation Lab",
    description:
      "Hands-on virtual lab simulating max-flow, min-cut, and network optimization problems on real-world graphs.",
    durationHours: 6,
    weeks: 2,
    coverage: 0.6,
    competencies: [
      "Max-flow min-cut theorem",
      "Ford-Fulkerson algorithm",
      "Bipartite matching",
    ],
    assessmentAvailable: false,
    selfPaced: true,
    institutionApproved: false,
    language: "English",
    level: "Advanced",
    resourceUrl: "https://vlab.co.in",
    enrollmentDeadline: "2026-10-30",
    satisfiesGapIds: ["CAL-GT-601"],
    prerequisites: ["Graph theory basics"],
  },
];

export function getBridgeById(id: string): BridgeDetail | undefined {
  return DEMO_BRIDGES.find((b) => b.id === id);
}