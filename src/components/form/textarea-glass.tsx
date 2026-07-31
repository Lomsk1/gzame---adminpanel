interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const GlassTextArea = ({ label, error, ...props }: TextAreaProps) => (
  <div className="flex flex-col gap-2 w-full h-full">
    <div className="flex justify-between items-center px-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-admin-primary">
        {label}
      </label>
      {error ? (
        <span className="text-[11px] text-admin-error font-medium">{error}</span>
      ) : null}
    </div>
    <textarea
      {...props}
      className="flex-1 min-h-100 w-full bg-admin-elevated border border-admin-border
                 rounded-xl p-5 text-admin-text font-mono text-sm leading-relaxed
                 focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 transition-colors
                 placeholder:text-admin-text-muted resize-none custom-scrollbar"
    />
  </div>
);
