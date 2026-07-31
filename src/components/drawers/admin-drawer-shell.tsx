import React from "react";
import ButtonCloseDrawer from "../ui/button-close-drawer";
import { useAdminT } from "../../store/locale/locale";

interface AdminDrawerShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelClassName?: string;
}

export const AdminDrawerShell = ({
  isOpen,
  onClose,
  title,
  subtitle,
  isSubmitting,
  children,
  footer,
  panelClassName = "max-w-md",
}: AdminDrawerShellProps) => {
  const { t } = useAdminT();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end admin-overlay-in">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close drawer"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div
        className={`relative w-full ${panelClassName} h-full bg-admin-panel border-l border-admin-border p-6 sm:p-8 shadow-[var(--shadow-admin-lg)] admin-drawer-in flex flex-col`}
      >
        <div className="flex justify-between items-start mb-6 shrink-0 gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-admin-text tracking-tight truncate">{title}</h2>
            <p className="text-xs font-mono text-admin-text-muted mt-1">
              {isSubmitting ? t("drawer.uploading") : subtitle || t("drawer.awaitingInput")}
            </p>
          </div>
          <ButtonCloseDrawer onClose={onClose} />
        </div>

        <div
          className={`flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5 transition-opacity duration-200 ${
            isSubmitting ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          {children}
        </div>

        {footer ? (
          <div className="pt-6 shrink-0 space-y-3 border-t border-admin-border mt-4">
            {footer}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full py-2.5 border border-admin-border rounded-xl text-admin-text-dim font-semibold text-sm hover:bg-admin-card hover:text-admin-text transition-colors cursor-pointer disabled:opacity-50"
            >
              {t("drawer.abortOperation")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
