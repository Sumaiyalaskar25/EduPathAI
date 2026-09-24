"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { AUTH_BADGES } from "@/lib/constants/auth-ui";
import { NetworkModal } from "./NetworkModal";
import { FrameworkModal } from "./FrameworkModal";
import { CreditSimulatorModal } from "./CreditSimulatorModal";

interface Props {
  onSelectRole?: (role: "bos" | "learner" | "ministry") => void;
  isLive?: boolean;
}

export function AuthTopBar({ onSelectRole, isLive = true }: Props) {
  const [networkOpen, setNetworkOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-4"
      >
        <div className="mx-auto max-w-[1700px]">
          <div className="glass-strong flex h-[72px] items-center justify-between rounded-full border border-white/60 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl md:px-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(34_54_102)] text-white shadow-md">
                <Landmark className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p className="font-display text-[17.5px] font-extrabold tracking-tight text-text-primary">
                    EduPathAI
                  </p>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-emerald-700 border border-emerald-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    v2 Live
                  </span>
                </div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  Ministry of Education · NCrF Gateway
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden items-center gap-1.5 md:flex">
              <button
                type="button"
                onClick={() => setFrameworkOpen(true)}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
              >
                Framework
              </button>
              <button
                type="button"
                onClick={() => setNetworkOpen(true)}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
              >
                Institutional Network
              </button>
              <button
                type="button"
                onClick={() => setSimulatorOpen(true)}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
              >
                Credit Simulator
              </button>
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSelectRole?.("bos")}
                className="hidden items-center rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-[12.5px] font-bold text-text-primary shadow-2xs transition-all hover:bg-slate-50 hover:shadow-xs sm:inline-flex"
              >
                Reviewer Access
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)] px-4 py-2 text-[11.5px] font-bold text-white shadow-[0_8px_20px_-8px_rgb(26_42_82_/_0.5)]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">
                  {AUTH_BADGES.complianceFull}
                </span>
                <span className="sm:hidden">{AUTH_BADGES.compliance}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <NetworkModal open={networkOpen} onOpenChange={setNetworkOpen} />
      <FrameworkModal open={frameworkOpen} onOpenChange={setFrameworkOpen} />
      <CreditSimulatorModal open={simulatorOpen} onOpenChange={setSimulatorOpen} />
    </>
  );
}