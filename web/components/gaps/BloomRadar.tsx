"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { DEMO_BLOOM_RADAR } from "@/lib/constants/demo-gaps";

export interface RadarAxisPoint {
  axis: string;
  source: number;
  target: number;
}

interface BloomRadarProps {
  /** Real per-match signal averages (0-100). Falls back to the demo
   * illustration when no real pathway has been run yet. */
  data?: RadarAxisPoint[];
  headline?: string;
}

export function BloomRadar({ data, headline }: BloomRadarProps) {
  const chartData = data ?? DEMO_BLOOM_RADAR;

  return (
    <div className="card-warm flex h-full flex-col p-6">
      <h2 className="text-[15px] font-bold leading-tight tracking-tight text-text-primary">
        Match Quality
        <br />
        Signal Breakdown
      </h2>

      <div className="mt-3">
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-800">
          {headline ?? "DIRECT MATCH (Bloom Level 4 · Analyze)"}
        </span>
      </div>

      <div className="relative mt-2 flex-1">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart
            data={chartData}
            outerRadius="72%"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid
              stroke="rgb(203 213 225)"
              strokeDasharray="2 3"
              radialLines
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fill: "rgb(71 85 105)",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Weakest match"
              dataKey="source"
              stroke="rgb(245 158 11)"
              fill="rgb(251 191 36)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Radar
              name="Average"
              dataKey="target"
              stroke="rgb(16 185 129)"
              fill="rgb(16 185 129)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-medium text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm border border-dashed border-amber-500 bg-amber-100/50" />
          Weakest match
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-emerald-500/60" />
          Average
        </span>
      </div>

      <p className="mt-3 text-center text-[10.5px] font-medium uppercase tracking-wider text-text-muted">
        Semantic · Coverage · Assessment · Credits · Domain
      </p>
    </div>
  );
}