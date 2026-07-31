export default function LoaderMain() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-admin-bg text-admin-text font-sans">
      <div className="flex items-center gap-3 rounded-xl border border-admin-border bg-admin-card px-5 py-4 shadow-[var(--shadow-admin)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-admin-primary" />
        <span className="text-sm font-semibold">Loading...</span>
      </div>
    </div>
  );
}
