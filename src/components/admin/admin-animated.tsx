import type { ReactNode, CSSProperties } from "react";

type AnimatedProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
};

export function AdminFadeIn({ children, className = "", style, delayMs = 0 }: AnimatedProps) {
  return (
    <div
      className={`admin-fade-in ${className}`}
      style={{ ...style, animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

export function AdminFadeUp({ children, className = "", style, delayMs = 0 }: AnimatedProps) {
  return (
    <div
      className={`admin-fade-up ${className}`}
      style={{ ...style, animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
};

/** Wrap each direct child in a stagger item for sequential fade-up. */
export function AdminStagger({ children, className = "", itemClassName = "" }: StaggerProps) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={`admin-stagger ${className}`}>
      {items.map((child, i) => (
        <div key={i} className={`admin-stagger-item ${itemClassName}`}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function AdminScaleIn({ children, className = "", style, delayMs = 0 }: AnimatedProps) {
  return (
    <div
      className={`admin-scale-in ${className}`}
      style={{ ...style, animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
