import { useState } from "react";
import { createPortal } from "react-dom";
import { ButtonComponent } from "../form/button";

interface AdminConfirmWrapperProps {
    title: string;
    description: string;
    confirmText?: string;
    confirmWord?: string;
    variant?: "danger" | "primary" | "warning";
    onConfirm: () => void;
    children: React.ReactNode;
    isLoading?: boolean;
    isFixed?: boolean;
    className?: string
}

export const AdminConfirmWrapper = ({
    title,
    description,
    confirmText = "Confirm Action",
    confirmWord,
    variant = "primary",
    onConfirm,
    children,
    isLoading,
    isFixed = false,
    className
}: AdminConfirmWrapperProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState("");

    const isLocked = confirmWord ? userInput !== confirmWord : false;

    const handleConfirm = () => {
        onConfirm();
        setIsOpen(false);
        setUserInput("");
    };

    const handleClose = () => {
        if (isLoading) return;
        setIsOpen(false);
        setUserInput("");
    };

    const ModalContent = (
        <div className={`${isFixed ? "fixed inset-0 z-9999" : "fixed inset-0 z-100"} flex items-center justify-center p-4`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 animate-in fade-in duration-200 ${isFixed
                    ? "bg-black/80 backdrop-blur-xl" // Heavy focus for isFixed
                    : "bg-admin-bg/90 backdrop-blur-md" // Original style
                    }`}
                onClick={handleClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-sm bg-admin-panel border border-admin-border p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className={`text-lg font-black uppercase italic tracking-tighter mb-2 ${variant === 'danger' ? 'text-admin-error' : 'text-admin-primary'}`}>
                    {title}
                </h3>
                <p className="text-xs text-admin-text-dim mb-6 leading-relaxed">
                    {description}
                </p>

                {confirmWord && (
                    <div className="mb-6 space-y-2">
                        <label className="text-[10px] font-bold text-admin-text-dim uppercase tracking-widest">
                            Verification: <span className="text-admin-text underline lowercase">{confirmWord}</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLocked && handleConfirm()}
                            className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-xs text-admin-text outline-none focus:ring-1 ring-admin-primary/50 font-mono"
                            placeholder="Input required..."
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <ButtonComponent
                        variant="secondary"
                        className="flex-1 text-[10px]"
                        onClick={handleClose}
                    >
                        ABORT
                    </ButtonComponent>
                    <ButtonComponent
                        variant={variant === "danger" ? "danger" : "oracle"}
                        className="flex-1 text-[10px]"
                        onClick={handleConfirm}
                        disabled={isLocked || isLoading}
                    >
                        {isLoading ? "EXECUTING..." : confirmText}
                    </ButtonComponent>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div onClick={() => setIsOpen(true)} className={`w-full h-full ${className}`}>
                {children}
            </div>

            {isOpen && (
                isFixed
                    ? createPortal(ModalContent, document.body) // Portal for perfect centering
                    : ModalContent // Standard inline render
            )}
        </>
    );
};