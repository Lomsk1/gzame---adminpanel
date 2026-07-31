import React from "react";
import { useAdminT } from "../../store/locale/locale";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "success" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = undefined,
  cancelLabel = undefined,
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useAdminT();
  const resolvedConfirm = confirmLabel ?? t("common.confirm");
  const resolvedCancel = cancelLabel ?? t("common.cancel");

  if (!open) return null;

  const variantStyles = {
    danger:
      "bg-admin-error border-admin-error/50 text-white hover:bg-admin-error/90 disabled:opacity-60",
    primary:
      "bg-admin-primary border-admin-primary/50 text-admin-bg hover:bg-admin-primary/90 disabled:opacity-60",
    success:
      "bg-admin-success border-admin-success/50 text-admin-bg hover:bg-admin-success/90 disabled:opacity-60",
    default:
      "bg-admin-card border-admin-border text-admin-text hover:bg-admin-elevated disabled:opacity-60",
  };
  const btnClass = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center admin-overlay-in">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={loading ? undefined : onCancel}
      />
      <div
        className="relative w-full max-w-md mx-4 rounded-xl border border-admin-border bg-admin-panel shadow-[var(--shadow-admin-lg)] admin-dialog-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="h-0.5 w-full bg-admin-primary/60" />
        <div className="p-6">
          <h2 id="confirm-title" className="text-lg font-semibold text-admin-text tracking-tight mb-2">
            {title}
          </h2>
          {message ? (
            <p className="text-sm text-admin-text-dim leading-relaxed mb-6 whitespace-pre-wrap">
              {message}
            </p>
          ) : null}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="px-4 py-2.5 border border-admin-border rounded-xl text-admin-text-dim hover:bg-admin-card hover:text-admin-text text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {resolvedCancel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors ${btnClass}`}
            >
              {loading ? t("common.processing") : resolvedConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
