"use client";

import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useStudentProfile } from "@/lib/api/hooks";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationCard } from "@/components/feedback/ConfirmationCard";

export default function PlanUpdatePage() {
  const session = useRequireRole("learner");
  const profile = useStudentProfile(session?.externalRef);

  const latestAuditId = profile.data?.decisions[0]?.decision_id 
    ? `audit-ledger-${profile.data.decisions[0].decision_id.slice(0, 18)}`
    : `audit-sync-${(session?.externalRef ?? "student-004")}-sha256`;

  return (
    <AppShell
      title="Plan Updated"
      subtitle="Academic plan refreshed with validated credits"
    >
      <ConfirmationCard
        eyebrow="Academic Plan Synchronized"
        title="Your academic pathway is refreshed."
        description={`Bridges, credits, and semester mappings have been recomputed for ${session?.programme ?? "your programme"} at ${session?.targetInstitution ?? "IIT Kanpur"}. Your updated pathway now reflects the latest recognition decisions from the Board of Studies.`}
        auditId={latestAuditId}
        timestamp="Just now"
        primaryHref="/student"
        primaryLabel="Return to Dashboard"
        secondaryHref="/student/audit"
        secondaryLabel="View Sovereign Ledger"
      />
    </AppShell>
  );
}