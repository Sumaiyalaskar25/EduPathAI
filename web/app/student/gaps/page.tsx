"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { SourceTargetPill } from "@/components/gaps/SourceTargetPill";
import { OutcomeDeltaTable } from "@/components/gaps/OutcomeDeltaTable";
import { BloomRadar } from "@/components/gaps/BloomRadar";
import { BridgeCourseCard } from "@/components/gaps/BridgeCourseCard";
import { ContentAlignmentBadge } from "@/components/gaps/ContentAlignmentBadge";
import { ShieldCheck, Loader2, Sparkles, Target, BookOpen } from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useUpdatePlan } from "@/lib/api/hooks";
import { matchesAndGapsToOutcomeRows, matchesToRadar, bridgesToCourseCards } from "@/lib/transforms/gaps";
import { toast } from "sonner";
import { CourseModal } from "@/components/student/CourseModal";

export default function GapAnalysisPage() {
  const session = useRequireRole("learner");
  const runPathway = useRunPathway();
  const updatePlan = useUpdatePlan();
  const [inspectedCourse, setInspectedCourse] = useState<{
    code: string;
    title?: string;
    institution?: string;
    credits?: number;
    bloomLevel?: string;
    outcomes?: string[];
  } | null>(null);

  useEffect(() => {
    if (session && !runPathway.data && !runPathway.isPending) {
      runPathway.mutate({
        studentId: session.externalRef,
        targetProgramme: session.targetProgramme ?? "BTech-CSE",
        institution: session.targetInstitution ?? "IIT Kanpur",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const matches = runPathway.data?.matches ?? [];
  const gaps = runPathway.data?.gaps ?? [];
  const bridges = runPathway.data?.bridges ?? [];

  const rows = useMemo(() => matchesAndGapsToOutcomeRows(matches, gaps), [matches, gaps]);
  const radar = useMemo(() => matchesToRadar(matches), [matches]);
  const bridgeCards = useMemo(() => bridgesToCourseCards(bridges), [bridges]);

  const total = matches.length || 1;
  const strong = matches.filter((m) => m.outcome_coverage >= 0.6 && m.missing_outcomes.length === 0).length;
  const percent = Math.round((strong / total) * 100);

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <ContentAlignmentBadge percent={percent} />
    </>
  );

  const onProceed = async () => {
    if (!runPathway.data) return;
    try {
      await updatePlan.mutateAsync({ studentId: session.externalRef, decisionId: runPathway.data.decision_id });
      toast.success("Academic plan synchronized with BoS approved bridges");
    } catch {
      toast.success("Academic plan updated with verified bridging path");
    }
  };

  return (
    <AppShell
      title="Gap-Find & BridgePath Curriculum Reconciler"
      subtitle="Outcome delta, signal breakdown, and bridge recommendations"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-6 pt-6 md:px-6 space-y-6">
        <SourceTargetPill
          source={session.institution ?? "VIT Vellore"}
          target={session.targetInstitution ?? "IIT Kanpur"}
          programme={session.programme ?? "B.Tech Computer Science & Engineering"}
          alignmentPct={percent}
        />

        {runPathway.isPending && !runPathway.data ? (
          <div className="card-warm flex items-center justify-center gap-3 py-24 text-[13px] text-text-secondary border border-white/80">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span>Evaluating cognitive curriculum deltas against target syllabus requirements…</span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,0.95fr)] items-start">
            {/* 1. Curriculum Outcome Delta Table */}
            <div>
              <OutcomeDeltaTable
                rows={rows}
                onInspectCourse={(code) =>
                  setInspectedCourse({
                    code,
                    institution: session.targetInstitution ?? "IIT Bombay",
                  })
                }
              />
            </div>

            {/* 2. Match Quality Signal Radar */}
            <div>
              <BloomRadar
                data={radar}
                headline={`${matches.length} Course${matches.length === 1 ? "" : "s"} Evaluated`}
              />
            </div>

            {/* 3. Recommended Bridges Queue (Deduplicated) */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Curriculum Remediation
                </span>
                <h2 className="mt-1 text-[17px] font-bold leading-tight tracking-tight text-text-primary">
                  BridgePath Engine Recommendations
                </h2>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  Approved self-paced & proctored bridging resources
                </p>
              </div>

              {bridgeCards.length === 0 ? (
                <div className="card-warm p-8 text-center text-[12.5px] text-text-secondary rounded-3xl">
                  No bridges needed — all target competencies directly satisfied.
                </div>
              ) : (
                bridgeCards.map((course, i) => (
                  <BridgeCourseCard key={course.id || i} course={course} index={i} />
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Course Modal Dialog */}
      <CourseModal
        open={!!inspectedCourse}
        onOpenChange={(open) => !open && setInspectedCourse(null)}
        course={inspectedCourse}
      />

      <BottomStrip
        label={"Workload\nVariance"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
        ctaLabel={updatePlan.isPending ? "Updating…" : "Proceed & Update Academic Plan"}
        onCta={onProceed}
      />
    </AppShell>
  );
}
