import type { SpecialistStatusFilter } from "./specialist-toolbar";

interface Props {
  search: string;
  statusFilter: SpecialistStatusFilter;
  categoryFilter: string;
  categoryLabel?: string;
  onClearSearch: () => void;
  onClearStatus: () => void;
  onClearCategory: () => void;
  onClearAll: () => void;
}

export function SpecialistActiveFilters({
  search,
  statusFilter,
  categoryFilter,
  categoryLabel,
  onClearSearch,
  onClearStatus,
  onClearCategory,
  onClearAll,
}: Props) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (search.trim()) {
    chips.push({ key: "search", label: `Search: “${search.trim()}”`, onRemove: onClearSearch });
  }
  if (statusFilter !== "all") {
    const labels: Record<SpecialistStatusFilter, string> = {
      all: "All",
      active: "Active only",
      inactive: "Inactive only",
      portal: "Portal enabled",
    };
    chips.push({ key: "status", label: labels[statusFilter], onRemove: onClearStatus });
  }
  if (categoryFilter && categoryLabel) {
    chips.push({ key: "category", label: categoryLabel, onRemove: onClearCategory });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-admin-primary/20 bg-admin-primary/5 px-3 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">Filters</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-admin-primary/30 bg-admin-bg/80 px-2.5 py-1 text-[11px] font-medium text-admin-text transition-colors hover:border-admin-error/40 hover:text-admin-error"
        >
          <span className="max-w-[180px] truncate sm:max-w-none">{chip.label}</span>
          <span aria-hidden className="text-admin-text-muted">×</span>
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-[11px] font-semibold text-admin-primary hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
