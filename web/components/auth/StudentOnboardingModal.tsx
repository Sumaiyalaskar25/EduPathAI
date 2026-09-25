"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Target,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHeiInstitutions, useRegisterStudent } from "@/lib/api/hooks";
import { useSessionStore } from "@/lib/store/session";
import type { StudentCourseItem } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_COURSES: Record<number, StudentCourseItem[]> = {
  1: [
    { code: "CS-101", title: "Programming Principles & C Logic", credits: 4, grade: "A+", semester: 1, domain: "Core Computing" },
    { code: "MATH-101", title: "Calculus & Linear Algebra", credits: 4, grade: "A", semester: 1, domain: "Mathematics" },
    { code: "EE-101", title: "Basic Electrical & Electronics", credits: 3, grade: "A", semester: 1, domain: "Engineering Sciences" },
    { code: "ENG-101", title: "Technical Communication & Ethics", credits: 2, grade: "O", semester: 1, domain: "Humanities" },
  ],
  2: [
    { code: "CS-102", title: "Object-Oriented Programming & Systems", credits: 4, grade: "A+", semester: 2, domain: "Core Computing" },
    { code: "CS-201", title: "Discrete Mathematical Structures", credits: 4, grade: "O", semester: 2, domain: "Mathematics" },
    { code: "MATH-102", title: "Probability & Statistics for Computing", credits: 4, grade: "A", semester: 2, domain: "Mathematics" },
    { code: "ENV-101", title: "Environmental Studies & Ecology", credits: 2, grade: "O", semester: 2, domain: "Sciences" },
  ],
  3: [
    { code: "CS-202", title: "Data Structures & Asymptotics", credits: 4, grade: "A+", semester: 3, domain: "Core Computing" },
    { code: "CS-203", title: "Computer Organization & Architecture", credits: 4, grade: "A", semester: 3, domain: "Hardware Systems" },
    { code: "MATH-201", title: "Numerical Methods & Optimization", credits: 3, grade: "A", semester: 3, domain: "Mathematics" },
  ],
  4: [
    { code: "CS-301", title: "Database Management Systems & SQL", credits: 4, grade: "A+", semester: 4, domain: "Core Computing" },
    { code: "CS-302", title: "Design & Analysis of Algorithms", credits: 4, grade: "A", semester: 4, domain: "Core Computing" },
    { code: "CS-303", title: "Operating Systems & Concurrency", credits: 4, grade: "A", semester: 4, domain: "Systems Software" },
  ],
};

function getCoursesUpToSemester(sem: number): StudentCourseItem[] {
  const result: StudentCourseItem[] = [];
  for (let s = 1; s <= sem; s++) {
    if (DEFAULT_COURSES[s]) {
      result.push(...DEFAULT_COURSES[s]);
    }
  }
  return result;
}

export function StudentOnboardingModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const institutionsQuery = useHeiInstitutions();
  const registerMutation = useRegisterStudent();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Academic Identity
  const [fullName, setFullName] = useState("");
  const [apaarId, setApaarId] = useState("");
  const [sourceInstitution, setSourceInstitution] = useState("University of Calcutta");
  const [programme, setProgramme] = useState("B.Tech Computer Science & Engineering");
  const [semester, setSemester] = useState<number>(4);

  // Step 2: Course & Credit History
  const [courses, setCourses] = useState<StudentCourseItem[]>(() => getCoursesUpToSemester(4));

  // Step 3: Desired College & Target Course
  const [targetInstitution, setTargetInstitution] = useState("IIT Bombay");
  const [targetProgramme, setTargetProgramme] = useState("BTech-CSE");

  // Recalculate courses when semester changes in Step 1
  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    setCourses(getCoursesUpToSemester(newSem));
  };

  const handleGenerateApaar = () => {
    const random12 = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    const formatted = `${random12.slice(0, 4)} ${random12.slice(4, 8)} ${random12.slice(8, 12)}`;
    setApaarId(formatted);
    toast.success("Generated 12-digit sovereign APAAR ID");
  };

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  const handleAddCustomCourse = () => {
    const newCourse: StudentCourseItem = {
      code: `ELEC-${semester}0${courses.length + 1}`,
      title: "Elective Specialization Course",
      credits: 4,
      grade: "A",
      semester: semester,
      domain: "Electives",
    };
    setCourses([...courses, newCourse]);
  };

  const handleRemoveCourse = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      setStep(1);
      return;
    }

    try {
      const cleanApaar = apaarId.replace(/\s/g, "");
      const res = await registerMutation.mutateAsync({
        full_name: fullName.trim(),
        apaar_id: cleanApaar || undefined,
        institution: sourceInstitution,
        programme,
        semester,
        target_institution: targetInstitution,
        target_programme: targetProgramme,
        courses,
        consent: true,
      });

      setSession({
        token: res.token,
        role: res.role,
        externalRef: res.external_ref,
        displayName: res.display_name,
        institution: res.institution ?? undefined,
        programme: res.programme ?? undefined,
        targetInstitution: res.target_institution ?? undefined,
        targetProgramme: res.target_programme ?? undefined,
      });

      toast.success(`Academic Profile Initialized — Welcome, ${res.display_name}!`);
      onOpenChange(false);
      router.push("/student");
    } catch {
      toast.error("Failed to complete registration. Please try again.");
    }
  };

  const institutionsList = institutionsQuery.data?.items ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-700/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="font-display text-[20px] font-bold text-[rgb(26_42_82)]">
                    First-Time Student Onboarding
                  </Dialog.Title>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300">
                    Step {step} of 3
                  </span>
                </div>
                <Dialog.Description className="mt-0.5 text-[12px] text-text-secondary">
                  Setup your academic history, credit depository, and desired mobility destination
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Stepper Indicator */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { num: 1, label: "Identity & College" },
              { num: 2, label: "Courses & Credits" },
              { num: 3, label: "Target Destination" },
            ].map((s) => (
              <div
                key={s.num}
                className={cn(
                  "flex items-center gap-2 rounded-xl p-2.5 text-[11.5px] font-semibold border transition-all",
                  step === s.num
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-950"
                    : step > s.num
                    ? "border-slate-200 bg-slate-50 text-text-muted"
                    : "border-slate-200/60 text-text-muted/60"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    step === s.num
                      ? "bg-emerald-600 text-white"
                      : step > s.num
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: Academic Identity & College */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 space-y-4 text-[13px]"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aryan Verma"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    12-Digit APAAR / ABC ID
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateApaar}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value)}
                  placeholder="e.g. 9081 4412 2201"
                  className="w-full rounded-xl border border-slate-200 font-mono px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Current College / University *
                  </label>
                  <select
                    value={sourceInstitution}
                    onChange={(e) => setSourceInstitution(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[12.5px]"
                  >
                    {institutionsList.length > 0 ? (
                      institutionsList.map((inst) => (
                        <option key={inst.id} value={inst.shortName || inst.name}>
                          {inst.shortName || inst.name} ({inst.city})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="University of Calcutta">University of Calcutta</option>
                        <option value="Anna University">Anna University</option>
                        <option value="BITS Pilani">BITS Pilani</option>
                        <option value="NIT Trichy">NIT Trichy</option>
                        <option value="VIT Vellore">VIT Vellore</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Degree Programme *
                  </label>
                  <select
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[12.5px]"
                  >
                    <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                    <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                    <option value="B.Tech Electronics & Communication">B.Tech Electronics & Communication</option>
                    <option value="B.Tech Data Science & AI">B.Tech Data Science & AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Current Completed Semester: <strong className="text-emerald-800">Semester {semester}</strong>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => (
                    <button
                      key={semNum}
                      type="button"
                      onClick={() => handleSemesterChange(semNum)}
                      className={cn(
                        "rounded-xl py-2 text-center text-[12px] font-bold border transition-all",
                        semester === semNum
                          ? "bg-[rgb(26_42_82)] text-white border-[rgb(26_42_82)] shadow-xs"
                          : "border-slate-200 bg-slate-50 hover:bg-white text-text-secondary"
                      )}
                    >
                      Sem {semNum}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11.5px] text-text-muted">
                  Under NEP 2020, Semesters 1-4 correspond to NCrF Level 4.5 / 5.0 (Diploma / Advance Diploma milestone).
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim()) {
                      toast.error("Please enter your full name to proceed");
                      return;
                    }
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-md hover:bg-[rgb(34_54_104)] transition-all"
                >
                  <span>Continue to Coursework</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Course & Credit History */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 space-y-4 text-[13px]"
            >
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                    Academic Credit Depository
                  </span>
                  <h4 className="font-display text-[18px] font-bold text-text-primary">
                    {totalCredits} Credits Completed · {courses.length} Subjects
                  </h4>
                  <p className="text-[11.5px] text-text-muted">
                    Pre-populated based on standard AICTE/UGC curriculum for Semester {semester}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomCourse}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-emerald-800 shadow-xs hover:bg-emerald-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Course</span>
                </button>
              </div>

              {/* Course list table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="max-h-[260px] overflow-y-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold uppercase tracking-wider text-text-muted border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Course Title</th>
                        <th className="py-2 px-3">Credits</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {courses.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-text-primary">{c.code}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-text-primary block">{c.title}</span>
                            <span className="text-[10px] text-text-muted">Sem {c.semester} · {c.domain}</span>
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-emerald-700">{c.credits} cr</td>
                          <td className="py-2 px-3">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-text-secondary">
                              {c.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCourse(i)}
                              className="text-text-muted hover:text-rose-600 p-1"
                              title="Remove course"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-md hover:bg-[rgb(34_54_104)] transition-all"
                >
                  <span>Set Desired Destination</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Choose Desired College & Target Course */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 space-y-4 text-[13px]"
            >
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-emerald-700" />
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-text-primary">
                    Mobility Wishlist & Evaluation Goal
                  </span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  Select the premier university you wish to transfer credits to. Our AI engine will equate your completed courses against their exact course outcomes, calculate credit recognition, identify gaps, and prescribe bridge modules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Target Destination College *
                  </label>
                  <select
                    value={targetInstitution}
                    onChange={(e) => setTargetInstitution(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[12.5px]"
                  >
                    <option value="IIT Bombay">IIT Bombay (Indian Institute of Technology, Bombay)</option>
                    <option value="IIT Delhi">IIT Delhi (Indian Institute of Technology, Delhi)</option>
                    <option value="IIT Madras">IIT Madras (Indian Institute of Technology, Madras)</option>
                    <option value="IIT Kanpur">IIT Kanpur (Indian Institute of Technology, Kanpur)</option>
                    <option value="IIT Kharagpur">IIT Kharagpur</option>
                    <option value="BITS Pilani">BITS Pilani</option>
                    <option value="NIT Trichy">NIT Trichy</option>
                    {institutionsList
                      .filter((i) => !["IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur"].includes(i.shortName))
                      .slice(0, 40)
                      .map((inst) => (
                        <option key={inst.id} value={inst.shortName || inst.name}>
                          {inst.shortName || inst.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Target Programme / Course *
                  </label>
                  <select
                    value={targetProgramme}
                    onChange={(e) => setTargetProgramme(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[12.5px]"
                  >
                    <option value="BTech-CSE">BTech-CSE (Computer Science & Engineering)</option>
                    <option value="BTech-IT">BTech-IT (Information Technology)</option>
                    <option value="BTech-ECE">BTech-ECE (Electronics & Communication)</option>
                    <option value="BTech-AI">BTech-AI (Artificial Intelligence & ML)</option>
                  </select>
                </div>
              </div>

              {/* Corridor Preview */}
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-teal-50/30 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                  Corridor Preview
                </span>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                  <Building2 className="h-4 w-4 text-text-muted shrink-0" />
                  <span>{sourceInstitution}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    {targetInstitution}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
                  <span>Candidate: <strong>{fullName}</strong></span>
                  <span>·</span>
                  <span>Current: {programme} (Sem {semester})</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-800">{totalCredits} Credits Ready to Equate</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={registerMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-800 transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{registerMutation.isPending ? "Generating Sovereign Pathway…" : "Launch My Academic Pathway"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
