import { useEffect, useMemo, useRef, useState } from "react";

interface CategoryOption {
  _id: string;
  label: string;
  count?: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  categories: CategoryOption[];
  placeholder?: string;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-admin-text-muted transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CategoryFilterSelect({
  value,
  onChange,
  categories,
  placeholder = "All categories",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedLabel = categories.find((c) => c._id === value)?.label;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.label.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-admin-bg/70 px-3 py-2.5 text-left text-sm transition-colors ${
          value
            ? "border-admin-primary/40 text-admin-text"
            : "border-admin-border text-admin-text-dim hover:border-admin-primary/25 hover:text-admin-text"
        }`}
      >
        <span className="min-w-0 truncate font-medium">{selectedLabel ?? placeholder}</span>
        <ChevronDown open={open} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-admin-border bg-admin-bg shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:min-w-[280px]">
          <div className="border-b border-admin-border/50 p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full rounded-lg border border-admin-border bg-admin-panel/50 px-3 py-2 text-sm text-admin-text outline-none placeholder:text-admin-text-muted focus:border-admin-primary"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1 custom-scrollbar" role="listbox">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => pick("")}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-admin-primary/10 ${
                  !value ? "bg-admin-primary/10 font-semibold text-admin-primary" : "text-admin-text"
                }`}
              >
                <span>All categories</span>
                {!value ? <span className="text-xs text-admin-primary">✓</span> : null}
              </button>
            </li>

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-admin-text-muted">No categories match</li>
            ) : (
              filtered.map((cat) => {
                const active = value === cat._id;
                return (
                  <li key={cat._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(cat._id)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-admin-primary/10 ${
                        active ? "bg-admin-primary/10 font-semibold text-admin-primary" : "text-admin-text"
                      }`}
                    >
                      <span className="min-w-0 truncate">{cat.label}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {cat.count != null ? (
                          <span className="rounded-full bg-admin-panel px-2 py-0.5 text-[10px] font-mono text-admin-text-muted">
                            {cat.count}
                          </span>
                        ) : null}
                        {active ? <span className="text-xs text-admin-primary">✓</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
