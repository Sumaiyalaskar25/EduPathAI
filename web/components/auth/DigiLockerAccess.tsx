"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { IdentityMode } from "@/lib/constants/demo-auth";

/** Where each identity mode should land after successful auth. */
const IDENTITY_ROUTES: Record<IdentityMode, string> = {
  learner: "/student",
  bos: "/hei",
  ministry: "/gov",
};

interface Props {
  /** The identity mode chosen on the left card. */
  mode: IdentityMode;
  /** Human-readable label for the chosen identity (for subtitle). */
  modeLabel: string;
}

export function DigiLockerAccess({ mode, modeLabel }: Props) {
  const router = useRouter();
  const [apaar, setApaar] = useState("");
  const [biometric, setBiometric] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = apaar.replace(/\s/g, "").length === 12 && consent;

  const onVerify = async () => {
    if (!valid) return;
    setLoading(true);
    // Simulated auth delay — real integration: call an auth endpoint.
    // Then route to the appropriate dashboard based on identity mode.
    setTimeout(() => {
      router.push(IDENTITY_ROUTES[mode]);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="glass-strong flex h-full flex-col rounded-3xl p-7 md:p-9"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Step 2
        </p>
        <h2 className="mt-1.5 font-display text-[24px] font-bold tracking-tight text-text-primary">
          Access via DigiLocker &amp; ABC ID
        </h2>
        <p className="mt-2 text-[13px] leading-snug text-text-secondary">
          Signing in as{" "}
          <span className="font-semibold text-text-primary">{modeLabel}</span>
        </p>
      </header>

      {/* APAAR input */}
      <div className="mt-7">
        <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          APAAR / ABC ID
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border-subtle bg-white px-4 py-3.5 transition-colors focus-within:border-[rgb(26_42_82)]/40">
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            value={apaar}
            onChange={(e) =>
              setApaar(e.target.value.replace(/[^0-9]/g, "").slice(0, 12))
            }
            placeholder="Enter 12-digit APAAR / ABC ID"
            className="flex-1 bg-transparent text-[15px] font-medium tracking-wider text-text-primary outline-none placeholder:text-text-muted/70 placeholder:tracking-normal"
          />

          <button
            type="button"
            onClick={() => setBiometric((b) => !b)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-colors",
              biometric
                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : "border-border-subtle bg-canvas text-text-muted hover:bg-white"
            )}
            aria-pressed={biometric}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            Biometric / OTP
          </button>
        </div>
      </div>

      {/* Verify & Fetch */}
      <button
        onClick={onVerify}
        disabled={!valid || loading}
        className={cn(
          "mt-5 flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-semibold tracking-tight transition-all duration-200",
          valid && !loading
            ? "bg-[rgb(26_42_82)] text-white shadow-[0_16px_36px_-14px_rgb(26_42_82_/_0.55)] hover:-translate-y-0.5"
            : "cursor-not-allowed bg-slate-200 text-slate-500"
        )}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span>Verifying…</span>
          </>
        ) : (
          <>
            <span>Verify &amp; Fetch</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* OR divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      {/* MeriPehchan */}
      <button
        type="button"
        className="flex items-center justify-center gap-2.5 rounded-2xl border border-border-subtle bg-white py-4 text-[14px] font-semibold text-text-primary transition-colors hover:bg-canvas"
      >
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{
            background:
              "conic-gradient(from 180deg, #f97316, #ef4444, #22c55e, #3b82f6, #8b5cf6, #f97316)",
          }}
        />
        <span>Connect with MeriPehchan</span>
      </button>

      {/* Consent */}
      <div className="mt-7 rounded-2xl border border-border-subtle bg-white/70 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
              consent
                ? "border-[rgb(26_42_82)] bg-[rgb(26_42_82)]"
                : "border-border-strong bg-white"
            )}
            onClick={() => setConsent((c) => !c)}
          >
            {consent && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                viewBox="0 0 14 14"
                className="h-3 w-3"
              >
                <path
                  d="M 3 7 L 6 10 L 11 4"
                  stroke="white"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </span>
          <span className="text-[12px] leading-snug text-text-secondary">
            <span className="font-semibold text-text-primary">
              Consent to secure data processing under DPDP Act (2023).
            </span>{" "}
            Zero PII persistence. Tokenized verification only. You may revoke
            any time from your profile.
          </span>
        </label>
      </div>
    </motion.div>
  );
}