"use client";

import Link from "next/link";
import { Sparkline } from "./Sparkline";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BottomStripProps {
  label: string;
  sparklineStroke?: string;
  sparklineFill?: string;
  statusTitle: string;
  statusSubtitle?: string;
  statusIcon?: React.ReactNode;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export function BottomStrip({
  label,
  sparklineStroke = "rgb(16 185 129)",
  sparklineFill = "rgb(16 185 129 / 0.14)",
  statusTitle,
  statusSubtitle,
  statusIcon,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: BottomStripProps) {
  const ctaContent = (
    <>
      <span className="hidden text-left leading-tight sm:block">
        {ctaLabel}
      </span>
      <span className="sm:hidden">{ctaLabel.split(" ")[0]}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </>
  );

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-30 px-3 pb-3 md:px-5 md:pb-4", className)}>
      <div className="mx-auto max-w-[1700px]">
        <div className="glass-strong flex h-[86px] items-center gap-4 rounded-full px-4 md:gap-6 md:px-6">
          <div className="hidden shrink-0 leading-tight sm:block">
            <p className="text-[13px] font-semibold leading-tight text-text-primary whitespace-pre-line">
              {label}
            </p>
          </div>

          <div className="hidden h-full w-[180px] shrink-0 items-center md:flex">
            <Sparkline stroke={sparklineStroke} fill={sparklineFill} />
          </div>

          <div className="mx-2 hidden h-12 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent md:block" />

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              {statusIcon ?? <ShieldCheck className="h-4 w-4" />}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {statusTitle}
              </p>
              {statusSubtitle && (
                <p className="truncate text-[11px] font-medium text-text-secondary">
                  {statusSubtitle}
                </p>
              )}
            </div>
          </div>

          {ctaHref ? (
            <Link href={ctaHref} className="pill-navy shrink-0">
              {ctaContent}
            </Link>
          ) : (
            <button onClick={onCta} className="pill-navy shrink-0">
              {ctaContent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}