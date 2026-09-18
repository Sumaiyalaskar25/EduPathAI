export type HeiInstitutionStatus = "active" | "pending" | "paused";

export interface HeiInstitution {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: "IIT" | "NIT" | "Central" | "State" | "Private" | "Deemed";
  studentsActive: number;
  decisionsThisMonth: number;
  recognitionRate: number;
  avgReviewTime: string;
  status: HeiInstitutionStatus;
  joinedAt: string;
  naac: "A++" | "A+" | "A" | "B++" | "B+";
}

export const DEMO_HEI_INSTITUTIONS: HeiInstitution[] = [
  { id: "iitb", name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "IIT", studentsActive: 12480, decisionsThisMonth: 3420, recognitionRate: 0.84, avgReviewTime: "12 min", status: "active", joinedAt: "2024-03-15", naac: "A++" },
  { id: "iitd", name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", city: "New Delhi", state: "Delhi", type: "IIT", studentsActive: 11240, decisionsThisMonth: 3180, recognitionRate: 0.86, avgReviewTime: "10 min", status: "active", joinedAt: "2024-03-15", naac: "A++" },
  { id: "iitm", name: "Indian Institute of Technology Madras", shortName: "IIT Madras", city: "Chennai", state: "Tamil Nadu", type: "IIT", studentsActive: 10890, decisionsThisMonth: 2910, recognitionRate: 0.82, avgReviewTime: "14 min", status: "active", joinedAt: "2024-04-02", naac: "A++" },
  { id: "iitk", name: "Indian Institute of Technology Kanpur", shortName: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", type: "IIT", studentsActive: 9640, decisionsThisMonth: 2540, recognitionRate: 0.81, avgReviewTime: "15 min", status: "active", joinedAt: "2024-04-18", naac: "A++" },
  { id: "nitt", name: "National Institute of Technology Tiruchirappalli", shortName: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", type: "NIT", studentsActive: 7820, decisionsThisMonth: 2140, recognitionRate: 0.79, avgReviewTime: "18 min", status: "active", joinedAt: "2024-05-10", naac: "A+" },
  { id: "vit", name: "Vellore Institute of Technology", shortName: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", type: "Deemed", studentsActive: 6840, decisionsThisMonth: 1870, recognitionRate: 0.77, avgReviewTime: "20 min", status: "active", joinedAt: "2024-06-01", naac: "A++" },
  { id: "bits", name: "Birla Institute of Technology and Science", shortName: "BITS Pilani", city: "Pilani", state: "Rajasthan", type: "Deemed", studentsActive: 5420, decisionsThisMonth: 1420, recognitionRate: 0.88, avgReviewTime: "9 min", status: "active", joinedAt: "2024-06-22", naac: "A" },
  { id: "du", name: "University of Delhi", shortName: "Delhi University", city: "New Delhi", state: "Delhi", type: "Central", studentsActive: 4890, decisionsThisMonth: 1180, recognitionRate: 0.71, avgReviewTime: "26 min", status: "active", joinedAt: "2024-07-05", naac: "A+" },
  { id: "au", name: "Anna University", shortName: "Anna University", city: "Chennai", state: "Tamil Nadu", type: "State", studentsActive: 4210, decisionsThisMonth: 980, recognitionRate: 0.74, avgReviewTime: "24 min", status: "active", joinedAt: "2024-07-19", naac: "A+" },
  { id: "cu", name: "University of Calcutta", shortName: "University of Calcutta", city: "Kolkata", state: "West Bengal", type: "State", studentsActive: 3480, decisionsThisMonth: 820, recognitionRate: 0.68, avgReviewTime: "28 min", status: "active", joinedAt: "2024-08-11", naac: "A" },
  { id: "sppu", name: "Savitribai Phule Pune University", shortName: "SPPU", city: "Pune", state: "Maharashtra", type: "State", studentsActive: 2870, decisionsThisMonth: 640, recognitionRate: 0.66, avgReviewTime: "32 min", status: "pending", joinedAt: "2026-08-15", naac: "A+" },
  { id: "ju", name: "Jadavpur University", shortName: "Jadavpur University", city: "Kolkata", state: "West Bengal", type: "State", studentsActive: 2340, decisionsThisMonth: 510, recognitionRate: 0.72, avgReviewTime: "22 min", status: "active", joinedAt: "2024-09-02", naac: "A" },
];

export const DEMO_HEI_INSTITUTION_STATS = {
  total: 840,
  active: 812,
  pending: 24,
  paused: 4,
  totalStudents: 1420000,
  totalDecisionsThisMonth: 24800,
  medianRecognition: 0.78,
};