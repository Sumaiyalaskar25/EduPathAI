"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, UserCheck, Sparkles, AlertCircle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { IdentityMode } from "@/lib/constants/auth-ui";
import { useVerifyIdentity } from "@/lib/api/hooks";
import { useSessionStore } from "@/lib/store/session";
import type { AuthOverviewResponse } from "@/lib/api/types";
import { StudentOnboardingModal } from "@/components/auth/StudentOnboardingModal";

const IDENTITY_ROUTES: Record<IdentityMode, string> = {
  learner: "/student",
  bos: "/hei",
  ministry: "/gov",
};

interface Props {
  mode: IdentityMode;
  modeLabel: string;
  personas?: AuthOverviewResponse["personas"];
}

export function DigiLockerAccess({ mode, modeLabel, personas }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [consent, setConsent] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const setSession = useSessionStore((s) => s.setSession);
  const verify = useVerifyIdentity();

  // Reset identifier and select first persona on mode change
  useEffect(() => {
    if (personas) {
      if (mode === "learner" && personas.learner?.length) {
        selectPersona(personas.learner[0].raw_id, personas.learner[0].apaar.replace(/\s/g, ""));
      } else if (mode === "bos" && personas.bos?.length) {
        selectPersona(personas.bos[0].raw_id, personas.bos[0].raw_id);
      } else if (mode === "ministry" && personas.ministry?.length) {
        selectPersona(personas.ministry[0].raw_id, personas.ministry[0].raw_id);
      }
    }
  }, [mode, personas]);

  const selectPersona = (pId: string, val: string) => {
    setActivePersonaId(pId);
    setIdentifier(val);
    setConsent(true);
  };

  const cleanId = identifier.replace(/\s/g, "");
  const isValid = cleanId.length >= 3 && consent;
  const loading = verify.isPending;

  const onVerify = async () => {
    if (!isValid) {
      if (!consent) toast.error("Please grant consent to proceed with verification.");
      return;
    }
    try {
      const res = await verify.mutateAsync({ mode, identifier: cleanId, consent });
      setSession({
        token: res.token,
        role: res.role,
        externalRef: res.external_ref,
        displayName: res.display_name,
        institution: res.institution ?? undefined,
        programme: res.programme ?? undefined,
        targetInstitution: res.target_institution ?? undefined,
        targetProgramme: res.target_programme ?? undefined,
      });
      toast.success(`Identity Verified — Welcome, ${res.display_name}!`);
      router.push(IDENTITY_ROUTES[mode]);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Verification failed: ${err.message}`
          : "Verification failed. Check your credential identifier."
      );
    }
  };

  // Format APAAR as groups of 4 digits if numeric
  const displayValue = /^\d+$/.test(identifier.replace(/\s/g, ""))
    ? identifier.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
    : identifier;

  const currentPersonas = personas ? personas[mode] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="glass-strong relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/60 p-7 shadow-[0_12px_36px_-12px_rgb(0_0_0_/_0.06)] md:p-8"
    >
      {/* Decorative gradient corner */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/15 blur-2xl" />

      <div>
        <header>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-700">
            <span>Step 2</span>
            <span className="text-slate-400">·</span>
            <span>Authentication Gateway</span>
          </div>
          <h2 className="mt-2.5 font-display text-[25px] font-bold tracking-tight text-text-primary">
            {mode === "learner"
              ? "Verify with APAAR / ABC ID"
              : mode === "bos"
              ? "Sign in as Institutional Reviewer"
              : "State / Ministry Nodal Access"}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Signing in under authority of{" "}
            <span className="font-semibold text-text-primary">{modeLabel}</span>
          </p>
        </header>

        {/* First-Time Learner Registration Banner */}
        {mode === "learner" && (
          <div className="mt-4 rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    First-Time Student Onboarding
                  </p>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Set up your college, semester, transcript &amp; target course.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOnboardingOpen(true)}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
              >
                <span>Register Now</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Interactive Persona Selector */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              1-Click Verified Demo Personas
            </span>
            <span className="text-[10.5px] font-medium text-slate-500">
              Instant Autofill
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {mode === "learner" && personas?.learner?.map((stu) => {
              const active = activePersonaId === stu.raw_id;
              return (
                <button
                  key={stu.raw_id}
                  type="button"
                  onClick={() => selectPersona(stu.raw_id, stu.apaar.replace(/\s/g, ""))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-200",
                    active
                      ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-display text-[11px] font-bold text-slate-700">
                    {stu.name[0]}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-tight text-text-primary">
                      {stu.name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {stu.source.split(" ")[0]} → {stu.target.split(" ")[0]}
                    </p>
                  </div>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-1" />}
                </button>
              );
            })}

            {mode === "bos" && personas?.bos?.map((rev) => {
              const active = activePersonaId === rev.raw_id;
              return (
                <button
                  key={rev.raw_id}
                  type="button"
                  onClick={() => selectPersona(rev.raw_id, rev.raw_id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-all duration-200",
                    active
                      ? "border-purple-500 bg-purple-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-[12px] font-bold leading-tight text-text-primary">
                      {rev.name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {rev.institution}
                    </p>
                  </div>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 ml-1" />}
                </button>
              );
            })}

            {mode === "ministry" && personas?.ministry?.map((off) => {
              const active = activePersonaId === off.raw_id;
              return (
                <button
                  key={off.raw_id}
                  type="button"
                  onClick={() => selectPersona(off.raw_id, off.raw_id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-all duration-200",
                    active
                      ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-[12px] font-bold leading-tight text-text-primary">
                      {off.name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {off.department}
                    </p>
                  </div>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Credential input */}
        <div className="mt-5">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
            {mode === "learner"
              ? "APAAR / ABC ID OR Reference"
              : mode === "bos"
              ? "Reviewer ID / Institutional SSO"
              : "Nodal Officer Cadre Reference"}
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border-subtle bg-white px-4 py-3.5 shadow-sm transition-all focus-within:border-[rgb(26_42_82)] focus-within:ring-2 focus-within:ring-[rgb(26_42_82)]/10">
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setActivePersonaId(null);
              }}
              placeholder={
                mode === "learner"
                  ? "e.g. 9081 0000 2201 or student-001"
                  : mode === "bos"
                  ? "e.g. reviewer-001"
                  : "e.g. officer-001"
              }
              className="flex-1 bg-transparent text-[15px] font-medium tracking-wide text-text-primary outline-none placeholder:text-text-muted/60 placeholder:tracking-normal"
            />
          </div>
        </div>

        {/* Consent under DPDP Act */}
        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white/80 p-4 transition-colors">
          <label className="flex cursor-pointer items-start gap-3">
            <button
              type="button"
              onClick={() => setConsent(!consent)}
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                consent
                  ? "border-[rgb(26_42_82)] bg-[rgb(26_42_82)] text-white shadow-sm"
                  : "border-slate-300 bg-white hover:border-slate-400"
              )}
            >
              {consent && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
            <span className="text-[12px] leading-snug text-text-secondary select-none">
              <span className="font-semibold text-text-primary">
                Consent to secure data processing under DPDP Act (2023).
              </span>{" "}
              Zero PII persistence. Tokenized cryptographic verification only.
            </span>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={onVerify}
          disabled={!isValid || loading}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14.5px] font-bold tracking-tight transition-all duration-200",
            isValid && !loading
              ? "bg-[rgb(26_42_82)] text-white shadow-[0_16px_36px_-12px_rgb(26_42_82_/_0.5)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgb(26_42_82_/_0.6)]"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          )}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              <span>Verifying Identity via Gateway…</span>
            </>
          ) : (
            <>
              <span>Verify &amp; Access Gateway</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-3 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5 font-medium text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Tamper-Proof Audit Chained
        </span>
        <span>DPDP Compliant (2023)</span>
      </div>

      {mode === "learner" && (
        <StudentOnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
        />
      )}
    </motion.div>
  );
}