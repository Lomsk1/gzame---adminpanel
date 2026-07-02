interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function SpecialistEmptyState({ title, description, actionLabel, onAction, icon = "◎" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-admin-border/60 bg-gradient-to-b from-admin-panel/30 to-transparent px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-primary/25 bg-admin-primary/10 text-2xl shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-bold text-admin-text sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-admin-text-dim">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-admin-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.99]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
