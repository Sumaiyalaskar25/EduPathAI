export type PathwayKey = "FASTEST" | "BALANCED" | "MAX_PRESERVATION";

export interface PathwayOption {
  key: PathwayKey;
  title: string;
  creditLine: string;
  subtitle: string;
}

export const DEMO_PATHWAYS: PathwayOption[] = [
  {
    key: "FASTEST",
    title: "Fastest Path",
    creditLine: "24 credits/sem",
    subtitle: "Minimize Graduation Time: 3 Semesters | high workload",
  },
  {
    key: "BALANCED",
    title: "Balanced Path",
    creditLine: "18 credits/sem",
    subtitle: "Optimal workload variance: 4 Semesters",
  },
  {
    key: "MAX_PRESERVATION",
    title: "Maximum Preservation",
    creditLine: "4 Semesters + 1 summer bridge",
    subtitle: "100% Credit Retention",
  },
];

export interface CourseCard {
  code: string;
  title: string;
  credits: number;
  tag: "Theory" | "Lab" | "Theory & Lab";
}

export interface SemesterColumn {
  id: string;
  label: string;
  sublabel: string;
  credits: number;
  courses: CourseCard[];
}

export const DEMO_SEMESTERS: SemesterColumn[] = [
  {
    id: "sem-v",
    label: "Semester V - Spring 2027",
    sublabel: "18 Credits",
    credits: 18,
    courses: [
      { code: "CS-401", title: "Distributed Systems (CS-401)",      credits: 4, tag: "Theory" },
      { code: "CS-402", title: "Computer Networks",                  credits: 4, tag: "Theory & Lab" },
      { code: "CS-403", title: "Operating Systems",                  credits: 4, tag: "Theory" },
    ],
  },
  {
    id: "sem-vi",
    label: "Semester VI - Fall 2027",
    sublabel: "16 Credits",
    credits: 16,
    courses: [
      { code: "CS-501", title: "Artificial Intelligence",           credits: 4, tag: "Theory" },
      { code: "CS-502", title: "High-Performance Computing",        credits: 4, tag: "Lab" },
      { code: "CS-503", title: "Software Engineering",              credits: 4, tag: "Theory" },
    ],
  },
  {
    id: "sem-vii",
    label: "Semester VII - Spring 2028",
    sublabel: "14 Credits",
    credits: 14,
    courses: [
      { code: "CS-601", title: "Natural Language Processing",       credits: 4, tag: "Theory" },
      { code: "CS-602", title: "Machine Learning",                  credits: 4, tag: "Lab" },
      { code: "CS-603", title: "Interdisciplinary Elective",        credits: 3, tag: "Theory" },
    ],
  },
  {
    id: "sem-viii",
    label: "Semester VIII - Fall 2028",
    sublabel: "12 Credits",
    credits: 12,
    courses: [
      { code: "CS-701", title: "Capstone Project",                  credits: 6, tag: "Lab" },
      { code: "CS-702", title: "Open Elective II",                  credits: 3, tag: "Theory" },
      { code: "CS-703", title: "Ethics in AI",                      credits: 3, tag: "Theory" },
    ],
  },
];

export interface SummerBridge {
  title: string;
  provider: string;
  duration: string;
  credits: number;
}

export const DEMO_SUMMER_BRIDGE: SummerBridge = {
  title: "Advanced Graph Algorithms",
  provider: "SWAYAM",
  duration: "4 Weeks",
  credits: 4,
};