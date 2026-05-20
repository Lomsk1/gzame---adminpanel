import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { Brain, Database, BookOpen, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosAuth from "../../../helper/axios";
import { StatCard } from "../../../components/stats/stat-card";
import { GlassCard } from "../../../components/cards/card-glass";
import { ButtonComponent } from "../../../components/form/button";
import type { aiMemoryLoader } from "../../../features/ai-memory/ai-memory.loaders";
import {
  MEMORY_KIND_LABELS,
  type AiMemoryListResponse,
} from "../../../features/ai-memory/ai-memory.types";

const MEMORY_KINDS = Object.keys(MEMORY_KIND_LABELS);

export default function AiMemoryPage() {
  const { stats, error } = useLoaderData<typeof aiMemoryLoader>();

  const [memories, setMemories] = useState<AiMemoryListResponse | null>(null);
  const [memError, setMemError] = useState<string | null>(null);
  const [loadingMem, setLoadingMem] = useState(false);
  const [page, setPage] = useState(1);
  const [kindFilter, setKindFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");

  const loadMemories = useCallback(async () => {
    setLoadingMem(true);
    setMemError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (kindFilter) params.set("kind", kindFilter);
      if (userFilter.trim()) params.set("userId", userFilter.trim());
      if (textFilter.trim()) params.set("q", textFilter.trim());

      const res = await axiosAuth.get<{ status: string; data: AiMemoryListResponse }>(
        `/api/v1/stats/ai-memories?${params}`
      );
      setMemories(res.data.data);
    } catch {
      setMemError("Could not load memories.");
      setMemories(null);
    } finally {
      setLoadingMem(false);
    }
  }, [page, kindFilter, userFilter, textFilter]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const embedCalls = stats?.embeddings.totalCalls ?? 0;
  const totalMemories = stats?.totalActiveMemories ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-admin-primary/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-admin-primary" />
            <span className="text-[10px] font-bold text-admin-text-dim uppercase tracking-widest">
              RAG · Per-user vector memory
            </span>
          </div>
          <h1 className="text-3xl font-black text-admin-text uppercase italic tracking-tighter">
            AI <span className="text-admin-primary">Memory</span>
          </h1>
          <p className="text-sm text-admin-text-dim mt-2">
            Embedding usage and browsable indexed memories (last {stats?.periodDays ?? 30} days stats).
          </p>
        </div>
        <Link to="/ai/overview">
          <ButtonComponent variant="secondary" size="sm" className="w-auto!">
            AI Command Center
            <ArrowRight className="w-4 h-4 ml-2 inline" />
          </ButtonComponent>
        </Link>
      </header>

      {error && (
        <GlassCard className="p-4 border-admin-error/30 bg-admin-error/10 text-admin-error text-sm">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Embedding API calls" value={String(embedCalls)} color="bg-admin-primary" />
        <StatCard title="Active memories" value={String(totalMemories)} color="bg-admin-success" />
        <StatCard
          title="Chars embedded"
          value={((stats?.embeddings.totalChars ?? 0) / 1000).toFixed(1) + "k"}
          color="bg-admin-accent"
        />
      </div>

      {stats && stats.memoriesIndexedByKind.length > 0 && (
        <GlassCard className="p-6">
          <h2 className="text-sm font-black text-admin-text uppercase italic mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-admin-primary" />
            New memories by kind ({stats.periodDays}d)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.memoriesIndexedByKind.map((row) => (
              <div
                key={row._id}
                className="p-3 rounded-xl bg-admin-bg border border-admin-border"
              >
                <p className="text-[10px] uppercase text-admin-text-dim tracking-wider">
                  {MEMORY_KIND_LABELS[row._id] ?? row._id}
                </p>
                <p className="text-2xl font-black text-admin-text mt-1">{row.count}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Memory browser */}
      <GlassCard className="p-6">
        <h2 className="text-sm font-black text-admin-text uppercase italic mb-4">
          Memory browser
        </h2>

        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-admin-panel/40 border border-admin-border rounded-xl text-sm"
              placeholder="Search memory text..."
              value={textFilter}
              onChange={(e) => {
                setTextFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="bg-admin-panel/40 border border-admin-border rounded-lg px-3 py-2 text-sm"
            value={kindFilter}
            onChange={(e) => {
              setKindFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All kinds</option>
            {MEMORY_KINDS.map((k) => (
              <option key={k} value={k}>
                {MEMORY_KIND_LABELS[k]}
              </option>
            ))}
          </select>
          <input
            className="bg-admin-panel/40 border border-admin-border rounded-lg px-3 py-2 text-sm font-mono min-w-[200px]"
            placeholder="Filter by userId..."
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
          />
          <ButtonComponent
            variant="secondary"
            size="sm"
            className="w-auto! shrink-0"
            onClick={loadMemories}
            isLoading={loadingMem}
          >
            Refresh
          </ButtonComponent>
        </div>

        {memError && <p className="text-sm text-admin-error mb-3">{memError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase text-admin-text-dim border-b border-admin-border">
                <th className="pb-2 pr-4">Kind</th>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Text</th>
                <th className="pb-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {loadingMem && !memories ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-admin-text-dim italic">
                    Loading...
                  </td>
                </tr>
              ) : memories?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-admin-text-dim italic">
                    No memories match filters.
                  </td>
                </tr>
              ) : (
                memories?.items.map((row) => (
                  <tr key={row._id} className="border-b border-admin-border/50 hover:bg-admin-bg/30">
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-admin-primary/10 text-admin-primary">
                        {MEMORY_KIND_LABELS[row.kind] ?? row.kind}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-admin-text-dim max-w-[120px] truncate">
                      {row.user_id}
                    </td>
                    <td className="py-3 pr-4 text-admin-text max-w-md">
                      <p className="line-clamp-2">{row.summary || row.text}</p>
                    </td>
                    <td className="py-3 text-admin-text-dim text-xs whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {memories && memories.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-admin-border">
            <p className="text-xs text-admin-text-dim">
              Page {memories.page} of {memories.pages} · {memories.total} total
            </p>
            <div className="flex gap-2">
              <ButtonComponent
                variant="secondary"
                size="sm"
                className="w-auto!"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </ButtonComponent>
              <ButtonComponent
                variant="secondary"
                size="sm"
                className="w-auto!"
                disabled={page >= memories.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </ButtonComponent>
            </div>
          </div>
        )}
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5 flex flex-col gap-4">
          <BookOpen className="w-8 h-8 text-admin-primary" />
          <div>
            <h3 className="font-bold text-admin-text">LLM Wiki</h3>
            <p className="text-sm text-admin-text-dim mt-1">
              Shared knowledge DEVI retrieves for every user.
            </p>
          </div>
          <Link to="/wiki">
            <ButtonComponent variant="oracle" size="sm" className="w-auto!">
              Open Wiki
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </ButtonComponent>
          </Link>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col gap-4">
          <Brain className="w-8 h-8 text-admin-accent" />
          <div>
            <h3 className="font-bold text-admin-text">What gets indexed?</h3>
            <p className="text-sm text-admin-text-dim mt-1">
              Chat, daily feels, quests, planner, AI observations, biometric summaries, and compacted summaries.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
