import type { ReactNode, ButtonHTMLAttributes } from "react";

type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "oracle";
type AdminButtonSize = "sm" | "md" | "lg";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<AdminButtonVariant, string> = {
  primary:
    "bg-admin-primary text-admin-bg hover:bg-admin-primary/90 border border-admin-primary/50 shadow-[var(--shadow-admin-sm)]",
  secondary:
    "bg-admin-card border border-admin-border text-admin-text-dim hover:text-admin-text hover:border-admin-primary/40",
  ghost:
    "bg-transparent border border-transparent text-admin-text-dim hover:text-admin-text hover:bg-admin-card",
  danger:
    "bg-admin-error/10 border border-admin-error/40 text-admin-error hover:bg-admin-error hover:text-white",
  oracle:
    "bg-admin-bg border border-admin-primary/50 text-admin-primary hover:bg-admin-primary/10",
};

const SIZES: Record<AdminButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-sm rounded-xl gap-2",
};

export function AdminButton({
  children,
  isLoading,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
        fullWidth ? "w-full" : ""
      } ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {isLoading ? (
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
