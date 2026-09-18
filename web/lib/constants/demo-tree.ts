export type LeafKind = "recognized" | "bridge" | "future";

export interface Leaf {
  id: string;
  label: string;
  kind: LeafKind;
  x: number;
  y: number;
  delay: number;
}

export const DEMO_LEAVES: Leaf[] = [
  { id: "l01", label: "DSA",        kind: "recognized", x: 260, y: 400, delay: 0 },
  { id: "l02", label: "Networks",   kind: "recognized", x: 200, y: 350, delay: 1 },
  { id: "l03", label: "Databases",  kind: "recognized", x: 170, y: 300, delay: 2 },
  { id: "l04", label: "GenAI",      kind: "recognized", x: 210, y: 250, delay: 3 },
  { id: "l05", label: "OS",         kind: "recognized", x: 260, y: 210, delay: 4 },
  { id: "l06", label: "DevOps",     kind: "recognized", x: 320, y: 175, delay: 5 },
  { id: "l07", label: "Networks",   kind: "recognized", x: 380, y: 150, delay: 6 },
  { id: "l08", label: "Databases",  kind: "recognized", x: 440, y: 130, delay: 7 },
  { id: "l09", label: "SysDesign",  kind: "recognized", x: 500, y: 115, delay: 8 },
  { id: "l10", label: "Distrib",    kind: "recognized", x: 560, y: 100, delay: 9 },
  { id: "b01", label: "Compilers",  kind: "bridge",     x: 610, y: 130, delay: 10 },
  { id: "b02", label: "Parallel Computing", kind: "bridge", x: 640, y: 200, delay: 11 },
  { id: "b03", label: "Distributed Systems", kind: "bridge", x: 650, y: 270, delay: 12 },
  { id: "f01", label: "", kind: "future", x: 700, y: 350, delay: 13 },
  { id: "f02", label: "", kind: "future", x: 720, y: 280, delay: 14 },
  { id: "f03", label: "", kind: "future", x: 730, y: 200, delay: 15 },
  { id: "f04", label: "", kind: "future", x: 690, y: 420, delay: 16 },
  { id: "f05", label: "", kind: "future", x: 640, y: 470, delay: 17 },
  { id: "f06", label: "", kind: "future", x: 590, y: 500, delay: 18 },
];

export interface Prereq {
  label: string;
  satisfied: boolean;
}

export const DEMO_COMPETENCY = {
  title: "Distributed Systems (CS-401)",
  badge: "BRIDGE REQUIRED",
  coverage: "0.78 Semantic Coverage",
  prereqs: [
    { label: "Computer Networks", satisfied: true },
    { label: "Operating Systems", satisfied: true },
    { label: "Data Structures",   satisfied: true },
  ] as Prereq[],
  gapNote: "Course Equivalency Gap: Consensus protocols (Paxos/Raft)",
  cta: "Enroll in NPTEL Bridge Course (20h)",
};