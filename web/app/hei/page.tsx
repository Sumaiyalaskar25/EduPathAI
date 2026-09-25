"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Landmark, Loader2, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { ReviewQueue } from "@/components/hei/ReviewQueue";
import { HEI_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useHeiQueue, useDecisionReview } from "@/lib/api/hooks";

export default function HEIPage() {
  const session = useRequireRole("bos");
  const institution = session?.institution ?? "";
  const queue = useHeiQueue(institution || undefined);
  const review = useDecisionReview(institution || undefined);
  const [actingId, setActingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!session) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queue.refetch();
      toast.success("Review Queue Refreshed", {
        description: "Synchronized latest pending decisions from the ledger.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const onAction = async (id: string, action: "approve" | "reject", notes?: string) => {
    setActingId(id);
    try {
      await review.mutateAsync({ decisionId: id, decision: action, notes });
      toast.success(
        action === "approve"
          ? "Decision approved and cryptographically hash-chained."
          : "Decision rejected and recorded on ledger."
      );
    } catch {
      toast.error("Could not record the decision — try again.");
    } finally {
      setActingId(null);
    }
  };

  const topBarRight = (
    <>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing || queue.isFetching}
        className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>Refresh Queue</span>
      </button>

      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">BoS Reviewer · {institution}</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>

      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{queue.data?.items.length ?? 0} pending</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Board of Studies Review Queue"
      subtitle="Approve or reject AI-proposed recognition decisions"
      topBarRight={topBarRight}
      nav={HEI_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-4 md:px-6">
        <header className="mb-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white shadow-sm">
              <Landmark className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Institutional Reviewer Access
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Review queue
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            AI proposes structured recommendations. Rules decide the outcome.{" "}
            <span className="font-semibold text-text-primary">You are the structural gate.</span>{" "}
            Every approval or rejection is hash-chained to the audit ledger.
          </p>
        </header>

        {queue.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading review queue…
          </div>
        ) : queue.data ? (
          <ReviewQueue items={queue.data.items} stats={queue.data.stats} onAction={onAction} actingId={actingId} />
        ) : (
          <div className="py-24 text-center text-[13px] text-text-secondary">Could not load the review queue.</div>
        )}
      </section>

      <BottomStrip
        label={"Review\nSLA"}
        statusTitle={`${queue.data?.stats.pending ?? 0} pending decisions · Target 24h turnaround`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Approved Decisions Ledger"
        ctaHref="/hei/approved"
      />
    </AppShell>
  );
}
