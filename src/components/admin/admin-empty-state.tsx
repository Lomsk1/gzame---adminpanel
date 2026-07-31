import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon?: ReactNode;
  message: string;
  className?: string;
};

export function AdminEmptyState({ icon, message, className = "" }: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-14 text-admin-text-dim admin-fade-up ${className}`}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-admin-border bg-admin-elevated text-admin-text-muted">
          {icon}
        </div>
      ) : null}
      <p className="text-sm text-center max-w-sm leading-relaxed">{message}</p>
    </div>
  );
}
