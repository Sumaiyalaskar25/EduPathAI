export interface CourseDetail {
  id: string;
  code: string;
  title: string;
  credits: number;
  tag: "Theory" | "Lab" | "Theory & Lab";
  institution: string;
  semester: string;
  description: string;
  competencies: string[];
  prerequisites: string[];
  assessedBy: string;
  bloomLevel: number;
  recognitionStatus: "DIRECT" | "BRIDGE" | "MISSING";
  mappedFrom?: {
    code: string;
    institution: string;
    similarity: number;
  };
}

export const DEMO_COURSES: CourseDetail[] = [
  {
    id: "cs-401",
    code: "CS-401",
    title: "Distributed Systems",
    credits: 4,
    tag: "Theory",
    institution: "IIT Bombay",
    semester: "Semester V · Spring 2027",
    description:
      "Covers fundamentals of distributed computing — replication, consensus algorithms, fault tolerance, and distributed transaction management. Includes a project implementing a Raft-based key-value store.",
    competencies: [
      "Distributed consensus (Paxos, Raft)",
      "Replication strategies",
      "Consistency models",
      "Fault tolerance & recovery",
      "Distributed transactions",
    ],
    prerequisites: ["Computer Networks", "Operating Systems", "Data Structures"],
    assessedBy: "Mid-term (30%) · Assignments (30%) · Project (40%)",
    bloomLevel: 5,
    recognitionStatus: "BRIDGE",
    mappedFrom: {
      code: "CAL-DS-101",
      institution: "University of Calcutta",
      similarity: 0.78,
    },
  },
  {
    id: "cs-402",
    code: "CS-402",
    title: "Computer Networks",
    credits: 4,
    tag: "Theory & Lab",
    institution: "IIT Bombay",
    semester: "Semester V · Spring 2027",
    description:
      "Study of layered network protocols, TCP/IP stack, routing algorithms, and network security. Lab sessions implement a socket-based chat server and analyze packet traces.",
    competencies: [
      "OSI and TCP/IP reference models",
      "Routing algorithms (RIP, OSPF, BGP)",
      "Congestion control",
      "Transport-layer protocols",
      "Network security basics",
    ],
    prerequisites: ["Programming Fundamentals", "Data Structures"],
    assessedBy: "Mid-term (25%) · Lab (25%) · Final (50%)",
    bloomLevel: 4,
    recognitionStatus: "DIRECT",
    mappedFrom: {
      code: "CAL-NW-501",
      institution: "University of Calcutta",
      similarity: 0.88,
    },
  },
  {
    id: "cs-403",
    code: "CS-403",
    title: "Operating Systems",
    credits: 4,
    tag: "Theory",
    institution: "IIT Bombay",
    semester: "Semester V · Spring 2027",
    description:
      "Process scheduling, memory management, concurrency, and file systems. Assignments include building a minimal UNIX-like shell and implementing scheduling algorithms.",
    competencies: [
      "Process & thread scheduling",
      "Virtual memory & paging",
      "Concurrency primitives",
      "File systems",
      "I/O subsystem",
    ],
    prerequisites: ["Computer Organization", "Programming Fundamentals"],
    assessedBy: "Mid-term (30%) · Assignments (30%) · Final (40%)",
    bloomLevel: 4,
    recognitionStatus: "BRIDGE",
    mappedFrom: {
      code: "CAL-OS-401",
      institution: "University of Calcutta",
      similarity: 0.68,
    },
  },
  {
    id: "cs-501",
    code: "CS-501",
    title: "Artificial Intelligence",
    credits: 4,
    tag: "Theory",
    institution: "IIT Bombay",
    semester: "Semester VI · Fall 2027",
    description:
      "Search algorithms, knowledge representation, probabilistic reasoning, and an introduction to machine learning. Includes a project on game-playing agents.",
    competencies: [
      "Search & heuristic optimization",
      "Knowledge graphs & logic",
      "Probabilistic reasoning",
      "Introduction to ML",
      "Intelligent agents",
    ],
    prerequisites: ["Data Structures", "Discrete Mathematics"],
    assessedBy: "Assignments (40%) · Project (30%) · Final (30%)",
    bloomLevel: 4,
    recognitionStatus: "DIRECT",
  },
  {
    id: "cs-502",
    code: "CS-502",
    title: "High-Performance Computing",
    credits: 4,
    tag: "Lab",
    institution: "IIT Bombay",
    semester: "Semester VI · Fall 2027",
    description:
      "Parallel programming with MPI and OpenMP, GPU computing with CUDA, and performance profiling. Lab-driven with a parallel matrix-multiplication capstone.",
    competencies: [
      "MPI & OpenMP programming",
      "GPU acceleration (CUDA)",
      "Performance profiling",
      "Parallel algorithm design",
    ],
    prerequisites: ["Computer Architecture", "Programming Fundamentals"],
    assessedBy: "Labs (60%) · Capstone (40%)",
    bloomLevel: 5,
    recognitionStatus: "DIRECT",
  },
  {
    id: "cs-503",
    code: "CS-503",
    title: "Software Engineering",
    credits: 4,
    tag: "Theory",
    institution: "IIT Bombay",
    semester: "Semester VI · Fall 2027",
    description:
      "Software development lifecycles, agile methods, design patterns, testing, and version control. Team-based project throughout the semester.",
    competencies: [
      "SDLC & agile methods",
      "Design patterns",
      "Testing strategies",
      "Version control & CI/CD",
      "Requirements engineering",
    ],
    prerequisites: ["Programming Fundamentals"],
    assessedBy: "Team project (50%) · Assignments (30%) · Final (20%)",
    bloomLevel: 3,
    recognitionStatus: "DIRECT",
  },
];

export function getCourseById(id: string): CourseDetail | undefined {
  return DEMO_COURSES.find((c) => c.id === id);
}