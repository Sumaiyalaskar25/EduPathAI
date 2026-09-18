"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { PathwayTabs } from "@/components/pathways/PathwayTabs";
import { SemesterColumn } from "@/components/pathways/SemesterColumn";
import { SummerBridgeCard } from "@/components/pathways/SummerBridgeCard";
import { CurriculumBadge } from "@/components/pathways/CurriculumBadge";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import {
  DEMO_PATHWAYS,
  DEMO_SEMESTERS,
  DEMO_SUMMER_BRIDGE,
  type PathwayKey,
} from "@/lib/constants/demo-pathways";
import { DEMO_STUDENT } from "@/lib/constants/demo";
import { CheckCircle2 } from "lucide-react";

export default function PathwaySolverPage() {
  const [selected, setSelected] = useState<PathwayKey>("BALANCED");

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
      title="Path-Solve Optimizer"
      subtitle="Multi-Objective Degree Pathway Generator"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-6 md:px-6">
        {/* Pathway selector cards */}
        <PathwayTabs
          options={DEMO_PATHWAYS}
          selected={selected}
          onSelect={setSelected}
        />

        {/* Semester timeline */}
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-[1100px] items-stretch gap-4">
            {/* Semester V */}
            <SemesterColumn semester={DEMO_SEMESTERS[0]} index={0} />

            {/* Summer Bridge between V and VI */}
            <div className="flex shrink-0 items-center pt-10">
              <SummerBridgeCard bridge={DEMO_SUMMER_BRIDGE} />
            </div>

            {/* Semester VI, VII, VIII */}
            <SemesterColumn semester={DEMO_SEMESTERS[1]} index={1} />
            <SemesterColumn semester={DEMO_SEMESTERS[2]} index={2} />
            <SemesterColumn semester={DEMO_SEMESTERS[3]} index={3} />
          </div>
        </div>
      </section>

            <BottomStrip
        label={"Workload\nVariance"}
        statusTitle="Solver Confidence: OPTIMAL (CBC 9.10)"
        statusIcon={<CheckCircle2 className="h-4 w-4" />}
        ctaLabel="Lock and Submit Pathway to Academic Council"
        ctaHref="/student/pathways/submit"
      />
    </AppShell>
  );
}