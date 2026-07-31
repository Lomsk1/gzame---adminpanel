import type { ReactNode } from "react";

type AdminToolbarProps = {
  children: ReactNode;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function AdminToolbar({ children, left, right, className = "" }: AdminToolbarProps) {
  if (left || right) {
    return (
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-admin-border bg-admin-panel/60 p-3 ${className}`}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">{left}</div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">{right}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-admin-border bg-admin-panel/60 p-3 ${className}`}
    >
      {children}
    </div>
  );
}
