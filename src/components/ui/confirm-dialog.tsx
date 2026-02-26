import React from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const variantStyles = {
    danger:
      "bg-admin-error border-admin-error/50 text-white hover:bg-admin-error/90",
    primary:
      "bg-admin-primary border-admin-primary/50 text-admin-bg hover:bg-admin-primary/90",
    default:
      "bg-admin-card border-admin-border text-admin-text hover:bg-admin-panel",
  };
  const btnClass = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="relative w-full max-w-sm mx-4 rounded-xl border border-admin-border bg-admin-panel p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h2
          id="confirm-title"
          className="text-lg font-bold text-admin-text uppercase tracking-tight mb-2"
        >
          {title}
        </h2>
        {message && (
          <p className="text-sm text-admin-text-dim mb-6 font-mono">
            {message}
          </p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-admin-border rounded-lg text-admin-text-dim hover:bg-admin-card hover:text-admin-text text-xs font-bold uppercase transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
