"use client";

import { motion } from "framer-motion";
import type { Leaf } from "@/lib/constants/demo-tree";

interface KnowledgeTreeProps {
  onLeafClick?: (leaf: Leaf) => void;
}

const COLORS = {
  trunkDark: "#334155",
  trunkLight: "#475569",
  branch: "#64748b",
  subBranch: "#94a3b8",
  recognized: { fill: "#10b981", stroke: "#047857", text: "#ffffff", glow: "#34d399" },
  bridge:     { fill: "#f59e0b", stroke: "#b45309", text: "#ffffff", glow: "#fbbf24" },
  future:     { fill: "#f1f5f9", stroke: "#cbd5e1", text: "#64748b", glow: "#e2e8f0" },
} as const;

/* ─── Leaf positions (organic canopy around the tree) ─── */
interface LeafDef {
  id: string;
  label: string;
  kind: "recognized" | "bridge" | "future";
  x: number;
  y: number;
  delay: number;
}

const LEAVES: LeafDef[] = [
  // Upper-left green cluster
  { id: "l01", label: "DSA",       kind: "recognized", x: 175, y: 440, delay: 0 },
  { id: "l02", label: "Networks",  kind: "recognized", x: 130, y: 385, delay: 1 },
  { id: "l03", label: "Databases", kind: "recognized", x: 115, y: 325, delay: 2 },
  { id: "l04", label: "GenAI",     kind: "recognized", x: 130, y: 262, delay: 3 },
  { id: "l05", label: "OS",        kind: "recognized", x: 168, y: 210, delay: 4 },
  { id: "l06", label: "DevOps",    kind: "recognized", x: 218, y: 168, delay: 5 },
  { id: "l07", label: "Networks",  kind: "recognized", x: 275, y: 140, delay: 6 },
  { id: "l08", label: "Databases", kind: "recognized", x: 335, y: 122, delay: 7 },
  { id: "l09", label: "SysDesign", kind: "recognized", x: 395, y: 118, delay: 8 },
  { id: "l10", label: "Distrib",   kind: "recognized", x: 452, y: 128, delay: 9 },

  // Upper-right amber cluster (bridges)
  { id: "b01", label: "Compilers",   kind: "bridge", x: 512, y: 142, delay: 10 },
  { id: "b02", label: "Parallel",    kind: "bridge", x: 565, y: 175, delay: 11 },
  { id: "b03", label: "Distributed", kind: "bridge", x: 610, y: 220, delay: 12 },

  // Right-side silver (future)
  { id: "f01", label: "", kind: "future", x: 655, y: 280, delay: 13 },
  { id: "f02", label: "", kind: "future", x: 685, y: 340, delay: 14 },
  { id: "f03", label: "", kind: "future", x: 690, y: 405, delay: 15 },
  { id: "f04", label: "", kind: "future", x: 665, y: 465, delay: 16 },
  { id: "f05", label: "", kind: "future", x: 615, y: 510, delay: 17 },
  { id: "f06", label: "", kind: "future", x: 555, y: 530, delay: 18 },
];

/* ─── Primary branch endpoints (from trunk to tip) ─── */
const BRANCHES: { from: [number, number]; to: [number, number]; ctrl: [number, number]; w: number }[] = [
  { from: [438, 500], to: [160, 440], ctrl: [290, 490], w: 9 },   // low-left
  { from: [462, 500], to: [740, 440], ctrl: [610, 490], w: 9 },   // low-right
  { from: [438, 420], to: [140, 350], ctrl: [280, 400], w: 8 },   // mid-left
  { from: [462, 420], to: [760, 350], ctrl: [620, 400], w: 8 },   // mid-right
  { from: [440, 340], to: [180, 230], ctrl: [290, 300], w: 7 },   // upper-left
  { from: [460, 340], to: [720, 230], ctrl: [610, 300], w: 7 },   // upper-right
  { from: [445, 270], to: [320, 145], ctrl: [370, 200], w: 6 },   // top-left
  { from: [455, 270], to: [580, 145], ctrl: [530, 200], w: 6 },   // top-right
];

/* ─── Sub-branch tips (short connectors from primary branch tips to leaf clusters) ─── */
const SUB_BRANCHES: { from: [number, number]; to: [number, number] }[] = [
  // Low-left cluster
  { from: [160, 440], to: [140, 385] },
  { from: [160, 440], to: [175, 440] },
  // Mid-left cluster
  { from: [140, 350], to: [115, 325] },
  { from: [140, 350], to: [130, 262] },
  { from: [140, 350], to: [168, 210] },
  // Upper-left
  { from: [180, 230], to: [218, 168] },
  { from: [180, 230], to: [275, 140] },
  { from: [180, 230], to: [335, 122] },
  // Top-left
  { from: [320, 145], to: [395, 118] },
  { from: [320, 145], to: [452, 128] },
  // Top-right
  { from: [580, 145], to: [512, 142] },
  { from: [580, 145], to: [565, 175] },
  // Upper-right
  { from: [720, 230], to: [610, 220] },
  { from: [720, 230], to: [655, 280] },
  // Mid-right
  { from: [760, 350], to: [685, 340] },
  { from: [760, 350], to: [690, 405] },
  // Low-right
  { from: [740, 440], to: [665, 465] },
  { from: [740, 440], to: [615, 510] },
  { from: [740, 440], to: [555, 530] },
];

export function KnowledgeTree({ onLeafClick }: KnowledgeTreeProps) {
  const handleClick = (leaf: LeafDef) => {
    if (!onLeafClick) return;
    onLeafClick({
      id: leaf.id,
      label: leaf.label,
      kind: leaf.kind,
      x: leaf.x,
      y: leaf.y,
      delay: leaf.delay,
    });
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 680"
        className="h-full w-full"
        role="img"
        aria-label="Academic pathway tree"
      >
        <defs>
          <linearGradient id="trunkFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="45%" stopColor="#475569" />
            <stop offset="55%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <radialGradient id="pedestalGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>

          <filter id="pillShadow" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Soft ambient greens/ambers behind tree */}
        <ellipse cx="260" cy="320" rx="220" ry="240" fill="#10b981" opacity="0.05" />
        <ellipse cx="620" cy="230" rx="180" ry="180" fill="#f59e0b" opacity="0.05" />

        {/* Pedestal */}
        <ellipse cx="450" cy="620" rx="200" ry="22" fill="#cbd5e1" opacity="0.6" />
        <ellipse cx="450" cy="612" rx="188" ry="18" fill="url(#pedestalGrad)" />
        <ellipse cx="450" cy="612" rx="188" ry="18" fill="none" stroke="#cbd5e1" strokeWidth="1" />

        {/* TRUNK — filled tapered polygon */}
        <motion.path
          d="
            M 425 600
            L 435 460
            L 440 360
            L 446 260
            L 452 200
            L 448 200
            L 454 260
            L 460 360
            L 465 460
            L 475 600
            Z
          "
          fill="url(#trunkFill)"
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "450px 600px" }}
        />

        {/* PRIMARY BRANCHES — clean curves */}
        {BRANCHES.map((b, i) => (
          <motion.path
            key={i}
            d={`M ${b.from[0]} ${b.from[1]} Q ${b.ctrl[0]} ${b.ctrl[1]}, ${b.to[0]} ${b.to[1]}`}
            stroke={COLORS.branch}
            strokeWidth={b.w}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.5 + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}

        {/* SUB-BRANCHES — thin connectors to leaf clusters */}
        {SUB_BRANCHES.map((s, i) => (
          <motion.path
            key={`sub-${i}`}
            d={`M ${s.from[0]} ${s.from[1]} L ${s.to[0]} ${s.to[1]}`}
            stroke={COLORS.subBranch}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.35,
              delay: 0.9 + i * 0.025,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}

        {/* LEAVES — elliptical pills at cluster tips */}
        {LEAVES.map((leaf) => {
          const c = COLORS[leaf.kind];
          const isFuture = leaf.kind === "future";
          const rx = isFuture ? 12 : Math.max(28, leaf.label.length * 5.5 + 12);
          const ry = isFuture ? 13 : 14;

          return (
            <motion.g
              key={leaf.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.05 + leaf.delay * 0.04,
                duration: 0.45,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                transformOrigin: `${leaf.x}px ${leaf.y}px`,
                cursor: onLeafClick ? "pointer" : "default",
              }}
              onClick={() => handleClick(leaf)}
            >
              {/* glow */}
              <ellipse
                cx={leaf.x}
                cy={leaf.y}
                rx={rx * 1.5}
                ry={ry * 1.9}
                fill={c.glow}
                opacity={isFuture ? 0.22 : 0.35}
              />

              {/* body */}
              <ellipse
                cx={leaf.x}
                cy={leaf.y}
                rx={rx}
                ry={ry}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={1.5}
                filter="url(#pillShadow)"
              />

              {/* top sheen */}
              {!isFuture && (
                <ellipse
                  cx={leaf.x - rx * 0.15}
                  cy={leaf.y - ry * 0.4}
                  rx={rx * 0.55}
                  ry={ry * 0.3}
                  fill="#ffffff"
                  opacity={0.22}
                  pointerEvents="none"
                />
              )}

              {/* label */}
              {leaf.label && (
                <text
                  x={leaf.x}
                  y={leaf.y + 4}
                  textAnchor="middle"
                  fill={c.text}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "-0.005em",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {leaf.label}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}