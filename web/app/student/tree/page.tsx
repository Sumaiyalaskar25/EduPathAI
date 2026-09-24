"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { PathwayInfographic } from "@/components/tree/PathwayInfographic";
import { CompetencyPanel } from "@/components/tree/CompetencyPanel";
import { CurriculumBadge } from "@/components/pathways/CurriculumBadge";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway } from "@/lib/api/hooks";
import { toRecognitionView } from "@/lib/transforms/recognition";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function TreeViewPage() {
  const session = useRequireRole("learner");
  const runPathway = useRunPathway();

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

  const alignment = toRecognitionView(runPathway.data?.recognition).recognizedPercent;
  const semsRemaining = runPathway.data?.pathways.length ? Math.min(...runPathway.data.pathways.map((p) => p.terms)) : 0;
  const primaryPathway = useMemo(
    () => (runPathway.data?.pathways.length ? [...runPathway.data.pathways].sort((a, b) => a.terms - b.terms)[0] : undefined),
    [runPathway.data]
  );

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <CurriculumBadge institution={session.targetInstitution ?? "—"} version={runPathway.data?.bundle.curriculum_version ?? "—"} />
      {runPathway.data && <RecognizedBadge percent={alignment} />}
    </>
  );

  return (
    <AppShell title="Student Academic Tree" subtitle="& Competency Explorer" topBarRight={topBarRight} reserveBottom>
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-4 md:px-6">
        {runPathway.isPending && !runPathway.data ? (
          <div className="card-warm flex items-center justify-center gap-2 p-10 text-center text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Running your pathway analysis…
          </div>
        ) : runPathway.isError ? (
          <div className="card-warm p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">We couldn't load your academic tree.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {runPathway.error instanceof Error ? runPathway.error.message : "Try refreshing the page."}
            </p>
          </div>
        ) : runPathway.data ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <PathwayInfographic
              recognition={runPathway.data.recognition}
              matches={runPathway.data.matches ?? []}
              bridges={runPathway.data.bridges ?? []}
              pathway={primaryPathway}
              semsRemaining={semsRemaining}
              sourceInstitution={session.institution ?? "Source institution"}
              targetInstitution={session.targetInstitution ?? "Target institution"}
            />
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)]">
              <CompetencyPanel gaps={runPathway.data.gaps} bridges={runPathway.data.bridges ?? []} />
            </div>
          </div>
        ) : null}
      </section>

      <BottomStrip
        label={"Recognition\nStatus"}
        statusTitle={runPathway.data ? `${alignment}% recognized · ${runPathway.data.gaps.length} gap${runPathway.data.gaps.length === 1 ? "" : "s"} open` : "Analyzing…"}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}
