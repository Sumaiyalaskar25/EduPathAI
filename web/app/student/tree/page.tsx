"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { PathwayInfographic } from "@/components/tree/PathwayInfographic";
import { CompetencyPanel } from "@/components/tree/CompetencyPanel";
import { CurriculumBadge } from "@/components/pathways/CurriculumBadge";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { DEMO_STUDENT } from "@/lib/constants/demo";
import { ShieldCheck } from "lucide-react";

export default function TreeViewPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          APAAR: {DEMO_STUDENT.apaar}
        </span>
        <span className="text-text-muted">·</span>
        <span>{DEMO_STUDENT.programme}</span>
      </span>
      <CurriculumBadge institution="IIT Bombay" version="v2026.1" />
      <RecognizedBadge percent={72} />
    </>
  );

  return (
    <AppShell
      title="Student Academic Tree"
      subtitle="& Competency Explorer"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <PathwayInfographic />
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)]">
            <CompetencyPanel />
          </div>
        </div>
      </section>

            <BottomStrip
        label={"Workload\nVariance"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}