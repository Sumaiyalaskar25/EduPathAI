interface ContentAlignmentBadgeProps {
  percent: number;
}

export function ContentAlignmentBadge({ percent }: ContentAlignmentBadgeProps) {
  return (
    <div className="hidden w-[140px] shrink-0 md:block">
      <p className="text-[11px] font-semibold text-text-primary">
        {percent}% Content Alignment
      </p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}