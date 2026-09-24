"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ScrollText,
  ShieldCheck,
  Building2,
  GraduationCap,
  Clock,
  Loader2,
  PlusCircle,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useGovPolicy, useUpdateGovPolicy } from "@/lib/api/hooks";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const SUGGESTED_KEYS = [
  "max_transfer_credits_percent",
  "min_cgpa_for_transfer",
  "allow_online_bridge",
  "max_bridge_credits_per_term",
  "direct_recognition_threshold",
  "bridge_recognition_threshold",
];

/* ───── 1. STATS ───── */

function StatsBar({ total, institutions, programmes, lastUpdated }: { total: number; institutions: number; programmes: number; lastUpdated: string | null }) {
  const items = [
    { label: "Active overrides", value: String(total) },
    { label: "Institutions covered", value: String(institutions) },
    { label: "Programmes covered", value: String(programmes) },
    { label: "Last change", value: lastUpdated ? timeAgo(lastUpdated) : "—" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }} className="card-warm p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">{s.label}</p>
          <p className="mt-3 font-display text-[26px] font-bold leading-none tracking-tight text-[rgb(26_42_82)] tabular-nums">{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. OVERRIDE ROW ───── */

function formatValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return JSON.stringify(v);
}

function OverrideRow({ o, index }: { o: { id: string; institution: string; programme: string; policy_key: string; policy_value: Record<string, unknown>; updated_by: string; updated_at: string }; index: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)]/8 px-2.5 py-1 text-[11px] font-semibold text-[rgb(26_42_82)]">
            <Building2 className="h-3 w-3" />
            {o.institution}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <GraduationCap className="h-3 w-3" />
            {o.programme}
          </span>
        </div>
        <span className="flex items-center gap-1 font-mono text-[10.5px] text-text-muted">
          <Clock className="h-3 w-3" />
          {timeAgo(o.updated_at)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5 text-text-muted" />
        <span className="font-mono text-[12.5px] font-semibold text-text-primary">{o.policy_key}</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(o.policy_value ?? {}).length > 0 ? (
          Object.entries(o.policy_value).map(([k, v]) => (
            <span key={k} className="rounded-lg bg-canvas px-2 py-1 font-mono text-[11px] text-text-secondary">
              {k}: <span className="font-semibold text-text-primary">{formatValue(v)}</span>
            </span>
          ))
        ) : (
          <span className="rounded-lg bg-canvas px-2 py-1 font-mono text-[11px] text-text-secondary">{formatValue(o.policy_value)}</span>
        )}
      </div>

      <p className="mt-3 text-[11px] text-text-muted">Set by {o.updated_by}</p>
    </motion.li>
  );
}

/* ───── 3. NEW OVERRIDE FORM ───── */

function NewOverrideForm({ institutionOptions }: { institutionOptions: string[] }) {
  const update = useUpdateGovPolicy();
  const [institution, setInstitution] = useState("");
  const [programme, setProgramme] = useState("");
  const [policyKey, setPolicyKey] = useState("");
  const [valueText, setValueText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!institution.trim() || !programme.trim() || !policyKey.trim()) {
      setError("Institution, programme, and policy key are all required.");
      return;
    }
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(valueText.trim() || "{}");
    } catch {
      setError('Value must be valid JSON, e.g. {"threshold": 0.85} or {"enabled": true}.');
      return;
    }
    update.mutate(
      { institution: institution.trim(), programme: programme.trim(), policyKey: policyKey.trim(), policyValue: parsed },
      {
        onSuccess: () => {
          toast.success("Policy override saved and effective immediately.");
          setPolicyKey("");
          setValueText("");
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Could not save this override.";
          setError(msg.includes("403") || msg.toLowerCase().includes("forbidden") ? "Your session isn't authorized to set policy (requires the ministry role)." : msg);
        },
      }
    );
  };

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} className="card-warm rounded-3xl p-7">
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          <PlusCircle className="h-4 w-4 text-emerald-700" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">New override</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight text-text-primary">Set or update a policy</h2>
        </div>
      </header>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-text-secondary">Institution</label>
          <input
            list="gov-policy-institutions"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="IIT-Bombay"
            className="mt-1 w-full rounded-xl border border-border-subtle bg-white/70 px-3.5 py-2.5 text-[13px] font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-[rgb(26_42_82)]/40 focus:bg-white"
          />
          <datalist id="gov-policy-institutions">
            {institutionOptions.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-secondary">Programme</label>
          <input
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            placeholder="BTech-CSE"
            className="mt-1 w-full rounded-xl border border-border-subtle bg-white/70 px-3.5 py-2.5 text-[13px] font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-[rgb(26_42_82)]/40 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-secondary">Policy key</label>
          <input
            list="gov-policy-keys"
            value={policyKey}
            onChange={(e) => setPolicyKey(e.target.value)}
            placeholder="direct_recognition_threshold"
            className="mt-1 w-full rounded-xl border border-border-subtle bg-white/70 px-3.5 py-2.5 text-[13px] font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-[rgb(26_42_82)]/40 focus:bg-white"
          />
          <datalist id="gov-policy-keys">
            {SUGGESTED_KEYS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-secondary">Value (JSON)</label>
          <textarea
            value={valueText}
            onChange={(e) => setValueText(e.target.value)}
            placeholder='{"threshold": 0.85}'
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-border-subtle bg-white/70 px-3.5 py-2.5 font-mono text-[12.5px] text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-[rgb(26_42_82)]/40 focus:bg-white"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-[11.5px] text-rose-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={update.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[rgb(26_42_82)] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[rgb(20_33_66)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {update.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save override"
          )}
        </button>
        <p className="text-[10.5px] leading-snug text-text-muted">
          Overrides are upserted per institution + programme + key, and applied immediately to new recognition decisions. Requires the ministry role.
        </p>
      </div>
    </motion.section>
  );
}

/* ───── MAIN ───── */

export default function GovPolicyPage() {
  const session = useRequireRole("ministry");
  const overrides = useGovPolicy();
  const [institutionFilter, setInstitutionFilter] = useState("ALL");

  const items = overrides.data?.overrides ?? [];
  const institutions = useMemo(() => Array.from(new Set(items.map((o) => o.institution))).sort(), [items]);
  const programmes = useMemo(() => new Set(items.map((o) => o.programme)).size, [items]);
  const lastUpdated = useMemo(() => (items.length ? items.map((o) => o.updated_at).sort().slice(-1)[0] : null), [items]);
  const visible = useMemo(() => (institutionFilter === "ALL" ? items : items.filter((o) => o.institution === institutionFilter)), [items, institutionFilter]);

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">Ministry / Nodal Officer</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{items.length} active overrides</span>
      </span>
    </>
  );

  return (
    <AppShell title="Policy Overrides" subtitle="Institution and programme-specific recognition policy configuration" topBarRight={topBarRight} nav={GOV_NAV} reserveBottom>
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <ScrollText className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Ministry Access · Policy View</p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">Policy overrides</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Every institution- and programme-specific override to the default recognition policy — credit ceilings, CGPA floors, bridge allowances, and recognition
            thresholds. Changes are versioned, attributed, and take effect on the next decision.
          </p>
        </motion.header>

        {overrides.isLoading ? (
          <TableSkeleton rows={4} />
        ) : overrides.isError ? (
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">We couldn't load policy overrides.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {overrides.error instanceof Error ? overrides.error.message : "Try refreshing the page."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <StatsBar total={items.length} institutions={institutions.length} programmes={programmes} lastUpdated={lastUpdated} />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {institutions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setInstitutionFilter("ALL")}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                        institutionFilter === "ALL" ? "bg-[rgb(26_42_82)] text-white" : "border border-border-subtle bg-white/70 text-text-secondary hover:bg-white"
                      )}
                    >
                      All institutions
                    </button>
                    {institutions.map((i) => (
                      <button
                        key={i}
                        onClick={() => setInstitutionFilter(i)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                          institutionFilter === i ? "bg-[rgb(26_42_82)] text-white" : "border border-border-subtle bg-white/70 text-text-secondary hover:bg-white"
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}

                {visible.length === 0 ? (
                  <div className="card-warm flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <ScrollText className="h-6 w-6 text-text-muted" />
                    <p className="text-[14px] font-semibold text-text-primary">{items.length === 0 ? "No policy overrides set yet" : "No overrides for this institution"}</p>
                    <p className="text-[12px] text-text-secondary">{items.length === 0 ? "Set one using the form to the right." : "Try a different institution."}</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {visible.map((o, i) => (
                        <OverrideRow key={o.id} o={o} index={i} />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              <NewOverrideForm institutionOptions={institutions} />
            </div>
          </div>
        )}
      </section>

      <BottomStrip
        label={"Policy\nCoverage"}
        statusTitle={`${items.length} active overrides · ${institutions.length} institutions covered`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Export policy bundle"
      />
    </AppShell>
  );
}
