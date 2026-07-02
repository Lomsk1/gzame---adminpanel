export function SpecialistListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading specialists">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-3 rounded-2xl border border-admin-border/40 bg-admin-panel/30 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-admin-border/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-admin-border/40" />
              <div className="h-3 w-28 rounded bg-admin-border/30" />
              <div className="h-3 w-full max-w-sm rounded bg-admin-border/20" />
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <div className="h-9 w-16 rounded-lg bg-admin-border/30" />
            <div className="h-9 w-16 rounded-lg bg-admin-border/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
