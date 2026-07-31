import React from "react";

type ButtonVariant = "primary" | "secondary" | "oracle" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const ButtonComponent = ({
  children,
  isLoading,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-admin-primary hover:bg-admin-primary/90 text-admin-bg border border-admin-primary/40",
    secondary:
      "bg-admin-card border border-admin-border hover:border-admin-primary/40 text-admin-text-dim hover:text-admin-text",
    oracle:
      "bg-admin-bg border border-admin-primary/50 text-admin-primary hover:bg-admin-primary/10",
    danger:
      "bg-admin-error/10 border border-admin-error/50 text-admin-error hover:bg-admin-error hover:text-white",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "py-2 px-4 text-xs rounded-lg",
    md: "py-3 px-6 text-sm rounded-xl",
    lg: "py-4 px-8 text-base rounded-xl",
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        relative w-full font-semibold
        transition-all duration-200 transform active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 cursor-pointer
        ${variants[variant]}
        ${sizes[size]}
        ${props.className || ""}
      `}
    >
      {isLoading ? (
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
