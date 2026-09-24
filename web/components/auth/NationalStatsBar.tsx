"use client";

import { motion } from "framer-motion";
import { Building2, BookOpen, Layers, CheckCircle2, Shield, Activity } from "lucide-react";
import type { AuthOverviewResponse } from "@/lib/api/types";

interface Props {
  data?: AuthOverviewResponse;
  isLoading?: boolean;
}

export function NationalStatsBar({ data, isLoading }: Props) {
  const stats = data?.stats ?? {
    institutions: 129,
    courses: 15600,
    disciplines: 22,
    curricula: 520,
    competencies: 62400,
    ledgerHead: "SHA-256 Chained Genesis",
    db: "connected",
  };

  const isLive = stats.db === "connected";

  const metrics = [
    {
      label: "Accredited Universities",
      value: stats.institutions.toLocaleString(),
      sub: "NIRF Anchored",
      icon: Building2,
      accent: "text-blue-600 bg-blue-50/80 border-blue-200/60",
    },
    {
      label: "National Curriculum Subjects",
      value: `${stats.courses.toLocaleString()}+`,
      sub: `${stats.curricula} Curricula Versions`,
      icon: BookOpen,
      accent: "text-emerald-600 bg-emerald-50/80 border-emerald-200/60",
    },
    {
      label: "Academic Disciplines",
      value: `${stats.disciplines} Fields`,
      sub: "Eng, Med, Law, Science",
      icon: Layers,
      accent: "text-purple-600 bg-purple-50/80 border-purple-200/60",
    },
    {
      label: "Bloom Competencies",
      value: `${stats.competencies.toLocaleString()}+`,
      sub: "Level 1 to 6 Atomic LOs",
      icon: CheckCircle2,
      accent: "text-amber-600 bg-amber-50/80 border-amber-200/60",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mx-auto mb-10 w-full max-w-[1200px]"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-white/75 p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl md:p-4">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Metrics grid */}
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/80 p-3.5 transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-tight text-text-muted">
                      {m.label}
                    </span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-xl border ${m.accent}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="font-display text-[20px] font-extrabold tracking-tight text-text-primary">
                      {isLoading ? (
                        <span className="inline-block h-6 w-16 animate-pulse rounded bg-slate-200" />
                      ) : (
                        m.value
                      )}
                    </p>
                    <p className="text-[10.5px] font-medium text-text-secondary">
                      {m.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Ledger & Gateway Status pill */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 lg:flex-col lg:items-start lg:justify-center lg:px-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
              </span>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-text-primary">
                {isLive ? "PostgreSQL Engine Live" : "In-Memory Gateway"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <Shield className="h-3 w-3 text-slate-500" />
              <span>Head:</span>
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                {stats.ledgerHead}
              </code>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
