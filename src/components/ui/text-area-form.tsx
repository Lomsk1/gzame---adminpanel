interface Props {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    rows?: number;
}

export const AdminTextArea = ({
    label,
    value = "",
    onChange,
    className = "",
    placeholder,
    rows = 4
}: Props) => {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest block">
                {label}
            </label>
            <textarea
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-admin-panel/40 border border-admin-border p-2 text-sm text-admin-text outline-none focus:border-admin-primary transition-colors resize-none scrollbar-thin scrollbar-thumb-admin-primary/20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};