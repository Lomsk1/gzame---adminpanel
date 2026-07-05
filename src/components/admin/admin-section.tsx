import type { ReactNode } from "react";
import { AdminFadeUp } from "./admin-animated";

type AdminSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  delayMs?: number;
  tone?: "default" | "amber" | "violet" | "emerald";
};

const TONE: Record<NonNullable<AdminSectionProps["tone"]>, string> = {
  default: "border-admin-border/40 bg-admin-bg/30",
  amber: "border-amber-500/25 bg-amber-500/5",
  violet: "border-violet-500/25 bg-violet-500/5",
  emerald: "border-emerald-500/25 bg-emerald-500/5",
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
      className={`rounded-2xl border p-4 md:p-5 space-y-3 ${TONE[tone]} ${className}`}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-admin-text">{title}</h3>
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
