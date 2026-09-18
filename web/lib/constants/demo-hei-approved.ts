export type HeiApprovedStatus = "APPROVED" | "REJECTED" | "ESCALATED";

export interface HeiApprovedRecord {
  id: string;
  decisionId: string;
  studentName: string;
  studentProgramme: string;
  sourceInstitution: string;
  targetInstitution: string;
  courses: string;
  outcome: HeiApprovedStatus;
  bridgeRequired: boolean;
  decidedAt: string;
  reviewer: string;
  reviewDuration: string; // e.g. "12 min"
}

export const DEMO_HEI_APPROVED: HeiApprovedRecord[] = [
  {
    id: "a1",
    decisionId: "dec-b1c7f4e8-2a",
    studentName: "Ananya Rao",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "Anna University",
    targetInstitution: "IIT Bombay",
    courses: "Machine Learning (CS-402)",
    outcome: "APPROVED",
    bridgeRequired: false,
    decidedAt: "2026-09-11T09:42:00Z",
    reviewer: "Prof. S. Sen",
    reviewDuration: "8 min",
  },
  {
    id: "a2",
    decisionId: "dec-d5a8b1c4-7e",
    studentName: "Vikram Shah",
    studentProgramme: "B.Tech IT",
    sourceInstitution: "VIT Vellore",
    targetInstitution: "IIT Delhi",
    courses: "Computer Networks",
    outcome: "APPROVED",
    bridgeRequired: false,
    decidedAt: "2026-09-11T08:15:00Z",
    reviewer: "Prof. R. Iyer",
    reviewDuration: "12 min",
  },
  {
    id: "a3",
    decisionId: "dec-e9f2d5a8-1b",
    studentName: "Diya Kapoor",
    studentProgramme: "B.Tech ECE",
    sourceInstitution: "NIT Trichy",
    targetInstitution: "IIT Madras",
    courses: "Advanced Graph Algorithms",
    outcome: "APPROVED",
    bridgeRequired: true,
    decidedAt: "2026-09-10T17:30:00Z",
    reviewer: "Prof. S. Sen",
    reviewDuration: "22 min",
  },
  {
    id: "a4",
    decisionId: "dec-f2a5b83d-6c",
    studentName: "Arjun Verma",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "BITS Pilani",
    targetInstitution: "IIT Kanpur",
    courses: "Distributed Systems",
    outcome: "APPROVED",
    bridgeRequired: true,
    decidedAt: "2026-09-10T14:00:00Z",
    reviewer: "Prof. M. Gupta",
    reviewDuration: "18 min",
  },
  {
    id: "a5",
    decisionId: "dec-a7b3c6e9-5f",
    studentName: "Meera Nair",
    studentProgramme: "B.Tech IT",
    sourceInstitution: "Delhi University",
    targetInstitution: "IIT Delhi",
    courses: "Database Systems",
    outcome: "REJECTED",
    bridgeRequired: false,
    decidedAt: "2026-09-10T11:20:00Z",
    reviewer: "Prof. R. Iyer",
    reviewDuration: "34 min",
  },
  {
    id: "a6",
    decisionId: "dec-b8c4d7e1-9a",
    studentName: "Rahul Iyer",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "University of Calcutta",
    targetInstitution: "IIT Bombay",
    courses: "Operating Systems",
    outcome: "APPROVED",
    bridgeRequired: false,
    decidedAt: "2026-09-09T16:45:00Z",
    reviewer: "Prof. S. Sen",
    reviewDuration: "6 min",
  },
  {
    id: "a7",
    decisionId: "dec-c5e9f1a4-3d",
    studentName: "Nisha Bhat",
    studentProgramme: "B.Tech CSE",
    sourceInstitution: "Savitribai Phule Pune Univ",
    targetInstitution: "IIT Bombay",
    courses: "Data Structures",
    outcome: "ESCALATED",
    bridgeRequired: true,
    decidedAt: "2026-09-09T10:15:00Z",
    reviewer: "Prof. M. Gupta",
    reviewDuration: "48 min",
  },
  {
    id: "a8",
    decisionId: "dec-d2f6a9b3-8e",
    studentName: "Kiran Reddy",
    studentProgramme: "B.Tech ECE",
    sourceInstitution: "Anna University",
    targetInstitution: "IIT Madras",
    courses: "Computer Architecture",
    outcome: "APPROVED",
    bridgeRequired: false,
    decidedAt: "2026-09-08T15:00:00Z",
    reviewer: "Prof. S. Sen",
    reviewDuration: "10 min",
  },
];

export const DEMO_HEI_APPROVED_STATS = {
  approvedThisWeek: 47,
  rejectedThisWeek: 6,
  escalatedThisWeek: 3,
  avgReviewDuration: "14 min",
  approvalRate: 0.84,
};