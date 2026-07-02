type Tone = "primary" | "success" | "warning" | "error" | "accent";

const toneStyles: Record<Tone, { ring: string; value: string; bar: string; active: string }> = {
  primary: {
    ring: "border-admin-primary/30 bg-admin-primary/10",
    value: "text-admin-primary",
    bar: "bg-admin-primary",
    active: "ring-2 ring-admin-primary/50 border-admin-primary/50",
  },
  success: {
    ring: "border-admin-success/30 bg-admin-success/10",
    value: "text-admin-success",
    bar: "bg-admin-success",
    active: "ring-2 ring-admin-success/50 border-admin-success/50",
  },
  warning: {
    ring: "border-admin-warning/30 bg-admin-warning/10",
    value: "text-admin-warning",
    bar: "bg-admin-warning",
    active: "ring-2 ring-admin-warning/50 border-admin-warning/50",
  },
  error: {
    ring: "border-admin-error/30 bg-admin-error/10",
    value: "text-admin-error",
    bar: "bg-admin-error",
    active: "ring-2 ring-admin-error/50 border-admin-error/50",
  },
  accent: {
    ring: "border-admin-accent/30 bg-admin-accent/10",
    value: "text-admin-accent",
    bar: "bg-admin-accent",
    active: "ring-2 ring-admin-accent/50 border-admin-accent/50",
  },
};

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
}

export function SpecialistMetricTile({ label, value, hint, tone = "primary", active, onClick }: Props) {
  const s = toneStyles[tone];
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]" : ""
      } ${s.ring} ${active ? s.active : ""}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-admin-text-dim">{label}</p>
      <p className={`mt-1.5 text-xl font-black tabular-nums sm:mt-2 sm:text-2xl ${s.value}`}>{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-admin-text-muted sm:text-[11px]">{hint}</p> : null}
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-admin-bg/80 sm:mt-3">
        <div className={`h-full w-2/3 ${s.bar} opacity-70`} />
      </div>
    </Tag>
  );
}
