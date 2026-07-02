import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function FormSection({ title, description, icon, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-admin-border/60 bg-admin-panel/25">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-admin-primary/5"
      >
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-admin-primary/25 bg-admin-primary/10 text-admin-primary">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black uppercase tracking-wide text-admin-text">{title}</span>
          {description ? (
            <span className="mt-1 block text-xs leading-relaxed text-admin-text-dim">{description}</span>
          ) : null}
        </span>
        <span className="text-admin-text-dim text-xs font-bold">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="space-y-4 border-t border-admin-border/40 px-4 py-4">{children}</div> : null}
    </section>
  );
}
