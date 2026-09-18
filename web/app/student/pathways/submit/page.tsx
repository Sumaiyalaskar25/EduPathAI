"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationCard } from "@/components/feedback/ConfirmationCard";

export default function PathwaySubmitPage() {
  return (
    <AppShell
      title="Pathway Submitted"
      subtitle="Locked and sent to Academic Council"
    >
      <ConfirmationCard
        eyebrow="Locked & Submitted"
        title="Your pathway is on its way."
        description="The Academic Council will review your submission within 5 working days. You'll receive a notification the moment a decision is posted."
        auditId="audit-submit-9f83b165-a1c7-4d5e"
        timestamp="just now"
        primaryHref="/student/audit"
        primaryLabel="Track on Ledger"
        secondaryHref="/student/pathways"
        secondaryLabel="Back to pathways"
      />
    </AppShell>
  );
}