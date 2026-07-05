import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon?: ReactNode;
  message: string;
  className?: string;
};

export function AdminEmptyState({ icon, message, className = "" }: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-admin-text-dim admin-fade-up ${className}`}
    >
      {icon}
      <p className="text-sm text-center max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}
