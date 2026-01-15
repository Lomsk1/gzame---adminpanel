import React from "react";
import ButtonCloseDrawer from "../ui/button-close-drawer";

interface AdminDrawerShellProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    isSubmitting?: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const AdminDrawerShell = ({
    isOpen,
    onClose,
    title,
    subtitle,
    isSubmitting,
    children,
    footer
}: AdminDrawerShellProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={!isSubmitting ? onClose : undefined} />

            <div className="relative w-full max-w-md h-full bg-admin-bg border-l border-admin-primary/30 p-8 shadow-2xl slide-in-from-right duration-300 animate-in flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-admin-primary uppercase italic tracking-tighter">
                            {title}
                        </h2>
                        <p className="text-[8px] font-mono text-admin-text-dim uppercase tracking-widest">
                            {isSubmitting ? "Uploading_to_Mainframe..." : (subtitle || "Awaiting_Data_Input")}
                        </p>
                    </div>
                    <ButtonCloseDrawer onClose={onClose} />
                </div>

                {/* Content Area (Scrollable) */}
                <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 transition-opacity duration-300 ${isSubmitting ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {children}
                </div>

                {/* Footer / Action Buttons */}
                {footer && (
                    <div className="pt-8 shrink-0 space-y-3">
                        {footer}

                        <button
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="w-full py-3 border border-admin-border text-admin-text-dim font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all cursor-pointer"
                        >
                            Abort_Operation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};