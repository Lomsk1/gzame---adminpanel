import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputComponent = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="w-full mb-5">
      <div className="relative group">
        <input
          {...props}
          placeholder=" "
          className={`
            peer w-full px-4 pt-6 pb-2 rounded-xl border outline-none
            bg-admin-elevated text-admin-text transition-all duration-200
            ${
              error
                ? "border-admin-error focus:ring-2 focus:ring-admin-error/20"
                : "border-admin-border focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20"
            }
          `}
        />

        <label
          className="
            absolute left-4 top-4 pointer-events-none transition-all duration-200 origin-left
            text-admin-text-dim text-base
            peer-focus:top-2 peer-focus:scale-85 peer-focus:text-admin-primary
            peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-85
          "
        >
          {label}
        </label>

        <div
          className="
            absolute bottom-0 left-1/2 h-0.5 w-0 bg-admin-primary
            transition-all duration-300 ease-out -translate-x-1/2
            peer-focus:w-full
          "
        />
      </div>

      {error ? (
        <p className="mt-1.5 ml-1 text-xs font-medium text-admin-error tracking-wide">{error}</p>
      ) : null}
    </div>
  );
};
