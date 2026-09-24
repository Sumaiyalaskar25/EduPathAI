"use client";

import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useStudentProfile } from "@/lib/api/hooks";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationCard } from "@/components/feedback/ConfirmationCard";

export default function PathwaySubmitPage() {
  const session = useRequireRole("learner");
  const profile = useStudentProfile(session?.externalRef);

  const dynamicAuditId = profile.data?.decisions[0]?.decision_id
    ? `audit-council-${profile.data.decisions[0].decision_id.slice(0, 18)}`
    : `audit-pathway-${(session?.externalRef ?? "student-004")}-sha256`;

  return (
    <AppShell
      title="Pathway Submitted"
      subtitle="Locked and sent to Academic Council"
    >
      <ConfirmationCard
        eyebrow="Locked & Submitted to BoS"
        title="Your pathway proposal is submitted."
        description={`The Academic Council and Board of Studies at ${session?.targetInstitution ?? "IIT Kanpur"} will review your submission for ${session?.programme ?? "your programme"}. All credit mappings are hash-locked to the national audit ledger.`}
        auditId={dynamicAuditId}
        timestamp="Just now"
        primaryHref="/student/audit"
        primaryLabel="Track on Sovereign Ledger"
        secondaryHref="/student/pathways"
        secondaryLabel="Return to Pathways"
      />
    </AppShell>
  );
}