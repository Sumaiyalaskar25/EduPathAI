import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { SourceTargetPill } from "@/components/gaps/SourceTargetPill";
import { OutcomeDeltaTable } from "@/components/gaps/OutcomeDeltaTable";
import { BloomRadar } from "@/components/gaps/BloomRadar";
import { BridgeCourseCard } from "@/components/gaps/BridgeCourseCard";
import { ContentAlignmentBadge } from "@/components/gaps/ContentAlignmentBadge";
import {
  DEMO_SOURCE_TARGET,
  DEMO_OUTCOME_ROWS,
  DEMO_BRIDGE_COURSES,
} from "@/lib/constants/demo-gaps";
import { DEMO_STUDENT } from "@/lib/constants/demo";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function GapAnalysisPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          APAAR: {DEMO_STUDENT.apaar}
        </span>
        <span className="text-text-muted">·</span>
        <span>{DEMO_STUDENT.programme}</span>
      </span>
      <ContentAlignmentBadge percent={72} />
    </>
  );

  return (
    <AppShell
      title="Gap-Find & BridgePath Curriculum Reconciler"
      subtitle="Outcome delta, cognitive depth, and bridge recommendations"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-6 md:px-6">
        {/* Source → Target pill */}
        <SourceTargetPill
          source={DEMO_SOURCE_TARGET.source}
          target={DEMO_SOURCE_TARGET.target}
        />

        {/* 3-column grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
          {/* Column 1: Outcome delta table */}
          <div>
            <OutcomeDeltaTable rows={DEMO_OUTCOME_ROWS} />
          </div>

          {/* Column 2: Bloom radar */}
          <div>
            <BloomRadar />
          </div>

          {/* Column 3: Bridge courses */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-[14px] font-bold leading-tight tracking-tight text-text-primary">
                Recommended Bridge Courses
                <span className="ml-1 text-text-muted">-</span>
                <br />
                <span className="text-gradient-navy">BridgePath Engine</span>
              </h2>
            </div>
            {DEMO_BRIDGE_COURSES.map((course, i) => (
              <BridgeCourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      <BottomStrip
        label={"Workload\nVariance"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
      />
    </AppShell>
  );
}