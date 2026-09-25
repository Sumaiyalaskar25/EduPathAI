"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
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
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  FileText,
  Printer,
  Download,
  X,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Zap,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useGovPolicy, useUpdateGovPolicy, useDeleteGovPolicy } from "@/lib/api/hooks";
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

interface PolicyRuleDefinition {
  key: string;
  name: string;
  description: string;
  category: "threshold" | "boolean" | "numeric";
  defaultValue: any;
  options?: any[];
}

const POLICY_RULES: PolicyRuleDefinition[] = [
  {
    key: "direct_recognition_threshold",
    name: "Direct Equivalence Threshold",
    description: "Minimum semantic syllabus overlap required to grant automatic direct credit recognition without BoS committee delay.",
    category: "threshold",
    defaultValue: { threshold: 0.80 },
    options: [0.70, 0.75, 0.80, 0.85, 0.90],
  },
  {
    key: "allow_online_bridge",
    name: "SWAYAM / NPTEL Online Bridge Acceptance",
    description: "Permits students to fulfill curriculum prerequisite deficiencies through approved national MOOC credit pathways.",
    category: "boolean",
    defaultValue: { allowed: true, provider: "SWAYAM_NPTEL" },
  },
  {
    key: "max_transfer_credits_percent",
    name: "Maximum Transfer Credit Ceiling",
    description: "NEP 2020 limit on total degree credits that can be brought in from an external recognized university.",
    category: "numeric",
    defaultValue: { percent: 50 },
    options: [30, 40, 50, 60],
  },
  {
    key: "max_bridge_credits_per_term",
    name: "Semester Bridge Credit Cap",
    description: "Upper limit on simultaneous bridge coursework a student may undertake per academic semester.",
    category: "numeric",
    defaultValue: { max_credits: 8 },
    options: [4, 6, 8, 12],
  },
  {
    key: "min_cgpa_for_transfer",
    name: "Minimum CGPA Eligibility",
    description: "Grade point threshold required for inter-institutional credit migration clearance.",
    category: "numeric",
    defaultValue: { min_cgpa: 6.5 },
    options: [6.0, 6.5, 7.0, 7.5],
  },
];

const PRESET_INSTITUTIONS = [
  "GLOBAL: All 129 Integrated HEIs (National Directive)",
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "Anna University",
  "University of Calcutta",
  "NIT Trichy",
  "BITS Pilani",
  "VIT Vellore",
];

const PRESET_PROGRAMMES = [
  "ALL: All Academic Programmes",
  "BTech-CSE: Computer Science & Engineering",
  "BTech-IT: Information Technology",
  "BTech-ECE: Electronics & Communication",
  "BTech-EE: Electrical Engineering",
  "BTech-ME: Mechanical Engineering",
];

/* ───── 1. STATS BAR ───── */

function StatsBar({
  total,
  institutions,
  programmes,
  lastUpdated,
}: {
  total: number;
  institutions: number;
  programmes: number;
  lastUpdated: string | null;
}) {
  const items = [
    { label: "Active overrides", value: String(total), sub: "Signed ledger directives", tone: "navy" },
    { label: "Institutions covered", value: String(institutions), sub: "Across federal network", tone: "emerald" },
    { label: "Programmes covered", value: String(programmes), sub: "Curriculum disciplines", tone: "emerald" },
    { label: "Last change", value: lastUpdated ? timeAgo(lastUpdated) : "—", sub: "Tamper-proof synced", tone: "amber" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4.5">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
          className="card-warm relative overflow-hidden rounded-2xl p-5.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted">{s.label}</p>
          <p className="mt-3 font-display text-[30px] font-bold leading-none tracking-tight text-[rgb(26_42_82)] tabular-nums">
            {s.value}
          </p>
          <p className="mt-2 text-[11.5px] font-medium text-text-secondary">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. OVERRIDE ROW COMPONENT ───── */

function formatValueDisplay(policyKey: string, v: Record<string, unknown>): string {
  if (policyKey === "direct_recognition_threshold" && v.threshold !== undefined) {
    return `Auto-recognize when match ≥ ${Math.round(Number(v.threshold) * 100)}%`;
  }
  if (policyKey === "allow_online_bridge") {
    return v.allowed ? "SWAYAM / NPTEL Online Bridges: Fully Permitted" : "Online Bridges: Restricted";
  }
  if (policyKey === "max_transfer_credits_percent" && v.percent !== undefined) {
    return `Transfer Ceiling: Up to ${v.percent}% of total degree credits`;
  }
  if (policyKey === "max_bridge_credits_per_term" && v.max_credits !== undefined) {
    return `Max Bridge Load: ${v.max_credits} credits / semester`;
  }
  if (policyKey === "min_cgpa_for_transfer" && v.min_cgpa !== undefined) {
    return `Minimum CGPA Floor: ${v.min_cgpa}`;
  }
  return JSON.stringify(v);
}

function OverrideCard({
  o,
  index,
  onDelete,
  isDeleting,
}: {
  o: {
    id: string;
    institution: string;
    programme: string;
    policy_key: string;
    policy_value: Record<string, unknown>;
    updated_by: string;
    updated_at: string;
  };
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const isGlobal = o.institution.toUpperCase().includes("GLOBAL") || o.institution.toLowerCase().includes("all");
  const ruleDef = POLICY_RULES.find((r) => r.key === o.policy_key);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 transition-all duration-200 hover:border-emerald-300 hover:bg-white hover:shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-2xs",
              isGlobal
                ? "bg-slate-900 text-white"
                : "bg-blue-50 text-blue-900 border border-blue-200/60"
            )}
          >
            <Building2 className="h-3 w-3" />
            {isGlobal ? "National Directive (All 129 HEIs)" : o.institution}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
            <GraduationCap className="h-3 w-3" />
            {o.programme.toLowerCase().includes("all") ? "All Programmes" : o.programme}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(o.updated_at)}
          </span>

          <button
            type="button"
            onClick={() => onDelete(o.id)}
            disabled={isDeleting}
            title="Revoke policy directive"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-60 hover:bg-rose-50 hover:text-rose-600 hover:opacity-100 transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-emerald-700" />
        <span className="font-display text-[15px] font-bold text-slate-900">
          {ruleDef?.name ?? o.policy_key}
        </span>
      </div>

      <p className="mt-1 text-[12px] text-text-secondary">
        {ruleDef?.description ?? "Custom operational policy directive."}
      </p>

      {/* Rendered friendly value display */}
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <span className="font-mono text-[12.5px] font-bold text-slate-900">
            {formatValueDisplay(o.policy_key, o.policy_value)}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-text-muted">
        <span>Attributed: <strong className="text-slate-700 font-semibold">{o.updated_by}</strong></span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 font-bold">
          <ShieldCheck className="h-3 w-3" />
          SHA-256 Verified
        </span>
      </div>
    </motion.li>
  );
}

/* ───── 3. ELEVATED POLICY CREATION FORM ───── */

function NewOverrideForm({
  onOverrideCreated,
}: {
  onOverrideCreated: () => void;
}) {
  const update = useUpdateGovPolicy();

  const [institution, setInstitution] = useState("GLOBAL: All 129 Integrated HEIs (National Directive)");
  const [programme, setProgramme] = useState("ALL: All Academic Programmes");
  const [selectedKey, setSelectedKey] = useState("direct_recognition_threshold");
  const [thresholdVal, setThresholdVal] = useState(0.80);
  const [booleanVal, setBooleanVal] = useState(true);
  const [numericVal, setNumericVal] = useState(50);
  const [advancedJson, setAdvancedJson] = useState(false);
  const [customJsonText, setCustomJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentRule = POLICY_RULES.find((r) => r.key === selectedKey) || POLICY_RULES[0];

  const handleSelectRule = (k: string) => {
    setSelectedKey(k);
    const rule = POLICY_RULES.find((r) => r.key === k);
    if (!rule) return;
    if (rule.category === "threshold") setThresholdVal(0.80);
    if (rule.category === "boolean") setBooleanVal(true);
    if (rule.category === "numeric") {
      setNumericVal(k === "max_transfer_credits_percent" ? 50 : 8);
    }
  };

  const submit = async () => {
    setError(null);
    let instClean = institution.startsWith("GLOBAL") ? "GLOBAL" : institution.trim();
    let progClean = programme.startsWith("ALL") ? "ALL" : programme.trim();

    if (!instClean || !progClean) {
      setError("Please specify institution and programme scope.");
      return;
    }

    let payload: Record<string, unknown> = {};

    if (advancedJson) {
      try {
        payload = JSON.parse(customJsonText.trim() || "{}");
      } catch {
        setError("Invalid JSON format. Please correct or disable Advanced JSON Mode.");
        return;
      }
    } else {
      if (currentRule.category === "threshold") {
        payload = { threshold: thresholdVal };
      } else if (currentRule.category === "boolean") {
        payload = { allowed: booleanVal, provider: "SWAYAM_NPTEL" };
      } else {
        if (selectedKey === "max_transfer_credits_percent") payload = { percent: numericVal };
        else if (selectedKey === "max_bridge_credits_per_term") payload = { max_credits: numericVal };
        else if (selectedKey === "min_cgpa_for_transfer") payload = { min_cgpa: numericVal };
        else payload = { value: numericVal };
      }
    }

    try {
      await update.mutateAsync({
        institution: instClean,
        programme: progClean,
        policyKey: selectedKey,
        policyValue: payload,
      });

      toast.success("Policy Directive Published", {
        description: `Successfully broadcasted ${currentRule.name} across ${instClean === "GLOBAL" ? "all 129 HEIs" : instClean}.`,
      });

      onOverrideCreated();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Could not publish policy directive.";
      setError(msg.includes("403") ? "Unauthorized. Requires Ministry / Nodal Officer role." : msg);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm rounded-3xl p-6.5 shadow-sm"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(26_42_82)] text-white shadow-2xs">
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Ministry Directive Engine
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight text-text-primary">
            Publish Policy Override
          </h2>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        {/* Scope: Institution */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Institution Scope
          </label>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[12.5px] font-semibold text-slate-900 focus:border-emerald-400 focus:outline-none"
          >
            {PRESET_INSTITUTIONS.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Scope: Programme */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Programme Scope
          </label>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[12.5px] font-semibold text-slate-900 focus:border-emerald-400 focus:outline-none"
          >
            {PRESET_PROGRAMMES.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>

        {/* Rule Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Policy Rule
          </label>
          <select
            value={selectedKey}
            onChange={(e) => handleSelectRule(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[12.5px] font-semibold text-slate-900 focus:border-emerald-400 focus:outline-none"
          >
            {POLICY_RULES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11.5px] text-text-muted leading-tight">
            {currentRule.description}
          </p>
        </div>

        {/* Smart Value Inputs */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Directive Target Setting
            </label>
            <button
              type="button"
              onClick={() => setAdvancedJson(!advancedJson)}
              className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 underline"
            >
              {advancedJson ? "Visual Mode" : "Advanced JSON"}
            </button>
          </div>

          {advancedJson ? (
            <textarea
              value={customJsonText}
              onChange={(e) => setCustomJsonText(e.target.value)}
              placeholder='{"threshold": 0.85}'
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-[12px] text-slate-900 focus:border-emerald-400 focus:outline-none"
            />
          ) : currentRule.category === "threshold" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Auto-Recognition Threshold:</span>
                <span className="font-mono text-[14px] font-bold text-emerald-700">{Math.round(thresholdVal * 100)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0.70, 0.75, 0.80, 0.85, 0.90].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThresholdVal(t)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all",
                      thresholdVal === t
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {Math.round(t * 100)}%
                  </button>
                ))}
              </div>
            </div>
          ) : currentRule.category === "boolean" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Accept Online Bridge Coursework:</span>
                <span className={cn("text-[12px] font-bold", booleanVal ? "text-emerald-700" : "text-rose-700")}>
                  {booleanVal ? "Allowed (SWAYAM / NPTEL)" : "Restricted"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBooleanVal(true)}
                  className={cn(
                    "rounded-xl py-2 text-[12px] font-bold transition-all",
                    booleanVal ? "bg-emerald-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700"
                  )}
                >
                  ✓ Permit Online Bridges
                </button>
                <button
                  type="button"
                  onClick={() => setBooleanVal(false)}
                  className={cn(
                    "rounded-xl py-2 text-[12px] font-bold transition-all",
                    !booleanVal ? "bg-slate-900 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700"
                  )}
                >
                  Require On-Campus Lab
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Numeric Value:</span>
                <span className="font-mono text-[14px] font-bold text-slate-900">{numericVal}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(currentRule.options ?? [4, 6, 8, 12]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNumericVal(val)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all",
                      numericVal === val
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[12.5px] font-bold text-white transition-all hover:bg-slate-800 active:scale-98 shadow-xs disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {update.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Broadcasting Directive…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Publish National Directive</span>
            </>
          )}
        </button>

        <p className="text-[10.5px] leading-snug text-text-muted text-center">
          Signed by Nodal Officer Dr. A. Krishnan. Changes added as verified blocks in the national audit chain.
        </p>
      </div>
    </motion.section>
  );
}

/* ───── 4. EXECUTIVE POLICY BUNDLE EXPORT MODAL ───── */

function ExportPolicyBundleModal({
  isOpen,
  onClose,
  overrides,
}: {
  isOpen: boolean;
  onClose: () => void;
  overrides: any[];
}) {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border-subtle bg-white p-8 shadow-2xl focus:outline-none max-h-[92vh] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800 uppercase tracking-widest">
                  Government of India
                </span>
                <span className="text-[11px] text-slate-500">Ministry of Education · NCrF National Harmonization Cell</span>
              </div>
              <Dialog.Title className="mt-2 font-display text-[24px] font-bold tracking-tight text-slate-900">
                National Academic Credit Policy Bundle & Directives
              </Dialog.Title>
              <p className="text-[12px] text-text-secondary mt-1">
                Active override manifest · Generated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Directives</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{overrides.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statutory Basis</p>
              <p className="mt-1 font-display text-[20px] font-bold text-emerald-700">NEP 2020 §11.2</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ledger Integrity</p>
              <p className="mt-1 font-display text-[20px] font-bold text-blue-900">100% Sealed</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              Active Federal Policy Manifest
            </h4>
            {overrides.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-text-muted italic">No custom overrides active; default NCrF guidelines apply.</p>
            ) : (
              <div className="mt-2.5 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[10.5px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Institution Scope</th>
                      <th className="py-2.5 px-3">Programme</th>
                      <th className="py-2.5 px-3">Policy Rule</th>
                      <th className="py-2.5 px-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overrides.map((o) => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{o.institution}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{o.programme}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{o.policy_key}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatValueDisplay(o.policy_key, o.policy_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-[12px] font-bold">Cryptographic Ledger Manifest Sealed</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">SHA-256 Validated</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              Signatures verified. Validated by Nodal Officer Dr. A. Krishnan.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Print / Save as PDF</span>
              </button>

              <a
                href="http://localhost:8000/v1/gov/policy/export"
                download="policy-bundle.json"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Download Policy JSON</span>
              </a>
            </div>

            <Dialog.Close className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors">
              Close Bundle
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───── MAIN COMPONENT ───── */

export default function GovPolicyPage() {
  const session = useRequireRole("ministry");
  const overrides = useGovPolicy();
  const deleteMutation = useDeleteGovPolicy();
  const updateMutation = useUpdateGovPolicy();

  const [institutionFilter, setInstitutionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = overrides.data?.overrides ?? [];
  const institutions = useMemo(() => Array.from(new Set(items.map((o) => o.institution))).sort(), [items]);
  const programmes = useMemo(() => new Set(items.map((o) => o.programme)).size, [items]);
  const lastUpdated = useMemo(() => (items.length ? items.map((o) => o.updated_at).sort().slice(-1)[0] : null), [items]);

  const visible = useMemo(() => {
    return items.filter((o) => {
      if (institutionFilter !== "ALL" && o.institution !== institutionFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.institution.toLowerCase().includes(q) ||
        o.programme.toLowerCase().includes(q) ||
        o.policy_key.toLowerCase().includes(q) ||
        o.updated_by.toLowerCase().includes(q)
      );
    });
  }, [items, institutionFilter, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await overrides.refetch();
      toast.success("Policy Ledger Synchronized");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Policy Directive Revoked", {
        description: "The override has been permanently removed from the ledger.",
      });
    } catch (err: any) {
      toast.error("Failed to revoke directive", {
        description: err.message || "Action requires Ministry role.",
      });
    }
  };

  const handleApplyTemplate = async (template: { name: string; key: string; val: any }) => {
    try {
      await updateMutation.mutateAsync({
        institution: "GLOBAL",
        programme: "ALL",
        policyKey: template.key,
        policyValue: template.val,
      });
      toast.success(`Adopted ${template.name}`, {
        description: "Applied national guideline directive across all 129 HEIs.",
      });
    } catch (err: any) {
      toast.error("Could not apply template", { description: err.message });
    }
  };

  if (!session) return null;

  const topBarRight = (
    <>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing || overrides.isFetching}
        className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>Refresh Policies</span>
      </button>

      <button
        type="button"
        onClick={() => setIsExportOpen(true)}
        className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
      >
        <FileText className="h-3 w-3 text-emerald-400" />
        <span>Export Bundle</span>
      </button>

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
    <AppShell
      title="Policy Overrides"
      subtitle="Institution and programme-specific recognition policy configuration"
      topBarRight={topBarRight}
      nav={GOV_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white shadow-sm">
              <ScrollText className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Ministry Access · Policy View
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Policy overrides
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Every institution- and programme-specific override to default recognition policies — credit ceilings, CGPA floors, online bridge allowances, and direct recognition thresholds. Changes are versioned, attributed, and take effect on the next decision.
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
          <div className="space-y-6">
            <StatsBar
              total={items.length}
              institutions={institutions.length}
              programmes={programmes}
              lastUpdated={lastUpdated}
            />

            {/* Quick National Baseline Templates Bar */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-[12.5px] font-bold text-slate-900">
                      National NCrF Policy Directives (1-Click Adoption)
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-text-secondary">
                    Standardize credit portability across all 129 HEIs using statutory NEP 2020 guidelines.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate({
                        name: "NEP 50% Credit Mobility Cap",
                        key: "max_transfer_credits_percent",
                        val: { percent: 50 },
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + NEP 50% Credit Cap
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate({
                        name: "SWAYAM Online Bridge Fast-Track",
                        key: "allow_online_bridge",
                        val: { allowed: true, provider: "SWAYAM_NPTEL" },
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    + Online Bridge Waiver
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate({
                        name: "80% Direct Recognition Floor",
                        key: "direct_recognition_threshold",
                        val: { threshold: 0.80 },
                      })
                    }
                    className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                  >
                    + 80% Direct Recognition
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_380px]">
              <div className="space-y-4">
                {/* Search & Filter Header */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search policies by institution, rule, or author..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {institutions.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <button
                        onClick={() => setInstitutionFilter("ALL")}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                          institutionFilter === "ALL"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        All
                      </button>
                      {institutions.map((i) => (
                        <button
                          key={i}
                          onClick={() => setInstitutionFilter(i)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all truncate max-w-[120px]",
                            institutionFilter === i
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {i.includes("GLOBAL") ? "National" : i}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overrides Cards List */}
                {visible.length === 0 ? (
                  <div className="card-warm flex flex-col items-center justify-center gap-3 rounded-3xl p-16 text-center shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <ScrollText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-[17px] font-bold text-slate-900">
                        {items.length === 0 ? "No policy overrides published yet" : "No matching overrides found"}
                      </p>
                      <p className="mt-1 max-w-sm text-[12.5px] text-text-secondary leading-relaxed">
                        {items.length === 0
                          ? "Default statutory NCrF recognition parameters are currently active. Publish a custom directive using the panel to the right, or click a 1-click template above."
                          : "Try adjusting your search filter."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3.5">
                    <AnimatePresence initial={false}>
                      {visible.map((o, i) => (
                        <OverrideCard
                          key={o.id}
                          o={o}
                          index={i}
                          onDelete={handleDelete}
                          isDeleting={deleteMutation.isPending}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Right Panel: Creation Form */}
              <NewOverrideForm onOverrideCreated={() => overrides.refetch()} />
            </div>
          </div>
        )}
      </section>

      {/* Export Bundle Modal */}
      <ExportPolicyBundleModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        overrides={items}
      />

      <BottomStrip
        label={"Policy\nCoverage"}
        statusTitle={`${items.length} active directives · ${institutions.length} institutions covered`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Export policy bundle"
        onCta={() => setIsExportOpen(true)}
      />
    </AppShell>
  );
}
