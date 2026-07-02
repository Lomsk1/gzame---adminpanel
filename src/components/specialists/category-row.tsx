import type { SpecialistCategory } from "../../types/specialist/specialist";
import { AdminConfirmWrapper } from "../wrapper/wrapper";

interface Props {
  category: SpecialistCategory;
  specialistCount?: number;
  onEdit: () => void;
  onDelete: () => void;
}

const localeLabels = [
  { key: "en", label: "EN" },
  { key: "ka", label: "KA" },
  { key: "ru", label: "RU" },
  { key: "ja", label: "JA" },
] as const;

export function CategoryRow({ category, specialistCount = 0, onEdit, onDelete }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-admin-border/60 bg-admin-panel/40 p-4 transition-all hover:border-admin-primary/30 hover:shadow-md">
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-admin-text">{category.title?.en || "—"}</h3>
            <p className="mt-0.5 text-sm text-admin-text-dim">{category.title?.ka || "—"}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              specialistCount > 0
                ? "border border-admin-primary/30 bg-admin-primary/10 text-admin-primary"
                : "border border-admin-border bg-admin-bg/50 text-admin-text-muted"
            }`}
          >
            {specialistCount} linked
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {localeLabels.map(({ key, label }) => {
            const val = category.title?.[key];
            if (!val) return null;
            return (
              <span
                key={key}
                className="rounded-lg border border-admin-border/70 bg-admin-bg/50 px-2 py-1 text-[10px] text-admin-text-dim"
              >
                <span className="font-bold text-admin-primary">{label}</span> {val}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-admin-border/30 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-lg border border-admin-primary/30 bg-admin-primary/10 py-2 text-xs font-semibold text-admin-primary transition-colors hover:bg-admin-primary/20"
        >
          Edit
        </button>
        <AdminConfirmWrapper
          title="Delete category?"
          description="Specialists linked to this category may need to be updated."
          onConfirm={onDelete}
          variant="danger"
          className="flex-1"
        >
          <button
            type="button"
            className="w-full rounded-lg border border-admin-error/30 bg-admin-error/10 py-2 text-xs font-semibold text-admin-error transition-colors hover:bg-admin-error/20"
          >
            Delete
          </button>
        </AdminConfirmWrapper>
      </div>
    </div>
  );
}
