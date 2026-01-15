import React from "react";

// 1. Defined literal types for better intellisense
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
    size = "md", // Default is your original size
    ...props
}: ButtonProps) => {

    // Kept your exact design strings
    const variants: Record<ButtonVariant, string> = {
        primary: "bg-admin-primary hover:bg-admin-accent shadow-admin-primary/20",
        secondary: "bg-admin-card border border-admin-border hover:border-admin-primary text-admin-text-dim hover:text-admin-text",
        oracle: "bg-admin-bg border border-admin-primary text-admin-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-admin-primary hover:text-white",
        // New: Essential for User Management "Block/Delete" actions
        danger: "bg-admin-error/10 border border-admin-error/50 text-admin-error hover:bg-admin-error hover:text-white shadow-admin-error/10"
    };

    // Responsive size mapping
    const sizes: Record<ButtonSize, string> = {
        sm: "py-2 px-4 text-[10px] tracking-wider rounded-lg",
        md: "py-3.5 px-6 text-sm tracking-widest rounded-xl", // Your original padding
        lg: "py-5 px-10 text-base tracking-[0.2em] rounded-2xl"
    };

    return (
        <button
            {...props}
            disabled={isLoading || props.disabled}
            className={`
                relative w-full font-bold uppercase
                transition-all duration-300 transform active:scale-[0.98] 
                disabled:opacity-70 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer
                ${variants[variant]} 
                ${sizes[size]} 
                ${variant === 'secondary' ? '' : 'text-white'} 
                ${props.className || ""}
            `}
        >
            {isLoading ? (
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};