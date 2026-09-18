"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Hash, ShieldCheck } from "lucide-react";

interface ConfirmationCardProps {
  eyebrow: string;
  title: string;
  description: string;
  auditId: string;
  timestamp: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export function ConfirmationCard({
  eyebrow,
  title,
  description,
  auditId,
  timestamp,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: ConfirmationCardProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_16px_40px_-12px_rgb(16_185_129_/_0.6)]">
          <motion.svg
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            viewBox="0 0 40 40"
            className="h-9 w-9"
          >
            <path
              d="M 10 20 L 17 27 L 30 13"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </motion.svg>
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700"
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-3 text-center font-display text-[36px] font-bold leading-tight tracking-tighter text-text-primary md:text-[44px]"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="mt-4 max-w-md text-center text-[14px] leading-relaxed text-text-secondary"
      >
        {description}
      </motion.p>

      {/* Audit receipt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="mt-8 w-full max-w-md rounded-2xl border border-border-subtle bg-white/70 p-5"
      >
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted">
            <Hash className="h-3 w-3" />
            Audit receipt
          </span>
          <span className="flex items-center gap-1 font-mono text-emerald-700">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </div>
        <p className="mt-2 break-all font-mono text-[12.5px] text-text-primary">
          {auditId}
        </p>
        <p className="mt-2 text-[11.5px] text-text-muted">
          Logged {timestamp} · visible in your Ledger
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Link href={primaryHref} className="pill-navy">
          {primaryLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={secondaryHref}
          className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/70 px-5 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white"
        >
          {secondaryLabel}
        </Link>
      </motion.div>
    </div>
  );
}