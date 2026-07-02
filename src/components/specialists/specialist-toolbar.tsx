import { CategoryFilterSelect } from "./category-filter-select";

export type SpecialistStatusFilter = "all" | "active" | "inactive" | "portal";
export type SpecialistViewMode = "grid" | "list";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: SpecialistStatusFilter;
  onStatusFilterChange: (value: SpecialistStatusFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: { _id: string; label: string; count?: number }[];
  viewMode: SpecialistViewMode;
  onViewModeChange: (mode: SpecialistViewMode) => void;
  resultCount: number;
  totalCount: number;
  onClearFilters?: () => void;
}

const statusOptions: { value: SpecialistStatusFilter; label: string; short: string }[] = [
  { value: "all", label: "All", short: "All" },
  { value: "active", label: "Active", short: "Active" },
  { value: "inactive", label: "Inactive", short: "Inactive" },
  { value: "portal", label: "Portal", short: "Portal" },
];

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-admin-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-white" : "text-admin-text-dim"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? "text-white" : "text-admin-text-dim"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpecialistToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
  onClearFilters,
}: Props) {
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || !!categoryFilter;

  return (
    <div className="space-y-4">
      {/* Row 1 — search + view */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, specialty, country, tag…"
            className="w-full rounded-xl border border-admin-border bg-admin-bg/70 py-2.5 pl-10 pr-4 text-sm text-admin-text outline-none transition-all placeholder:text-admin-text-muted focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/15"
          />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 lg:justify-end">
          <p className="text-xs text-admin-text-muted lg:hidden">
            <strong className="font-semibold text-admin-text">{resultCount}</strong>
            {resultCount !== totalCount ? ` / ${totalCount}` : ""} specialists
          </p>
          <div className="flex rounded-xl border border-admin-border bg-admin-bg/50 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-admin-primary" : "hover:bg-admin-panel/60"}`}
            >
              <GridIcon active={viewMode === "grid"} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-admin-primary" : "hover:bg-admin-panel/60"}`}
            >
              <ListIcon active={viewMode === "list"} />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — compact filter bar */}
      <div className="rounded-2xl border border-admin-border/60 bg-admin-panel/30 p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-6">
          {/* Status segmented control */}
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">Status</p>
            <div
              className="inline-flex w-full max-w-full rounded-xl border border-admin-border bg-admin-bg/50 p-1 sm:w-auto"
              role="group"
              aria-label="Filter by status"
            >
              {statusOptions.map((opt) => {
                const active = statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStatusFilterChange(opt.value)}
                    className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all sm:flex-none sm:px-4 sm:text-sm ${
                      active
                        ? "bg-admin-primary text-white shadow-sm"
                        : "text-admin-text-dim hover:bg-admin-panel/60 hover:text-admin-text"
                    }`}
                  >
                    <span className="hidden sm:inline">{opt.label}</span>
                    <span className="sm:hidden">{opt.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category searchable dropdown */}
          {categories.length > 0 ? (
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">
                Category
                <span className="ml-2 font-normal normal-case tracking-normal text-admin-text-muted">
                  ({categories.length} available)
                </span>
              </p>
              <CategoryFilterSelect
                value={categoryFilter}
                onChange={onCategoryFilterChange}
                categories={categories}
              />
            </div>
          ) : null}
        </div>

        {/* Footer row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-admin-border/40 pt-3">
          <p className="hidden text-xs text-admin-text-muted lg:block">
            Showing <strong className="font-semibold text-admin-text">{resultCount}</strong>
            {resultCount !== totalCount ? ` of ${totalCount}` : ""} specialists
          </p>
          {hasActiveFilters && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-semibold text-admin-primary transition-colors hover:text-admin-accent hover:underline"
            >
              Reset filters
            </button>
          ) : (
            <span className="text-xs text-admin-text-muted lg:ml-auto">No filters applied</span>
          )}
        </div>
      </div>
    </div>
  );
}
