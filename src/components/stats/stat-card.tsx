interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  color: string;
}

export const StatCard = ({ title, value, trend = "", color }: StatCardProps) => (
  <div className="admin-stagger-item group relative bg-admin-card border border-admin-border p-5 rounded-xl transition-colors duration-200 hover:border-admin-primary/40 shadow-[var(--shadow-admin-sm)]">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-text-muted">{title}</p>

    <div className="flex items-baseline gap-3 mt-3">
      <h2 className="text-3xl font-semibold text-admin-text font-mono tracking-tight">{value}</h2>
      {trend ? (
        <span
          className={`text-xs font-semibold font-mono ${
            trend.startsWith("+") ? "text-admin-success" : "text-admin-error"
          }`}
        >
          {trend}
        </span>
      ) : null}
    </div>

    <div className="mt-4 h-1 w-full bg-admin-bg rounded-full overflow-hidden">
      <div
        className={`h-full ${color} w-2/3 transition-all duration-700 ease-out group-hover:w-full rounded-full`}
      />
    </div>
  </div>
);
