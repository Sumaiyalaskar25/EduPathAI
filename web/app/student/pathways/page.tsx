"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { PathwayTabs } from "@/components/pathways/PathwayTabs";
import { SemesterColumn } from "@/components/pathways/SemesterColumn";
import { SummerBridgeCard } from "@/components/pathways/SummerBridgeCard";
import { CurriculumBadge } from "@/components/pathways/CurriculumBadge";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { DEMO_PATHWAYS, type PathwayKey } from "@/lib/constants/demo-pathways";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useSubmitPathway } from "@/lib/api/hooks";
import { pathwayToView } from "@/lib/transforms/pathway";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PathwaySolverPage() {
  const session = useRequireRole("learner");
  const router = useRouter();
  const [selected, setSelected] = useState<PathwayKey>("BALANCED");
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

  const view = useMemo(() => {
    if (!activePathway || !runPathway.data) return null;
    return pathwayToView(activePathway, runPathway.data.matches ?? [], runPathway.data.bridges ?? []);
  }, [activePathway, runPathway.data]);

  const availableModes = new Set(runPathway.data?.pathways.map((p) => p.mode) ?? []);
  const options = DEMO_PATHWAYS.filter((o) => availableModes.size === 0 || availableModes.has(o.key));

  const total = runPathway.data
    ? runPathway.data.recognition.direct +
    runPathway.data.recognition.bridge +
    runPathway.data.recognition.missing +
    runPathway.data.recognition.review +
    runPathway.data.recognition.policy_conflict
    : 0;
  const percent = total
    ? Math.round(((runPathway.data!.recognition.direct + runPathway.data!.recognition.bridge) / total) * 100)
    : 0;

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <CurriculumBadge institution={session.targetInstitution ?? "—"} version="v2026.1" />
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
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-6 md:px-6">
        {runPathway.isPending && !runPathway.data ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Solving your optimal pathway…
          </div>
        ) : !runPathway.data || options.length === 0 ? (
          <div className="py-24 text-center text-[13px] text-text-secondary">
            No solved pathways yet — the solver couldn&apos;t find a feasible plan for this run.
          </div>
        ) : (
          <>
            <PathwayTabs options={options} selected={selected} onSelect={setSelected} />

            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex min-w-[1100px] items-stretch gap-4">
                {view?.semesters.map((sem, i) => (
                  <SemesterColumn key={sem.id} semester={sem} index={i} />
                ))}
                {view?.summerBridge && (
                  <div className="flex shrink-0 items-center pt-10">
                    <SummerBridgeCard bridge={view.summerBridge} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <BottomStrip
        label={"Solved\nMode"}
        statusTitle={
          activePathway
            ? `Solver: ${activePathway.mode} · ${activePathway.terms} terms · bridge burden ${(activePathway.bridge_burden * 100).toFixed(0)}%`
            : "Awaiting solve"
        }
        statusIcon={<CheckCircle2 className="h-4 w-4" />}
        ctaLabel={submitPathway.isPending ? "Submitting…" : "Lock and Submit Pathway to Academic Council"}
        onCta={onSubmit}
      />
    </AppShell>
  );
}
