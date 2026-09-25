"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Award,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdateStudentTranscript } from "@/lib/api/hooks";
import type { StudentCourseItem, StudentTranscript } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  externalRef: string;
  transcript?: StudentTranscript;
  sourceInstitution?: string;
  programme?: string;
}

export function CreditHistoryLedger({
  externalRef,
  transcript,
  sourceInstitution = "University of Calcutta",
  programme = "B.Tech Computer Science & Engineering",
}: Props) {
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [addCourseModal, setAddCourseModal] = useState(false);

  // New course form fields
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCredits, setNewCredits] = useState<number>(4);
  const [newGrade, setNewGrade] = useState("A");
  const [newSemester, setNewSemester] = useState<number>(4);

  const updateTranscript = useUpdateStudentTranscript();

  const courses = transcript?.courses ?? [];
  const currentSemester = transcript?.semester ?? 4;
  const totalCredits = transcript?.total_credits ?? courses.reduce((s, c) => s + (c.credits || 0), 0);

  const semesterTabs = useMemo(() => {
    const sems = Array.from(new Set(courses.map((c) => c.semester))).sort();
    return ["ALL", ...sems.map(String)];
  }, [courses]);

  const visibleCourses = useMemo(() => {
    let list = courses;
    if (selectedSemester !== "ALL") {
      list = list.filter((c) => String(c.semester) === selectedSemester);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.domain && c.domain.toLowerCase().includes(q))
      );
    }
    return list;
  }, [courses, selectedSemester, searchQuery]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) {
      toast.error("Please provide both course code and title");
      return;
    }

    const newCourseItem: StudentCourseItem = {
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      credits: Number(newCredits) || 4,
      grade: newGrade,
      semester: Number(newSemester) || 4,
      domain: "Departmental Elective",
    };

    const updated = [...courses, newCourseItem];
    try {
      await updateTranscript.mutateAsync({
        externalRef,
        courses: updated,
        semester: Math.max(currentSemester, Number(newSemester)),
      });
      toast.success(`Course ${newCourseItem.code} added to Academic Credit Ledger`);
      setAddCourseModal(false);
      setNewCode("");
      setNewTitle("");
    } catch {
      toast.error("Failed to update credit ledger");
    }
  };

  const handleRemoveCourse = async (codeToRemove: string) => {
    const updated = courses.filter((c) => c.code !== codeToRemove);
    try {
      await updateTranscript.mutateAsync({
        externalRef,
        courses: updated,
      });
      toast.success(`Course ${codeToRemove} removed from transcript`);
    } catch {
      toast.error("Failed to update credit ledger");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm p-6 md:p-8 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <BookOpen className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Academic Credit Depository & Transcript
            </p>
          </div>
          <h2 className="mt-1 font-display text-[22px] font-bold text-[rgb(26_42_82)]">
            Verified Credit History
          </h2>
          <p className="mt-0.5 text-[12.5px] text-text-secondary">
            Enrolled at <strong>{sourceInstitution}</strong> · {programme} · Semester {currentSemester}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ABC Depository Verified
          </span>
          <button
            type="button"
            onClick={() => setAddCourseModal(true)}
            className="inline-flex items-center gap-1 rounded-full bg-[rgb(26_42_82)] px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-xs hover:bg-[rgb(34_54_104)] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Credit Summary Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Earned Credits</span>
          <p className="mt-1 font-display text-[28px] font-bold text-emerald-700 tabular-nums">
            {totalCredits} <span className="text-[14px] text-text-secondary font-medium">/ 160 cr</span>
          </p>
          <span className="text-[10.5px] text-text-muted">NCrF Degree Progression</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Current Academic Level</span>
          <p className="mt-1 font-display text-[22px] font-bold text-text-primary">
            Level 5.0
          </p>
          <span className="text-[10.5px] text-text-muted">Advanced Higher Technical</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed Semester</span>
          <p className="mt-1 font-display text-[28px] font-bold text-[rgb(26_42_82)] tabular-nums">
            Sem {currentSemester}
          </p>
          <span className="text-[10.5px] text-text-muted">Eligible for Lateral Transfer</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Courses Evaluated</span>
          <p className="mt-1 font-display text-[28px] font-bold text-text-primary tabular-nums">
            {courses.length}
          </p>
          <span className="text-[10.5px] text-text-muted">Subjects on DigiLocker</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Semester tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mr-1">
            Filter:
          </span>
          {semesterTabs.map((sem) => {
            const isActive = selectedSemester === sem;
            return (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all",
                  isActive
                    ? "bg-[rgb(26_42_82)] text-white shadow-xs"
                    : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                )}
              >
                {sem === "ALL" ? "All Semesters" : `Semester ${sem}`}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed course…"
            className="w-full rounded-full border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Transcript Courses Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="sticky top-0 bg-slate-50 text-[10.5px] font-bold uppercase tracking-wider text-text-muted border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Course Code</th>
                <th className="py-2.5 px-4">Course Title & Domain</th>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {visibleCourses.map((c, i) => (
                <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[rgb(26_42_82)]">
                    {c.code}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-text-primary block">{c.title}</span>
                    <span className="text-[11px] text-text-muted">{c.domain || "Departmental Core"}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-text-secondary whitespace-nowrap">
                    Sem {c.semester}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    {c.credits} cr
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 border border-emerald-200">
                      {c.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      DigiLocker Sealed
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c.code)}
                      className="text-text-muted hover:text-rose-600 p-1 transition-colors"
                      title="Remove course from ledger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Modal to Add Course */}
      {addCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-[13px]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-display text-[16px] font-bold text-[rgb(26_42_82)]">
                Add Course to Transcript
              </h3>
              <button
                type="button"
                onClick={() => setAddCourseModal(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. CS-401"
                  className="w-full rounded-xl border border-slate-200 font-mono px-3.5 py-2 uppercase outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Compiler Design & Code Generation"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Semester
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Credits
                  </label>
                  <select
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((cr) => (
                      <option key={cr} value={cr}>
                        {cr} Credits
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Grade
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  >
                    {["O", "A+", "A", "B+", "B", "C"].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddCourseModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-text-secondary hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTranscript.isPending}
                  className="rounded-xl bg-[rgb(26_42_82)] px-4 py-2 font-semibold text-white shadow-xs hover:bg-[rgb(34_54_104)] disabled:opacity-50"
                >
                  {updateTranscript.isPending ? "Adding…" : "Save Course"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}
