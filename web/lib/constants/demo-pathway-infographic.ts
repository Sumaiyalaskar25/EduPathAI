export const DEMO_STATS = {
  recognized: 48,
  bridges: 3,
  semsRemaining: 4,
  alignment: 72,
};

export const DEMO_RECOGNITION_BREAKDOWN = [
  { name: "Direct",  value: 48, color: "rgb(16 185 129)" },
  { name: "Bridge",  value: 14, color: "rgb(245 158 11)" },
  { name: "Missing", value: 6,  color: "rgb(244 63 94)" },
  { name: "Review",  value: 2,  color: "rgb(100 116 139)" },
];

export interface CourseMatchRow {
  id: string;
  sourceCode: string;
  sourceTitle: string;
  targetCode: string;
  targetTitle: string;
  status: "direct" | "bridge" | "missing";
  score: number;
}

export const DEMO_COURSE_MATCHES: CourseMatchRow[] = [
  { id: "m1", sourceCode: "CAL-DS-101", sourceTitle: "Data Structures",       targetCode: "IIT-ADS-500", targetTitle: "Advanced DS & Algorithms",       status: "direct",  score: 0.94 },
  { id: "m2", sourceCode: "CAL-AL-201", sourceTitle: "Algorithm Analysis",    targetCode: "IIT-AMZ-620", targetTitle: "Amortized Complexity",           status: "bridge",  score: 0.78 },
  { id: "m3", sourceCode: "CAL-DB-301", sourceTitle: "Database Systems",      targetCode: "IIT-ADS-510", targetTitle: "Advanced Sequences",             status: "direct",  score: 0.91 },
  { id: "m4", sourceCode: "CAL-OS-401", sourceTitle: "Operating Systems",     targetCode: "IIT-BRT-701", targetTitle: "Balanced Trees & Red-Black",     status: "bridge",  score: 0.68 },
  { id: "m5", sourceCode: "CAL-NW-501", sourceTitle: "Computer Networks",     targetCode: "IIT-HSH-810", targetTitle: "External Sorting & Hashing",     status: "direct",  score: 0.88 },
  { id: "m6", sourceCode: "CAL-GT-601", sourceTitle: "Graph Theory",          targetCode: "IIT-NFL-920", targetTitle: "Network Flow Algorithms",        status: "missing", score: 0.42 },
];

export interface RoadmapStep {
  id: string;
  label: string;
  sub: string;
  kind: "current" | "bridge" | "semester";
}

export const DEMO_ROADMAP: RoadmapStep[] = [
  { id: "now",  label: "Now",       sub: "48 credits",   kind: "current" },
  { id: "sum",  label: "Summer",    sub: "Bridge · 4wk", kind: "bridge" },
  { id: "sem5", label: "Semester V",   sub: "18 credits",   kind: "semester" },
  { id: "sem6", label: "Semester VI",  sub: "16 credits",   kind: "semester" },
  { id: "sem7", label: "Semester VII", sub: "14 credits",   kind: "semester" },
  { id: "sem8", label: "Semester VIII",sub: "12 credits",   kind: "semester" },
];