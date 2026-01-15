interface Props {
    label: string;
    // Allow any value type the input might hold
    value?: string | number;
    onChange: (val?: number | string) => void;
    type?: "text" | "number" | "password" | "email";
    className?: string;
    placeholder?: string;
}

export const AdminInput = ({
    label,
    value,
    onChange,
    type = "text",
    className = "",
    placeholder
}: Props) => {

    // Logic to handle the "Annoying 0" only for number types
    const displayValue = type === "number" && value === 0 ? "" : value;

    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest block">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full bg-admin-panel/40 border border-admin-border p-2 text-sm text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
                value={displayValue}
                onChange={(e) => {
                    const val = e.target.value;
                    if (type === "number") {
                        onChange(val === "" ? "" : Number(val));
                    } else {
                        onChange(val);
                    }
                }}
            />
        </div>
    );
};