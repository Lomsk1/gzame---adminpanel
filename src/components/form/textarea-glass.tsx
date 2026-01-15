interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const GlassTextArea = ({ label, error, ...props }: TextAreaProps) => (
    <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-primary">{label}</label>
            {error && <span className="text-[10px] text-admin-error uppercase font-bold">{error}</span>}
        </div>
        <textarea
            {...props}
            className="flex-1 min-h-100 w-full bg-admin-bg/30 backdrop-blur-md border border-admin-border/50
                       rounded-2xl p-6 text-admin-text font-mono text-sm leading-relaxed
                       focus:outline-none focus:border-admin-primary/50 focus:ring-4 focus:ring-admin-primary/5 transition-all
                       placeholder:text-admin-text-muted resize-none custom-scrollbar"
        />
    </div>
);