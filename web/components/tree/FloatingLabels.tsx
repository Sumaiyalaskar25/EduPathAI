"use client";

import { motion } from "framer-motion";

const LABELS = [
  { text: "48 Recognized Credits", x: "22%", y: "26%", tone: "green" },
  { text: "14 Bridge Credits",     x: "82%", y: "16%", tone: "amber" },
  { text: "14 Bridge Credits",     x: "86%", y: "28%", tone: "amber" },
  { text: "Future Electives",      x: "82%", y: "63%", tone: "muted" },
] as const;

const TONES: Record<string, string> = {
  green: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  amber: "border-amber-200 bg-amber-50/80 text-amber-900",
  muted: "border-border-subtle bg-white/80 text-text-secondary",
};

export function FloatingLabels() {
  return (
    <>
      {LABELS.map((label, i) => (
        <motion.div
          key={`${label.text}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
          className={`absolute hidden rounded-full border px-3 py-1.5 text-[11.5px] font-semibold shadow-sm md:block ${TONES[label.tone]}`}
          style={{ left: label.x, top: label.y }}
        >
          {label.text}
        </motion.div>
      ))}
    </>
  );
}