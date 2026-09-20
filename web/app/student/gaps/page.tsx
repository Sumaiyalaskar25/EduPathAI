"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { SourceTargetPill } from "@/components/gaps/SourceTargetPill";
import { OutcomeDeltaTable } from "@/components/gaps/OutcomeDeltaTable";
import { BloomRadar } from "@/components/gaps/BloomRadar";
import { BridgeCourseCard } from "@/components/gaps/BridgeCourseCard";
import { ContentAlignmentBadge } from "@/components/gaps/ContentAlignmentBadge";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useUpdatePlan } from "@/lib/api/hooks";
import { matchesAndGapsToOutcomeRows, matchesToRadar, bridgesToCourseCards } from "@/lib/transforms/gaps";
import { toast } from "sonner";

export default function GapAnalysisPage() {
  const session = useRequireRole("learner");
  const runPathway = useRunPathway();
  const updatePlan = useUpdatePlan();

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
      toast.success("Academic plan updated");
    } catch {
      toast.error("Could not update the plan — try again.");
    }
  };

  return (
    <AppShell
      title="Gap-Find & BridgePath Curriculum Reconciler"
      subtitle="Outcome delta, signal breakdown, and bridge recommendations"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-6 md:px-6">
        <SourceTargetPill
          source={session.institution ?? "Source institution"}
          target={session.targetInstitution ?? "Target institution"}
        />

        {runPathway.isPending && !runPathway.data ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing outcome gaps…
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
            <div>
              <OutcomeDeltaTable rows={rows} />
            </div>

            <div>
              <BloomRadar data={radar} headline={`${matches.length} course${matches.length === 1 ? "" : "s"} evaluated`} />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-[14px] font-bold leading-tight tracking-tight text-text-primary">
                  Recommended Bridge Courses
                  <span className="ml-1 text-text-muted">-</span>
                  <br />
                  <span className="text-gradient-navy">BridgePath Engine</span>
                </h2>
              </div>
              {bridgeCards.length === 0 ? (
                <p className="text-[12.5px] text-text-secondary">No bridges needed for this run.</p>
              ) : (
                bridgeCards.map((course, i) => <BridgeCourseCard key={course.id} course={course} index={i} />)
              )}
            </div>
          </div>
        )}
      </section>

      <BottomStrip
        label={"Workload\nVariance"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel={updatePlan.isPending ? "Updating…" : "Proceed & Update Academic Plan"}
        onCta={onProceed}
      />
    </AppShell>
  );
}
