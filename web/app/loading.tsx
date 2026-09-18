export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/40" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-lg">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </span>
        </div>
        <p className="text-[13px] font-medium text-text-secondary">
          Loading…
        </p>
      </div>
    </div>
  );
}