import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

type FieldWrapProps = {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

function FieldWrap({ label, error, hint, children, className = "" }: FieldWrapProps) {
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-admin-text-dim tracking-wide">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-admin-error">{error}</p> : null}
      {!error && hint ? <p className="mt-1.5 text-xs text-admin-text-muted">{hint}</p> : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xl border bg-admin-elevated text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20";

type AdminInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function AdminInput({ label, error, hint, className = "", ...props }: AdminInputProps) {
  return (
    <FieldWrap label={label} error={error} hint={hint}>
      <input
        {...props}
        className={`${CONTROL} px-3.5 py-2.5 text-sm ${
          error ? "border-admin-error" : "border-admin-border"
        } ${className}`}
      />
    </FieldWrap>
  );
}

type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function AdminTextarea({ label, error, hint, className = "", ...props }: AdminTextareaProps) {
  return (
    <FieldWrap label={label} error={error} hint={hint}>
      <textarea
        {...props}
        className={`${CONTROL} px-3.5 py-2.5 text-sm font-mono custom-scrollbar min-h-28 ${
          error ? "border-admin-error" : "border-admin-border"
        } ${className}`}
      />
    </FieldWrap>
  );
}

type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function AdminSelect({
  label,
  error,
  hint,
  className = "",
  children,
  ...props
}: AdminSelectProps) {
  return (
    <FieldWrap label={label} error={error} hint={hint}>
      <select
        {...props}
        className={`${CONTROL} px-3.5 py-2.5 text-sm ${
          error ? "border-admin-error" : "border-admin-border"
        } ${className}`}
      >
        {children}
      </select>
    </FieldWrap>
  );
}
