import type { ReactNode } from "react";
import { AdminFadeIn } from "./admin-animated";

type AdminPageShellProps = {
  children: ReactNode;
  className?: string;
  maxWidthClass?: string;
  noPadding?: boolean;
};

export function AdminPageShell({
  children,
  className = "",
  maxWidthClass = "max-w-[1600px]",
  noPadding = false,
}: AdminPageShellProps) {
  return (
    <AdminFadeIn
      className={`mx-auto w-full ${maxWidthClass} ${noPadding ? "" : "p-6"} space-y-5 ${className}`}
    >
      {children}
    </AdminFadeIn>
  );
}
