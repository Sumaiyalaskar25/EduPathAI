"use client";

import { Clock } from "lucide-react";
import type { SummerBridge } from "@/lib/view-models/pathway";

interface SummerBridgeCardProps {
  bridge: SummerBridge;
}

export function SummerBridgeCard({ bridge }: SummerBridgeCardProps) {
  return (
    <div
      data-summer-bridge
      className="relative flex w-[150px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-amber-300/60 px-3 py-5 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgb(255 237 213) 0%, rgb(254 215 170) 100%)",
        boxShadow:
          "0 12px 32px -12px rgb(245 158 11 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.6)",
      }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
        <Clock className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <div>
        <p className="text-[12px] font-semibold leading-tight text-amber-900">
          Summer Bridge:
        </p>
        <p className="mt-1 text-[13px] font-bold leading-tight text-amber-950">
          {bridge.title}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-amber-800">
          ({bridge.provider} - {bridge.duration})
        </p>
      </div>
    </div>
  );
}