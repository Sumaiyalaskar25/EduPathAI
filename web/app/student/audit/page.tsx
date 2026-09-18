import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { DecisionTimeline } from "@/components/ledger/DecisionTimeline";
import { CodePanel } from "@/components/ledger/CodePanel";
import {
  DEMO_LEDGER_EVENTS,
  DEMO_BUNDLE_JSON,
} from "@/lib/constants/demo-ledger";
import { DEMO_STUDENT, DEMO_CHAIN } from "@/lib/constants/demo";
import { ShieldCheck, Download, RotateCcw, ArrowUpRight } from "lucide-react";

export default function LedgerPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          APAAR: {DEMO_STUDENT.apaar}
        </span>
        <span className="text-text-muted">·</span>
        <span>{DEMO_STUDENT.programme}</span>
      </span>
      <span className="pill hidden md:inline-flex">
        Chain ID: {DEMO_CHAIN.id}
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{DEMO_CHAIN.integrity}</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Gap-Find & BridgePath Curriculum Reconciler"
      subtitle="Tamper-evident verification of AI and human academic decisions"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-2 pt-6 md:px-6">
        {/* Page heading */}
        <header className="mb-8 max-w-3xl">
          <h1 className="font-sans text-[30px] font-bold leading-tight tracking-tight text-text-primary">
            Cryptographic Decision Bundle Explorer
            <span className="mx-2 text-text-muted">•</span>
            <span className="text-gradient-navy">Tamper-Evident Ledger</span>
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
            The sovereign audit trace ensures{" "}
            <span className="font-semibold text-text-primary">
              immutable, tamper-evident verification
            </span>{" "}
            of AI and human academic decisions.
          </p>
        </header>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_520px]">
          {/* Left: timeline */}
          <div>
            <DecisionTimeline events={DEMO_LEDGER_EVENTS} />
          </div>

          {/* Right: code panel + actions */}
          <aside className="flex flex-col gap-4">
            <CodePanel
              filename="decision_bundle.json"
              code={DEMO_BUNDLE_JSON}
            />

            <button className="pill-navy w-full justify-center !py-3.5">
              <Download className="h-4 w-4" />
              <span>Export Cryptographic Proof (PDF)</span>
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button className="flex w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-white/70 py-3.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white">
              <RotateCcw className="h-4 w-4" />
              <span>Replay Exact Decision State</span>
            </button>
          </aside>
        </div>
      </section>

      <BottomStrip
        label={"Audit Sync\nStatus"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
      />
    </AppShell>
  );
}