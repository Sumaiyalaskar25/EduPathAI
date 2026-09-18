"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, wire this to your error tracker
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-tighter text-text-primary">
          We hit an unexpected error.
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-text-secondary">
          The audit ledger is safe. Try reloading the page, or go back to the
          dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-text-muted">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-full bg-[rgb(26_42_82)] px-5 py-3 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/student"
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/70 px-5 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}