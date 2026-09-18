"use client";

import { motion } from "framer-motion";
import { Landmark, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AUTH_NAV, DEMO_AUTH_BADGES } from "@/lib/constants/demo-auth";

export function AuthTopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-5 md:pt-4"
    >
      <div className="mx-auto max-w-[1700px]">
        <div className="glass-strong flex h-[70px] items-center gap-3 rounded-full px-3 md:px-5">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface">
              <Landmark className="h-5 w-5 text-[rgb(26_42_82)]" strokeWidth={1.8} />
            </div>
            <div className="hidden leading-none sm:block">
              <p className="font-sans text-[17px] font-bold leading-none tracking-tight text-text-primary">
                EduPathAI
              </p>
              <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Ministry of Education
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {AUTH_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-white/60 hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="#reviewer"
              className="hidden items-center rounded-full border border-border-subtle bg-white/70 px-4 py-2 text-[12.5px] font-semibold text-text-primary transition-colors hover:bg-white md:inline-flex"
            >
              Reviewer Access
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)] px-3.5 py-2 text-[11.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(26_42_82_/_0.5)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {DEMO_AUTH_BADGES.complianceFull}
              </span>
              <span className="sm:hidden">{DEMO_AUTH_BADGES.compliance}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}