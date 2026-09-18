import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgb(16 185 129 / 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-lg">
          <Compass className="h-7 w-7" />
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
          404 · Route not found
        </p>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] dark:text-text-primary">
          This page doesn't exist.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
          The page you're looking for may have moved, or the URL is incorrect.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/student" className="pill-navy">
            Go to dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/70 px-5 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}