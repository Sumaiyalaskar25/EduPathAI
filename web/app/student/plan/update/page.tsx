"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationCard } from "@/components/feedback/ConfirmationCard";

export default function PlanUpdatePage() {
  return (
    <AppShell
      title="Plan Updated"
      subtitle="Academic plan refreshed with new credits"
    >
      <ConfirmationCard
        eyebrow="Plan Updated"
        title="Your academic plan is refreshed."
        description="Bridges, credits, and semester mappings have been recomputed. Your updated pathway now reflects the latest recognition decisions from the Board of Studies."
        auditId="audit-plan-8f2d5a8b-1c4e-7f2a"
        timestamp="just now"
        primaryHref="/student"
        primaryLabel="View dashboard"
        secondaryHref="/student/audit"
        secondaryLabel="Open Ledger"
      />
    </AppShell>
  );
}