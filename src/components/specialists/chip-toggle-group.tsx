import { useMemo, useState } from "react";

export type ChipOption = { value: string; label: string; hint?: string };

interface Props {
  options: ChipOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  columns?: 1 | 2;
}

export function ChipToggleGroup({
  options,
  selected,
  onChange,
  searchable = false,
  searchPlaceholder = "Search…",
  emptyLabel = "No options",
  columns = 2,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        o.hint?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="space-y-3">
      {searchable ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-admin-border bg-admin-panel/50 px-3 py-2.5 text-sm text-admin-text outline-none transition-colors focus:border-admin-primary"
        />
      ) : null}

      <div
        className={`max-h-48 overflow-y-auto custom-scrollbar rounded-xl border border-admin-border/70 bg-admin-bg/30 p-2 ${
          columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-2" : "flex flex-col gap-2"
        }`}
      >
        {filtered.length === 0 ? (
          <p className="col-span-full px-2 py-4 text-center text-sm italic text-admin-text-dim">{emptyLabel}</p>
        ) : (
          filtered.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                  on
                    ? "border-admin-primary bg-admin-primary/15 text-admin-text shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
                    : "border-transparent bg-admin-panel/30 text-admin-text-dim hover:border-admin-border hover:bg-admin-panel/60 hover:text-admin-text"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-black ${
                    on ? "border-admin-primary bg-admin-primary text-white" : "border-admin-border"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight">{opt.label}</span>
                  {opt.hint ? (
                    <span className="mt-0.5 block text-[11px] text-admin-text-muted">{opt.hint}</span>
                  ) : null}
                </span>
              </button>
            );
          })
        )}
      </div>

      {selected.length > 0 ? (
        <p className="text-[11px] font-mono text-admin-text-muted">
          {selected.length} selected
        </p>
      ) : null}
    </div>
  );
}
