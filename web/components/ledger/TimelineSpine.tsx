"use client";

interface TimelineSpineProps {
  /** Number of events to place dots for. */
  count: number;
  /** Which event index is highlighted (amber). -1 = none. */
  highlightIndex?: number;
}

/**
 * Vertical glowing teal spine with connective dots.
 * Renders a narrow rounded bar with an internal glow gradient,
 * plus a dot per event connected to the right edge.
 */
export function TimelineSpine({ count, highlightIndex = -1 }: TimelineSpineProps) {
  return (
    <div
      className="relative w-[46px] shrink-0"
      aria-hidden
    >
      {/* Glow behind */}
      <div
        className="absolute left-1/2 top-0 h-full w-[46px] -translate-x-1/2 rounded-[23px] opacity-70 blur-xl"
        style={{
          background:
            "linear-gradient(180deg, rgb(56 189 248 / 0.55) 0%, rgb(14 165 233 / 0.4) 50%, rgb(6 95 70 / 0.2) 100%)",
        }}
      />

      {/* Spine bar */}
      <div
        className="absolute left-1/2 top-0 h-full w-[18px] -translate-x-1/2 overflow-hidden rounded-full border border-sky-300/40"
        style={{
          background:
            "linear-gradient(180deg, rgb(125 211 252) 0%, rgb(56 189 248) 30%, rgb(14 165 233) 60%, rgb(6 95 70) 100%)",
          boxShadow:
            "inset 0 0 12px rgb(255 255 255 / 0.6), 0 0 24px rgb(56 189 248 / 0.5)",
        }}
      >
        {/* Internal streak lines */}
        <div className="absolute inset-0 opacity-60 mix-blend-overlay">
          <div className="absolute left-[3px] top-0 h-full w-[2px] bg-white/70" />
          <div className="absolute left-[9px] top-0 h-full w-[1px] bg-white/50" />
          <div className="absolute left-[14px] top-0 h-full w-[1px] bg-white/40" />
        </div>
      </div>

      {/* Dots */}
      <div className="relative flex h-full flex-col justify-between py-6">
        {Array.from({ length: count }).map((_, i) => {
          const isHi = i === highlightIndex;
          return (
            <div key={i} className="flex h-0 items-center">
              {/* Dot on the spine */}
              <div
                className="absolute left-1/2 h-[10px] w-[10px] -translate-x-1/2 rounded-full border"
                style={{
                  background: isHi ? "rgb(251 191 36)" : "rgb(186 230 253)",
                  borderColor: isHi
                    ? "rgb(217 119 6)"
                    : "rgb(56 189 248)",
                  boxShadow: isHi
                    ? "0 0 12px rgb(251 191 36 / 0.8)"
                    : "0 0 10px rgb(56 189 248 / 0.7)",
                }}
              />
              {/* Connector line going right */}
              <div
                className="absolute left-[calc(50%+5px)] w-8 border-t"
                style={{
                  borderColor: isHi
                    ? "rgb(251 191 36 / 0.7)"
                    : "rgb(56 189 248 / 0.5)",
                  borderStyle: isHi ? "solid" : "dotted",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}