"use client";

import { Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function TopBar({ title, subtitle, rightSlot }: TopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
      <div className="mx-auto max-w-[1700px]">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong flex h-[70px] items-center gap-3 rounded-full px-3 md:px-4"
        >
          {/* Emblem badge */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface">
            <Landmark className="h-5 w-5 text-[rgb(26_42_82)] dark:text-emerald-400" strokeWidth={1.8} />
          </div>

          {/* Brand */}
          <div className="hidden shrink-0 leading-none sm:block">
            <p className="font-sans text-[17px] font-bold leading-none tracking-tight text-text-primary">
              EduPathAI
            </p>
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Ministry of Education
            </p>
          </div>

          <div className="mx-1 hidden h-10 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent sm:block" />

          {/* Two-line title */}
          <div className="hidden min-w-0 flex-1 leading-tight md:block">
            <p className="truncate text-[14px] font-bold tracking-tight text-text-primary">
              {title ?? "EduPathAI"}
            </p>
            {subtitle && (
              <p className="truncate text-[11px] font-medium text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2">
            {rightSlot}
            <ThemeToggle />
          </div>
        </motion.div>
      </div>
    </header>
  );
}