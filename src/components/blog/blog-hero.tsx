import { Newspaper, PenLine, Rocket, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { AdminFadeUp } from "../admin";

type Props = {
  title: string;
  subtitle: string;
  total: number;
  published: number;
  drafts: number;
  totalLabel: string;
  publishedLabel: string;
  draftsLabel: string;
  actions?: ReactNode;
};

export function BlogHero({
  title,
  subtitle,
  total,
  published,
  drafts,
  totalLabel,
  publishedLabel,
  draftsLabel,
  actions,
}: Props) {
  const publishRate = total > 0 ? Math.round((published / total) * 100) : 0;

  return (
    <AdminFadeUp>
      <div className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-panel/40 p-6 sm:p-8">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(var(--admin-primary-rgb), 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(var(--admin-accent-rgb), 0.1) 0%, transparent 40%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(var(--admin-border-rgb), 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--admin-border-rgb), 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-admin-primary/15 border border-admin-primary/30 flex items-center justify-center shadow-[0_0_32px_-8px_rgba(var(--admin-primary-rgb),0.4)]">
              <Newspaper className="w-7 h-7 text-admin-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-admin-text tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-admin-text-dim mt-1.5 max-w-lg leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <StatPill
            icon={<PenLine className="w-4 h-4" />}
            label={totalLabel}
            value={total}
            accent="primary"
          />
          <StatPill
            icon={<Rocket className="w-4 h-4" />}
            label={publishedLabel}
            value={published}
            accent="success"
            suffix={total > 0 ? `${publishRate}%` : undefined}
          />
          <StatPill
            icon={<Sparkles className="w-4 h-4" />}
            label={draftsLabel}
            value={drafts}
            accent="warning"
          />
        </div>
      </div>
    </AdminFadeUp>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
  suffix,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  accent: "primary" | "success" | "warning";
  suffix?: string;
}) {
  const colors = {
    primary: "text-admin-primary border-admin-primary/25 bg-admin-primary/8",
    success: "text-admin-success border-admin-success/25 bg-admin-success/8",
    warning: "text-admin-warning border-admin-warning/25 bg-admin-warning/8",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide opacity-80">
          {icon}
          {label}
        </div>
        {suffix && (
          <span className="text-[10px] font-mono opacity-60">{suffix}</span>
        )}
      </div>
      <p className="text-3xl font-semibold mt-2 tabular-nums">{value}</p>
    </div>
  );
}
