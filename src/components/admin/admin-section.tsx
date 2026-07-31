import type { ReactNode } from "react";
import { AdminFadeUp } from "./admin-animated";

type AdminSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  delayMs?: number;
  tone?: "default" | "amber" | "info" | "emerald" | "violet";
};

const TONE: Record<string, string> = {
  default: "border-admin-border bg-admin-card",
  amber: "border-admin-warning/30 bg-admin-warning/5",
  info: "border-admin-info/30 bg-admin-info/5",
  emerald: "border-admin-success/30 bg-admin-success/5",
  violet: "border-admin-info/30 bg-admin-info/5",
};

export function AdminSection({
  title,
  description,
  children,
  className = "",
  headerRight,
  delayMs = 0,
  tone = "default",
}: AdminSectionProps) {
  return (
    <AdminFadeUp
      delayMs={delayMs}
      className={`rounded-xl border p-4 md:p-5 space-y-3 shadow-[var(--shadow-admin-sm)] ${TONE[tone]} ${className}`}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-admin-text">{title}</h3>
            {description ? (
              <p className="text-xs text-admin-text-dim mt-0.5 leading-relaxed">{description}</p>
            ) : null}
          </div>
          {headerRight}
        </div>
      ) : null}
      {children}
    </AdminFadeUp>
  );
}
