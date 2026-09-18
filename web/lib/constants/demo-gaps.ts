export interface OutcomeRow {
  id: string;
  sourceTopic: string;
  targetTopic: string;
  status: "match" | "gap";
  gapBadge?: string;
  matchBadge?: string;
}

export const DEMO_SOURCE_TARGET = {
  source: "University of Calcutta (Data Structures)",
  target: "IIT Delhi (Advanced Data Structures & Algorithms)",
};

export const DEMO_OUTCOME_ROWS: OutcomeRow[] = [
  { id: "1", sourceTopic: "Memory Allocation",       targetTopic: "Dynamic Allocation",              status: "match" },
  { id: "2", sourceTopic: "Complexity Analysis",     targetTopic: "Amortized Complexity",            status: "gap" },
  { id: "3", sourceTopic: "Linear Arrays & Lists",   targetTopic: "Advanced Sequences",              status: "match" },
  { id: "4", sourceTopic: "Trees & Simple Search",   targetTopic: "Balanced Trees & Red-Black Trees", status: "gap" },
  { id: "5", sourceTopic: "Search & Sort Algorithms",targetTopic: "External Sorting & Hashing",      status: "match" },
  {
    id: "6",
    sourceTopic: "Basic Graph Traversal",
    targetTopic: "Advanced Graph & Network Flows",
    status: "gap",
    matchBadge: "DIRECT MATCH (Bloom Level 3 - Apply)",
    gapBadge: "GAP DETECTED: Missing Network Flow Algorithms",
  },
];

/** Radar data — 5 axes: Analyze, Create, Bloom, Learning, Growth. Values 0-100. */
export const DEMO_BLOOM_RADAR = [
  { axis: "Analyze",  source: 65, target: 88 },
  { axis: "Create",   source: 42, target: 70 },
  { axis: "Bloom",    source: 78, target: 92 },
  { axis: "Learning", source: 60, target: 82 },
  { axis: "Growth",   source: 55, target: 80 },
];

export interface BridgeCourse {
  id: string;
  provider: "NPTEL" | "SWAYAM" | "V-Lab";
  title: string;
  durationHours: number;
  coverage?: string;
  tags: string[];
}

export const DEMO_BRIDGE_COURSES: BridgeCourse[] = [
  {
    id: "nptel-1",
    provider: "NPTEL",
    title: "Analysis of Algorithms Unit 3 & 4",
    durationHours: 18,
    coverage: "100% Outcome Coverage",
    tags: ["Online Lab Included", "Institution Approved"],
  },
  {
    id: "swayam-1",
    provider: "SWAYAM",
    title: "Advanced Algorithmic Thinking Micro-Module",
    durationHours: 12,
    tags: ["Self-Paced"],
  },
];