import { useMemo, useState, useEffect } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  Filter,
  Eye,
  Pencil,
  Trash2,
  RotateCw,
} from "lucide-react";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import { StatCard } from "../../components/stats/stat-card";
import { WikiCategoryBadge } from "../../components/wiki/wiki-category-badge";
import { WikiEditorDrawer, type WikiFormData } from "../../components/drawers/wiki-editor-drawer";
import { WikiRagTester } from "../../components/ai/wiki-rag-tester";
import { WikiHowItWorks } from "../../components/wiki/wiki-how-it-works";
import { AdminConfirmWrapper } from "../../components/wrapper/wrapper";
import { toast } from "sonner";
import {
  WIKI_CATEGORIES,
  WIKI_CATEGORY_META,
} from "../../features/wiki/wiki.constants";
import type { WikiEntry, WikiCategory } from "../../types/wiki/wiki";
import type { WikiActionResponse } from "../../features/wiki/wiki.actions";

type SortKey = "updated" | "title" | "category";

export default function WikiPage() {
  const { entries } = useLoaderData() as { entries: WikiEntry[] };
  const fetcher = useFetcher<WikiActionResponse>();
  const revalidator = useRevalidator();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<WikiEntry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WikiCategory | "all">("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("updated");

  const isBusy = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        revalidator.revalidate();
        setDrawerOpen(false);
        setEditing(null);
      } else {
        toast.error(fetcher.data.error || "Action failed");
      }
      fetcher.reset();
    }
  }, [fetcher.state, fetcher.data, revalidator, fetcher]);

  const stats = useMemo(() => {
    const active = entries.filter((e) => e.is_active).length;
    const needsEmbed = entries.filter((e) => !e.embedded_at).length;
    const byCat = WIKI_CATEGORIES.reduce(
      (acc, c) => {
        acc[c] = entries.filter((e) => e.category === c).length;
        return acc;
      },
      {} as Record<WikiCategory, number>
    );
    const topCategory = WIKI_CATEGORIES.reduce(
      (best, c) => ((byCat[c] ?? 0) > (byCat[best] ?? 0) ? c : best),
      "general" as WikiCategory
    );
    return { total: entries.length, active, needsEmbed, topCategory, byCat };
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...entries];
    if (categoryFilter !== "all") {
      list = list.filter((e) => e.category === categoryFilter);
    }
    if (activeOnly) {
      list = list.filter((e) => e.is_active);
    }
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return list;
  }, [entries, search, categoryFilter, activeOnly, sortBy]);

  const selected =
    filtered.find((e) => e._id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length && !filtered.some((e) => e._id === selectedId)) {
      setSelectedId(filtered[0]!._id);
    }
  }, [filtered, selectedId]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (entry: WikiEntry) => {
    setEditing(entry);
    setSelectedId(entry._id);
    setDrawerOpen(true);
  };

  const handleSave = (data: WikiFormData) => {
    fetcher.submit(
      {
        intent: editing ? "update" : "create",
        id: editing?._id ?? "",
        payload: JSON.stringify(data),
      },
      { method: "post" }
    );
  };

  const handleReembed = (id: string) => {
    fetcher.submit({ intent: "reembed", id }, { method: "post" });
  };

  const handleDelete = (id: string) => {
    fetcher.submit({ intent: "delete", id }, { method: "post" });
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-admin-primary/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-admin-primary" />
            <span className="text-[10px] font-bold text-admin-text-dim uppercase tracking-widest">
              AI Memory · Structured knowledge
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-admin-text uppercase italic tracking-tighter">
            LLM <span className="text-admin-primary">Wiki</span>
          </h1>
          <p className="text-sm text-admin-text-dim mt-2 max-w-2xl">
            Curate psychotypes, frameworks, and rules. DEVI retrieves these via vector search alongside
            per-user memory — keep entries clear and active.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonComponent
            variant="secondary"
            size="sm"
            className="w-auto! px-4"
            onClick={() => revalidator.revalidate()}
            isLoading={revalidator.state === "loading"}
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh
          </ButtonComponent>
          <ButtonComponent variant="oracle" size="sm" className="w-auto! px-5" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2 inline" />
            New entry
          </ButtonComponent>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total entries" value={String(stats.total)} color="bg-admin-primary" />
        <StatCard title="Active in RAG" value={String(stats.active)} color="bg-admin-success" />
        <StatCard
          title="Needs embedding"
          value={String(stats.needsEmbed)}
          color={stats.needsEmbed > 0 ? "bg-admin-warning" : "bg-admin-success"}
        />
        <StatCard
          title="Largest category"
          value={
            stats.total > 0 ? WIKI_CATEGORY_META[stats.topCategory].label : "—"
          }
          color="bg-admin-accent"
        />
      </div>

      <WikiHowItWorks />

      {/* Search & filters */}
      <GlassCard className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-admin-text-dim mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim pointer-events-none" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-admin-panel/60 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/30"
                placeholder="Title, slug, body, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-admin-text-dim mb-2">
              Category
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim pointer-events-none" />
              <select
                className="w-full appearance-none pl-10 pr-8 py-2.5 bg-admin-panel/60 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as WikiCategory | "all")}
              >
                <option value="all">All categories</option>
                {WIKI_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {WIKI_CATEGORY_META[c].label} ({stats.byCat[c] ?? 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-admin-text-dim mb-2">
              Sort by
            </label>
            <select
              className="w-full px-3 py-2.5 bg-admin-panel/60 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="updated">Last updated</option>
              <option value="title">Title A–Z</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-end">
            <label className="flex items-center gap-3 h-[42px] px-4 rounded-xl border border-admin-border bg-admin-panel/40 cursor-pointer hover:border-admin-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="accent-admin-primary w-4 h-4 shrink-0"
              />
              <span className="text-sm text-admin-text">Active only</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-admin-border/60">
          <p className="text-xs text-admin-text-dim">
            Showing <span className="text-admin-text font-semibold">{filtered.length}</span> of{" "}
            {entries.length} entries
          </p>
          {(search || categoryFilter !== "all" || activeOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setActiveOnly(false);
              }}
              className="text-xs text-admin-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </GlassCard>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[480px]">
        {/* List */}
        <div className="xl:col-span-5 space-y-2 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
          {filtered.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <Sparkles className="w-10 h-10 text-admin-primary/40 mx-auto mb-4" />
              <p className="text-admin-text font-semibold">No entries yet</p>
              <p className="text-sm text-admin-text-dim mt-2 mb-6">
                Start with psychotype docs and behavioral frameworks so DEVI has grounded knowledge.
              </p>
              <ButtonComponent variant="oracle" size="sm" onClick={openCreate}>
                Create first entry
              </ButtonComponent>
            </GlassCard>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry._id}
                type="button"
                onClick={() => setSelectedId(entry._id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selected?._id === entry._id
                    ? "bg-admin-primary/10 border-admin-primary/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]"
                    : "bg-admin-panel/40 border-admin-border hover:border-admin-primary/30"
                } ${!entry.is_active ? "opacity-55" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <WikiCategoryBadge category={entry.category} />
                  {!entry.embedded_at && (
                    <span className="text-[9px] font-bold uppercase text-admin-warning border border-admin-warning/40 px-1.5 py-0.5 rounded">
                      No embed
                    </span>
                  )}
                </div>
                <p className="font-bold text-admin-text mt-2 truncate">{entry.title}</p>
                <p className="text-[10px] text-admin-text-dim font-mono mt-0.5">{entry.slug}</p>
                <p className="text-xs text-admin-text-dim line-clamp-2 mt-2">{entry.body}</p>
              </button>
            ))
          )}
        </div>

        {/* Preview + actions */}
        <div className="xl:col-span-7">
          {selected ? (
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-admin-border pb-4 mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <WikiCategoryBadge category={selected.category} />
                    {!selected.is_active && (
                      <span className="text-[10px] font-bold uppercase text-admin-error border border-admin-error/40 px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-admin-text uppercase italic tracking-tight">
                    {selected.title}
                  </h2>
                  <p className="text-xs text-admin-text-dim font-mono mt-1">{selected.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <ButtonComponent variant="secondary" size="sm" onClick={() => openEdit(selected)}>
                    <Pencil className="w-3.5 h-3.5 mr-1 inline" />
                    Edit
                  </ButtonComponent>
                  <ButtonComponent
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReembed(selected._id)}
                    isLoading={isBusy}
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1 inline" />
                    Re-embed
                  </ButtonComponent>
                  <AdminConfirmWrapper
                    title="Delete wiki entry?"
                    description="This removes the entry from MongoDB and RAG. DEVI will no longer retrieve it."
                    confirmWord="DELETE"
                    variant="danger"
                    onConfirm={() => handleDelete(selected._id)}
                    isLoading={isBusy}
                  >
                    <ButtonComponent variant="danger" size="sm" type="button">
                      <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
                      Delete
                    </ButtonComponent>
                  </AdminConfirmWrapper>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-[10px] text-admin-text-dim uppercase tracking-wider mb-4">
                <span>
                  Updated: {new Date(selected.updated_at).toLocaleString()}
                </span>
                <span>
                  Embedded:{" "}
                  {selected.embedded_at
                    ? new Date(selected.embedded_at).toLocaleString()
                    : "Never"}
                </span>
              </div>

              {(selected.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded-md bg-admin-bg border border-admin-border text-admin-text-dim"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-1 min-h-0">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-admin-primary" />
                  <span className="text-[10px] font-black text-admin-primary uppercase tracking-widest">
                    Preview (markdown body)
                  </span>
                </div>
                <pre className="flex-1 overflow-auto max-h-[360px] p-4 rounded-xl bg-admin-bg/50 border border-admin-border text-sm text-admin-text font-mono leading-relaxed whitespace-pre-wrap custom-scrollbar">
                  {selected.body}
                </pre>
              </div>

              <p className="text-[10px] text-admin-text-dim mt-4 border-t border-admin-border pt-3">
                {WIKI_CATEGORY_META[selected.category].description}
              </p>
            </GlassCard>
          ) : (
            <GlassCard className="p-10 h-full flex items-center justify-center text-admin-text-dim text-sm italic">
              Select an entry to preview
            </GlassCard>
          )}
        </div>
      </div>

      {/* RAG tester */}
      <WikiRagTester />

      {/* Help panel */}
      <GlassCard className="p-5 border-admin-primary/20 bg-admin-primary/5">
        <h3 className="text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
          Recommended seed order
        </h3>
        <ol className="grid md:grid-cols-2 gap-2 text-sm text-admin-text-dim list-decimal list-inside">
          <li>Psychotype summaries (all main types)</li>
          <li>Emotional regulation & stress frameworks</li>
          <li>Quest / specialist recommendation rules</li>
          <li>GPS Life & growth progression notes</li>
        </ol>
      </GlassCard>

      {drawerOpen && (
        <WikiEditorDrawer
          entry={editing}
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
          isSubmitting={isBusy}
        />
      )}
    </div>
  );
}
