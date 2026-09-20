"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useStudentProfile } from "@/lib/api/hooks";

export default function ProfilePage() {
  const session = useRequireRole("learner");
  const profile = useStudentProfile(session?.externalRef);

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{profile.data?.security.chain_integrity ?? "…"}</span>
      </span>
    </>
  );

  return (
    <AppShell title="Profile" subtitle="Identity, consent, and decision history" topBarRight={topBarRight} reserveBottom>
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-4 md:px-6">
        {profile.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile…
          </div>
        ) : profile.data ? (
          <ProfilePanel profile={profile.data} externalRef={session.externalRef} />
        ) : (
          <div className="py-24 text-center text-[13px] text-text-secondary">Could not load profile.</div>
        )}
      </section>

      <BottomStrip
        label={"Account\nHealth"}
        statusTitle="All consents active · Chain verified"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Download Full Audit Report"
        ctaHref="/student/audit"
      />
    </AppShell>
  );
}
