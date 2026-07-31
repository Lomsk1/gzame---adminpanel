import type { ReactNode } from "react";
import { AdminFadeUp } from "./admin-animated";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  delayMs?: number;
};

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
  badge,
  delayMs = 40,
}: AdminPageHeaderProps) {
  return (
    <AdminFadeUp
      delayMs={delayMs}
      className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-admin-border/50"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-primary/12 border border-admin-primary/25 text-admin-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {badge}
          <h1 className="text-2xl font-semibold text-admin-text tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-admin-text-dim mt-1.5 max-w-2xl leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </AdminFadeUp>
  );
}
