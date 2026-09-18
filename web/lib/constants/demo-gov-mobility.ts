export interface SankeyNode {
  id: string;
  label: string;
  type: "source" | "target";
  students: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  students: number;
  recognition: number;
}

export const DEMO_SANKEY_NODES: SankeyNode[] = [
  // Source institutions (left column)
  { id: "cu",   label: "University of Calcutta", type: "source", students: 1240 },
  { id: "au",   label: "Anna University",        type: "source", students: 982 },
  { id: "vit",  label: "VIT Vellore",            type: "source", students: 741 },
  { id: "nitt", label: "NIT Trichy",             type: "source", students: 615 },
  { id: "bits", label: "BITS Pilani",            type: "source", students: 543 },
  { id: "du",   label: "Delhi University",       type: "source", students: 428 },
  { id: "sppu", label: "SPPU",                   type: "source", students: 387 },

  // Target institutions (right column)
  { id: "iitb", label: "IIT Bombay",  type: "target", students: 2170 },
  { id: "iitd", label: "IIT Delhi",   type: "target", students: 1410 },
  { id: "iitm", label: "IIT Madras",  type: "target", students: 615 },
  { id: "iitk", label: "IIT Kanpur",  type: "target", students: 741 },
];

export const DEMO_SANKEY_LINKS: SankeyLink[] = [
  { source: "cu",   target: "iitb", students: 1240, recognition: 0.72 },
  { source: "au",   target: "iitd", students: 982,  recognition: 0.81 },
  { source: "vit",  target: "iitk", students: 741,  recognition: 0.88 },
  { source: "nitt", target: "iitm", students: 615,  recognition: 0.79 },
  { source: "bits", target: "iitb", students: 543,  recognition: 0.91 },
  { source: "du",   target: "iitd", students: 428,  recognition: 0.68 },
  { source: "sppu", target: "iitb", students: 387,  recognition: 0.65 },
];

export interface CohortBreakdown {
  label: string;
  direct: number;
  bridge: number;
  missing: number;
}

export const DEMO_COHORT_BREAKDOWN: CohortBreakdown[] = [
  { label: "CSE",         direct: 620, bridge: 180, missing: 42 },
  { label: "IT",          direct: 480, bridge: 210, missing: 58 },
  { label: "ECE",         direct: 380, bridge: 260, missing: 74 },
  { label: "Mechanical",  direct: 290, bridge: 320, missing: 96 },
  { label: "Civil",       direct: 240, bridge: 280, missing: 118 },
  { label: "Electrical",  direct: 320, bridge: 240, missing: 62 },
];

export interface MonthlyFlow {
  month: string;
  bengaluru: number;
  mumbai: number;
  delhi: number;
  chennai: number;
}

export const DEMO_REGIONAL_MONTHLY: MonthlyFlow[] = [
  { month: "Mar", bengaluru: 1840, mumbai: 2120, delhi: 1420, chennai: 1680 },
  { month: "Apr", bengaluru: 2140, mumbai: 2480, delhi: 1680, chennai: 1920 },
  { month: "May", bengaluru: 2480, mumbai: 2860, delhi: 1940, chennai: 2240 },
  { month: "Jun", bengaluru: 2820, mumbai: 3240, delhi: 2180, chennai: 2520 },
  { month: "Jul", bengaluru: 3240, mumbai: 3680, delhi: 2480, chennai: 2840 },
  { month: "Aug", bengaluru: 3580, mumbai: 4020, delhi: 2740, chennai: 3120 },
  { month: "Sep", bengaluru: 3920, mumbai: 4420, delhi: 3020, chennai: 3420 },
];

export interface ChannelMetric {
  label: string;
  value: string;
  trend: number; // positive = up
  tone: "emerald" | "amber" | "rose" | "navy";
}

export const DEMO_CHANNEL_METRICS: ChannelMetric[] = [
  { label: "Avg students per flow",       value: "818",     trend: 12,  tone: "emerald" },
  { label: "Avg recognition rate",        value: "77.7%",   trend: 4,   tone: "emerald" },
  { label: "Highest recognition pair",    value: "BITS → IITB", trend: 6, tone: "navy" },
  { label: "Lowest recognition pair",     value: "SPPU → IITB", trend: -3, tone: "rose" },
];