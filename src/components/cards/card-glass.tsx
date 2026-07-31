import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
  title?: string;
  onClick?: () => void;
  noContentPadding?: boolean;
  contentClassName?: string;
}

export const GlassCard = ({
  children,
  className = "",
  glow = false,
  hoverable = false,
  title,
  onClick,
  noContentPadding = false,
  contentClassName = "",
}: GlassCardProps) => {
  return (
    <div
      className={`relative bg-admin-card border border-admin-border rounded-xl shadow-[var(--shadow-admin)] ${
        glow ? "shadow-[0_0_32px_rgba(var(--admin-primary-rgb),0.12)]" : ""
      } ${
        hoverable
          ? "transition-colors duration-200 hover:border-admin-primary/40 cursor-pointer"
          : ""
      } ${className}`}
      title={title}
      onClick={onClick}
    >
      <div className={`relative z-10 ${noContentPadding ? "p-0 h-full min-h-0" : "p-5 md:p-6"} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
