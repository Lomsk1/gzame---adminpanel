import type { ReactNode, HTMLAttributes } from "react";

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info";

const TONES: Record<BadgeTone, string> = {
  default: "bg-admin-elevated text-admin-text-dim border-admin-border",
  primary: "bg-admin-primary/15 text-admin-primary border-admin-primary/30",
  success: "bg-admin-success/15 text-admin-success border-admin-success/30",
  warning: "bg-admin-warning/15 text-admin-warning border-admin-warning/30",
  error: "bg-admin-error/15 text-admin-error border-admin-error/30",
  info: "bg-admin-info/15 text-admin-info border-admin-info/30",
};

type AdminBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export function AdminBadge({ tone = "default", children, className = "", ...rest }: AdminBadgeProps) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function AdminStatus({
  tone = "success",
  label,
  className = "",
}: {
  tone?: BadgeTone;
  label: string;
  className?: string;
}) {
  const dot: Record<BadgeTone, string> = {
    default: "bg-admin-text-muted",
    primary: "bg-admin-primary",
    success: "bg-admin-success",
    warning: "bg-admin-warning",
    error: "bg-admin-error",
    info: "bg-admin-info",
  };

  return (
    <AdminBadge tone={tone} className={className}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />
      {label}
    </AdminBadge>
  );
}
