import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import axiosAuth from "../../helper/axios";
import { GlassCard } from "../cards/card-glass";
import { ButtonComponent } from "../form/button";
import { WikiCategoryBadge } from "../wiki/wiki-category-badge";
import { WIKI_CATEGORIES } from "../../features/wiki/wiki.constants";
import { wikiCategoryLabel } from "../../i18n/domain-labels";
import type { WikiCategory } from "../../types/wiki/wiki";
import { useAdminT } from "../../store/locale/locale";

type WikiSearchHit = {
  _id: string;
  slug: string;
  category: WikiCategory;
  title: string;
  bodyPreview: string;
  score: number;
};

export function WikiRagTester({ compact = false }: { compact?: boolean }) {
  const { t } = useAdminT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WikiCategory | "all">("all");
  const [hits, setHits] = useState<WikiSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosAuth.post<{
        status: string;
        data: { query: string; hits: WikiSearchHit[] };
      }>("/api/v1/wiki/search", {
        query: q,
        category: category === "all" ? undefined : category,
        topK: 5,
      });
      setHits(res.data.data.hits);
      setLastQuery(q);
    } catch {
      setError(t("wiki.rag.searchFailed"));
      setHits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className={`p-5 ${compact ? "" : "border-admin-primary/20"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-admin-primary" />
        <h3 className="text-xs font-black text-admin-primary uppercase tracking-widest">
          {t("wiki.rag.title")}
        </h3>
      </div>
      <p className="text-sm text-admin-text-dim mb-4">{t("wiki.rag.hint")}</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-admin-panel/40 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary"
            placeholder={t("wiki.rag.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
        </div>
        <select
          className="bg-admin-panel/40 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text min-w-[140px]"
          value={category}
          onChange={(e) => setCategory(e.target.value as WikiCategory | "all")}
        >
          <option value="all">{t("wiki.rag.allCategories")}</option>
          {WIKI_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {wikiCategoryLabel(t, c)}
            </option>
          ))}
        </select>
        <ButtonComponent
          variant="oracle"
          size="sm"
          className="w-auto! px-5 shrink-0"
          onClick={runSearch}
          isLoading={loading}
        >
          {t("wiki.rag.runSearch")}
        </ButtonComponent>
      </div>

      {error && <p className="text-sm text-admin-error mb-3">{error}</p>}

      {lastQuery && !loading && (
        <p className="text-[10px] text-admin-text-dim uppercase tracking-wider mb-3">
          {t("wiki.rag.results", { query: lastQuery, count: hits.length })}
        </p>
      )}

      <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
        {hits.length === 0 && lastQuery && !loading ? (
          <p className="text-sm text-admin-text-dim italic py-4 text-center">
            {t("wiki.rag.noMatches")}
          </p>
        ) : (
          hits.map((hit) => (
            <div
              key={hit._id}
              className="p-3 rounded-xl bg-admin-bg/50 border border-admin-border"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <WikiCategoryBadge category={hit.category} />
                <span className="text-[10px] font-mono text-admin-primary">
                  {t("wiki.rag.score", { value: (hit.score * 100).toFixed(0) })}
                </span>
              </div>
              <p className="font-semibold text-admin-text text-sm">{hit.title}</p>
              <p className="text-xs text-admin-text-dim line-clamp-2 mt-1">{hit.bodyPreview}</p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
