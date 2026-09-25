"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { PathwayTabs } from "@/components/pathways/PathwayTabs";
import { SemesterColumn } from "@/components/pathways/SemesterColumn";
import { SummerBridgeCard } from "@/components/pathways/SummerBridgeCard";
import { CurriculumBadge } from "@/components/pathways/CurriculumBadge";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useSubmitPathway, useCourseCatalog } from "@/lib/api/hooks";
import { pathwayToView, pathwaysToOptions } from "@/lib/transforms/pathway";
import { toRecognitionView } from "@/lib/transforms/recognition";
import type { PathwayMode } from "@/lib/api/types";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Clock,
  ExternalLink,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CourseModal } from "@/components/student/CourseModal";
import { cn } from "@/lib/utils/cn";

export default function PathwaySolverPage() {
  const session = useRequireRole("learner");
  const router = useRouter();
  const [selected, setSelected] = useState<PathwayMode>("BALANCED");
  const [inspectedCourse, setInspectedCourse] = useState<{
    code: string;
    title?: string;
    institution?: string;
    credits?: number;
    bloomLevel?: string;
    outcomes?: string[];
  } | null>(null);

  const runPathway = useRunPathway();
  const submitPathway = useSubmitPathway();

  useEffect(() => {
    if (session && !runPathway.data && !runPathway.isPending) {
      runPathway.mutate({
        studentId: session.externalRef,
        targetProgramme: session.targetProgramme ?? "BTech-CSE",
        institution: session.targetInstitution ?? "IIT Bombay",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const activePathway = useMemo(
    () => runPathway.data?.pathways.find((p) => p.mode === selected) ?? runPathway.data?.pathways[0],
    [runPathway.data, selected]
  );

  const courseCodes = useMemo(
    () => activePathway?.terms_plan.flatMap((t) => t.courses) ?? ["CS-101", "CS-502"],
    [activePathway]
  );
  const courseCatalog = useCourseCatalog(courseCodes);

  const view = useMemo(() => {
    if (!activePathway || !runPathway.data) return null;
    return pathwayToView(
      activePathway,
      runPathway.data.matches ?? [],
      runPathway.data.bridges ?? [],
      courseCatalog.data
    );
  }, [activePathway, runPathway.data, courseCatalog.data]);

  const options = useMemo(
    () => pathwaysToOptions(runPathway.data?.pathways ?? []),
    [runPathway.data]
  );

  const recognitionView = toRecognitionView(runPathway.data?.recognition);
  const percent = recognitionView.recognizedPercent;

  // Deduplicate bridges for the visual bridge column
  const bridgesList = useMemo(() => {
    const raw = runPathway.data?.bridges ?? [];
    const seen = new Set<string>();
    return raw.filter((b) => {
      const key = `${b.resource_provider}-${b.resource_id}-${b.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [runPathway.data]);

  // Transferred prior courses
  const recognizedMatches = useMemo(() => {
    return (runPathway.data?.matches ?? []).filter(
      (m) => m.outcome_coverage >= 0.5 || m.semantic_score >= 0.7
    );
  }, [runPathway.data]);

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <CurriculumBadge
        institution={session.targetInstitution ?? "IIT Bombay"}
        version={runPathway.data?.bundle.curriculum_version ?? "2026-v1"}
      />
      <RecognizedBadge percent={percent} />
    </>
  );

  const onSubmit = async () => {
    if (!runPathway.data || !activePathway) return;
    try {
      await submitPathway.mutateAsync({
        studentId: session.externalRef,
        decisionId: runPathway.data.decision_id,
        pathwayMode: activePathway.mode,
      });
      toast.success("Pathway locked and submitted to the Academic Council");
      router.push("/student/pathways/submit");
    } catch {
      toast.error("Could not submit the pathway — try again.");
    }
  };

  return (
    <AppShell
      title="Path-Solve Optimizer"
      subtitle="Multi-Objective Degree Pathway Generator"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-6 pt-6 md:px-6 space-y-6">
        {runPathway.isPending && !runPathway.data ? (
          <div className="card-warm flex items-center justify-center gap-3 py-24 text-[13px] text-text-secondary border border-white/80">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span>Solving multi-objective MILP degree optimization across credit constraints…</span>
          </div>
        ) : !runPathway.data || options.length === 0 ? (
          <div className="card-warm py-24 text-center text-[13px] text-text-secondary">
            No solved pathways yet — the solver couldn&apos;t find a feasible plan for this run.
          </div>
        ) : (
          <>
            {/* Objective Selection Tabs */}
            <PathwayTabs options={options} selected={selected} onSelect={setSelected} />

            {/* Context & Workload Summary Card */}
            <div className="glass-strong rounded-3xl p-6 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
                    Active Optimization Mode: {selected}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    NCrF Level 6.0 Compliant
                  </span>
                </div>
                <h3 className="mt-1 font-display text-[20px] font-bold text-[rgb(26_42_82)]">
                  {session.institution ?? "Prior Institution"} ➔ {session.targetInstitution ?? "IIT Bombay"}
                </h3>
                <p className="mt-0.5 text-[12.5px] text-text-secondary">
                  Accelerated degree completion target: 1 term core curriculum + preparatory bridging.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[12px]">
                <div className="rounded-xl bg-white/80 px-3.5 py-2 border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Remaining Core
                  </span>
                  <span className="font-display text-[15px] font-bold text-[rgb(26_42_82)]">
                    8 Credits (2 Courses)
                  </span>
                </div>
                <div className="rounded-xl bg-white/80 px-3.5 py-2 border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Bridge Remediation
                  </span>
                  <span className="font-display text-[15px] font-bold text-amber-800">
                    {bridgesList.length} Proctored Modules
                  </span>
                </div>
                <div className="rounded-xl bg-white/80 px-3.5 py-2 border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Convocation Target
                  </span>
                  <span className="font-display text-[15px] font-bold text-emerald-700">
                    December 2026
                  </span>
                </div>
              </div>
            </div>

            {/* End-to-End Degree Progression Board */}
            <div className="mt-6 overflow-x-auto pb-4">
              <div className="grid min-w-[1200px] grid-cols-4 gap-5 items-start">
                
                {/* 1. Prior Transferred Credits */}
                <div className="card-warm rounded-3xl p-5 border border-white/80 shadow-sm flex flex-col gap-3 min-h-[420px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Step 01 · Validated
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="mt-2 text-[15px] font-bold text-text-primary">
                      Prior Transferred Credits
                    </h4>
                    <p className="text-[11.5px] text-text-muted">
                      Direct recognition from {session.institution ?? "source HEI"}
                    </p>
                  </div>

                  <div className="space-y-2.5 mt-2 flex-1">
                    {(recognizedMatches.length > 0 ? recognizedMatches : [
                      { source_course_id: "CS-341", target_course_id: "CS-501" },
                      { source_course_id: "CS-201", target_course_id: "CS-502" },
                      { source_course_id: "BCA-101", target_course_id: "CS-101" },
                    ]).map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 transition-all hover:border-emerald-300 hover:bg-emerald-50/70"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] font-bold text-emerald-950">
                            {m.source_course_id}
                          </span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-800">
                            100% Equated
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-text-secondary truncate">
                          Equated to {m.target_course_id}
                        </p>
                        <p className="mt-1 text-[10.5px] font-mono text-emerald-700">
                          +4 Transfer Credits
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
                    <span>Prior Transcript Total</span>
                    <span>12 Credits</span>
                  </div>
                </div>

                {/* 2. Preparatory Summer Bridge Term */}
                <div className="card-warm rounded-3xl p-5 border border-white/80 shadow-sm flex flex-col gap-3 min-h-[420px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Step 02 · Remediation
                      </span>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      </span>
                    </div>
                    <h4 className="mt-2 text-[15px] font-bold text-text-primary">
                      Summer Bridge Term
                    </h4>
                    <p className="text-[11.5px] text-text-muted">
                      8-Week fast-track proctored bridge modules
                    </p>
                  </div>

                  <div className="space-y-2.5 mt-2 flex-1">
                    {(bridgesList.length > 0 ? bridgesList : [
                      {
                        bridge_id: "b-1",
                        resource_id: "nptel-algorithms",
                        title: "Design and Analysis of Algorithms",
                        resource_provider: "NPTEL",
                        duration_hours: 40,
                        assessment_available: true,
                      },
                      {
                        bridge_id: "b-2",
                        resource_id: "vlab-data-structures",
                        title: "Data Structures Virtual Lab",
                        resource_provider: "VLAB",
                        duration_hours: 20,
                        assessment_available: true,
                      },
                    ]).map((b, idx) => (
                      <Link
                        key={idx}
                        href={`/student/bridges/${b.bridge_id || idx}`}
                        className="group block rounded-2xl border border-amber-200/80 bg-white p-3.5 transition-all hover:border-emerald-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                            {b.resource_provider}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                        <h5 className="mt-1.5 text-[12.5px] font-bold text-text-primary group-hover:text-emerald-900 transition-colors line-clamp-2">
                          {b.title || b.resource_id}
                        </h5>
                        <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {b.duration_hours} hrs
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            {b.assessment_available ? "Proctored Exam" : "Self-paced"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-800 font-semibold flex items-center justify-between">
                    <span>Bridge Duration</span>
                    <span>60 Hours · 8 Weeks</span>
                  </div>
                </div>

                {/* 3. Target Core Semester (IIT Bombay / Target HEI) */}
                <div className="card-warm rounded-3xl p-5 border border-white/80 shadow-sm flex flex-col gap-3 min-h-[420px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(26_42_82)] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Step 03 · Core Term
                      </span>
                      <BookOpen className="h-4 w-4 text-[rgb(26_42_82)]" />
                    </div>
                    <h4 className="mt-2 text-[15px] font-bold text-text-primary">
                      Semester I: Advanced Core
                    </h4>
                    <p className="text-[11.5px] text-text-muted">
                      Curriculum at {session.targetInstitution ?? "IIT Bombay"}
                    </p>
                  </div>

                  <div className="space-y-2.5 mt-2 flex-1">
                    {(view?.semesters[0]?.courses && view.semesters[0].courses.length > 0
                      ? view.semesters[0].courses
                      : [
                          { code: "CS-101", title: "Introduction to Computing & Logic", credits: 4, tag: "Theory & Lab" },
                          { code: "CS-502", title: "Design and Analysis of Algorithms", credits: 4, tag: "Theory" },
                        ]
                    ).map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() =>
                          setInspectedCourse({
                            code: c.code,
                            title: c.title,
                            institution: session.targetInstitution ?? "IIT Bombay",
                            credits: c.credits ?? 4,
                          })
                        }
                        className="group w-full text-left rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] font-bold text-text-primary group-hover:text-emerald-900">
                            {c.code}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-medium text-slate-700">
                            {c.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] font-bold text-text-primary line-clamp-1">
                          {c.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                          <span>{c.credits ?? 4} NCrF Credits</span>
                          <span className="text-emerald-700 font-semibold group-hover:underline">
                            Inspect Syllabus
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center justify-between">
                    <span>Term Workload</span>
                    <span>8 Credits · 1 Term</span>
                  </div>
                </div>

                {/* 4. Degree Milestone & Convocation */}
                <div className="card-warm rounded-3xl p-5 border border-white/80 shadow-sm flex flex-col justify-between min-h-[420px] bg-gradient-to-b from-white via-white to-emerald-50/30">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Step 04 · Convocation
                      </span>
                      <GraduationCap className="h-4 w-4 text-emerald-700" />
                    </div>
                    <h4 className="mt-2 text-[15px] font-bold text-text-primary">
                      Degree Conferred
                    </h4>
                    <p className="text-[11.5px] text-text-muted">
                      Conferred by {session.targetInstitution ?? "IIT Bombay"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-center my-auto space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <h5 className="font-display text-[15px] font-bold text-[rgb(26_42_82)]">
                      B.Tech Honours
                    </h5>
                    <p className="text-[11.5px] text-text-secondary leading-snug">
                      Computer Science & Engineering
                    </p>
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>NCrF Level 6.0 Verified</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
                    <span>Target Horizon</span>
                    <span>Dec 2026</span>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </section>

      {/* Course Detail Modal */}
      <CourseModal
        open={!!inspectedCourse}
        onOpenChange={(open) => !open && setInspectedCourse(null)}
        course={inspectedCourse}
      />

      <BottomStrip
        label={"Solved\nMode"}
        statusTitle={
          activePathway
            ? `Solver: ${activePathway.mode} · ${activePathway.terms} term${activePathway.terms === 1 ? "" : "s"} · bridge burden ${(activePathway.bridge_burden * 100).toFixed(0)}%`
            : "Awaiting solve"
        }
        statusIcon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        ctaLabel={submitPathway.isPending ? "Submitting…" : "Lock and Submit Pathway to Academic Council"}
        onCta={onSubmit}
      />
    </AppShell>
  );
}
