"use client";

import type { LedgerEvent } from "@/lib/constants/demo-ledger";
import { TimelineSpine } from "./TimelineSpine";
import { TimelineCard } from "./TimelineCard";

interface DecisionTimelineProps {
  events: LedgerEvent[];
}

/**
 * Renders the glowing spine alongside the stack of event cards.
 * Each card is vertically centered against a dot on the spine.
 */
export function DecisionTimeline({ events }: DecisionTimelineProps) {
  const highlightIndex = events.findIndex((e) => e.highlight);

  return (
    <div className="relative flex gap-6">
      {/* Spine column */}
      <div className="relative" style={{ height: `${events.length * 130}px` }}>
        <TimelineSpine count={events.length} highlightIndex={highlightIndex} />
      </div>

      {/* Cards stack */}
      <div className="flex flex-1 flex-col gap-3">
        {events.map((event, i) => (
          <TimelineCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}