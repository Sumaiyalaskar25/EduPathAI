export type HeiDecisionStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED";

export interface HeiReviewItem {
  id: string;
  decisionId: string;
  studentName: string;
  studentProgramme: string;
  sourceInstitution: string;
  targetInstitution: string;
  courses: string;
  aiRecommendation: "DIRECT" | "BRIDGE" | "MISSING";
  confidence: number;
  bridgeRequired: boolean;
  submittedAt: string;
  age: string;
  priority: "high" | "normal" | "low";
  status: HeiDecisionStatus;
}

export const DEMO_HEI_QUEUE: HeiReviewItem[] = [
  {
    id: "q1",
    decisionId: "dec-9f83b165-a1",
    studentName: "Aarav Sharma",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "University of Calcutta",
    targetInstitution: "IIT Bombay",
    courses: "Distributed Systems (CS-401)",
    aiRecommendation: "BRIDGE",
    confidence: 0.94,
    bridgeRequired: true,
    submittedAt: "2026-09-11T10:14:00Z",
    age: "2h ago",
    priority: "high",
    status: "PENDING",
  },
  {
    id: "q2",
    decisionId: "dec-4a7b9c2d-7f",
    studentName: "Priya Menon",
    studentProgramme: "B.Tech IT",
    sourceInstitution: "Anna University",
    targetInstitution: "IIT Delhi",
    courses: "Computer Networks",
    aiRecommendation: "DIRECT",
    confidence: 0.91,
    bridgeRequired: false,
    submittedAt: "2026-09-11T08:22:00Z",
    age: "4h ago",
    priority: "normal",
    status: "PENDING",
  },
  {
    id: "q3",
    decisionId: "dec-1aa775e2-b3",
    studentName: "Rohan Iyer",
    studentProgramme: "B.Tech ECE",
    sourceInstitution: "NIT Trichy",
    targetInstitution: "IIT Madras",
    courses: "Advanced Graph Algorithms",
    aiRecommendation: "BRIDGE",
    confidence: 0.68,
    bridgeRequired: true,
    submittedAt: "2026-09-10T18:05:00Z",
    age: "18h ago",
    priority: "high",
    status: "PENDING",
  },
  {
    id: "q4",
    decisionId: "dec-c9e1d4f7-a8",
    studentName: "Sneha Patel",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "VIT Vellore",
    targetInstitution: "IIT Kanpur",
    courses: "Database Systems",
    aiRecommendation: "DIRECT",
    confidence: 0.88,
    bridgeRequired: false,
    submittedAt: "2026-09-10T14:30:00Z",
    age: "22h ago",
    priority: "normal",
    status: "PENDING",
  },
  {
    id: "q5",
    decisionId: "dec-8f2d5a8b-1c",
    studentName: "Kabir Singh",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "BITS Pilani",
    targetInstitution: "IIT Bombay",
    courses: "Operating Systems",
    aiRecommendation: "MISSING",
    confidence: 0.42,
    bridgeRequired: true,
    submittedAt: "2026-09-09T11:00:00Z",
    age: "2d ago",
    priority: "low",
    status: "PENDING",
  },
];

export const DEMO_HEI_STATS = {
  pending: 5,
  approvedToday: 12,
  rejectedToday: 2,
  avgReviewTime: "18 min",
};