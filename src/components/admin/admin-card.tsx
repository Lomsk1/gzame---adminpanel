import type { ReactNode, HTMLAttributes } from "react";

type AdminCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
};

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-4 md:p-5",
  lg: "p-5 md:p-6",
};

export function AdminCard({
  children,
  className = "",
  padding = "md",
  hover = false,
  ...rest
}: AdminCardProps) {
  return (
    <div
      {...rest}
      className={`rounded-xl border border-admin-border bg-admin-card shadow-[var(--shadow-admin)] ${
        hover ? "transition-colors hover:border-admin-primary/35" : ""
      } ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
