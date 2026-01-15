import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const InputComponent = ({ label, error, ...props }: InputProps) => {
    return (
        <div className="w-full mb-5">
            <div className="relative overflow-hidden group">
                {/* 1. THE INPUT FIELD */}
                <input
                    {...props}
                    placeholder=" " /* Required space for peer-placeholder-shown */
                    className={`
            peer w-full px-4 pt-6 pb-2 rounded-xl border outline-none 
            bg-admin-card text-admin-text transition-all duration-300
            /* Standard Border & Interaction */
            ${error
                            ? "border-admin-error focus:ring-4 focus:ring-admin-error/10"
                            : "border-admin-border focus:border-admin-primary focus:ring-4 focus:ring-admin-primary/15"
                        }
          `}
                />

                {/* 2. THE FLOATING LABEL */}
                <label
                    className="
            absolute left-4 top-4 pointer-events-none transition-all duration-300 origin-left
            /* Default state (inside input) */
            text-admin-text-dim text-base
            /* Floating state (focused or has text) */
            peer-focus:top-2 peer-focus:scale-85 peer-focus:text-admin-primary
            peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-85
          "
                >
                    {label}
                </label>

                {/* 3. CENTER-EXPANDING BOTTOM LINE */}
                <div
                    className="
            absolute bottom-0 left-1/2 w-0 bg-admin-primary 
            transition-all duration-500 ease-out -translate-x-1/2
            peer-focus:w-full
          "
                />
            </div>

            {/* 4. ERROR MESSAGE */}
            {error && (
                <p className="mt-1.5 ml-1 text-xs font-semibold text-admin-error tracking-wide">
                    {error}
                </p>
            )}
        </div>
    );
};