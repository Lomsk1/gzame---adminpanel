import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { Brain, Database, BookOpen, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosAuth from "../../../helper/axios";
import { StatCard } from "../../../components/stats/stat-card";
import { GlassCard } from "../../../components/cards/card-glass";
import { ButtonComponent } from "../../../components/form/button";
import type { aiMemoryLoader } from "../../../features/ai-memory/ai-memory.loaders";
import type { AiMemoryListResponse } from "../../../features/ai-memory/ai-memory.types";
import { memoryKindLabel } from "../../../i18n/domain-labels";
import { AdminPageHeader, AdminPageShell } from "../../../components/admin";
import { useAdminT } from "../../../store/locale/locale";

const MEMORY_KINDS = [
  "chat_message",
  "daily_feel",
  "completed_quest",
  "planner_chat",
  "ai_observation",
  "biometric_summary",
  "summary",
];

export default function AiMemoryPage() {
  const { t } = useAdminT();
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
      setMemError(t("aiMemory.loadError"));
      setMemories(null);
    } finally {
      setLoadingMem(false);
    }
  }, [page, kindFilter, userFilter, textFilter, t]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const embedCalls = stats?.embeddings.totalCalls ?? 0;
  const totalMemories = stats?.totalActiveMemories ?? 0;

  return (
    <AdminPageShell maxWidthClass="max-w-7xl" className="space-y-8">
      <AdminPageHeader
        title={t("pages.aiMemory.title")}
        icon={<Brain className="w-5 h-5 text-admin-primary" />}
        actions={
          <Link to="/ai/overview">
            <ButtonComponent variant="secondary" size="sm" className="w-auto!">
              {t("aiMemory.commandCenter")}
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </ButtonComponent>
          </Link>
        }
      />

      {error && (
        <GlassCard className="p-4 border-admin-error/30 bg-admin-error/10 text-admin-error text-sm">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={t("aiMemory.stats.embedCalls")} value={String(embedCalls)} color="bg-admin-primary" />
        <StatCard title={t("aiMemory.stats.activeMemories")} value={String(totalMemories)} color="bg-admin-success" />
        <StatCard
          title={t("aiMemory.stats.charsEmbedded")}
          value={((stats?.embeddings.totalChars ?? 0) / 1000).toFixed(1) + "k"}
          color="bg-admin-accent"
        />
      </div>

      {stats && stats.memoriesIndexedByKind.length > 0 && (
        <GlassCard className="p-6">
          <h2 className="text-sm font-black text-admin-text uppercase italic mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-admin-primary" />
            {t("aiMemory.byKind", { days: stats.periodDays })}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.memoriesIndexedByKind.map((row) => (
              <div
                key={row._id}
                className="p-3 rounded-xl bg-admin-bg border border-admin-border"
              >
                <p className="text-[10px] uppercase text-admin-text-dim tracking-wider">
                  {memoryKindLabel(t, row._id)}
                </p>
                <p className="text-2xl font-black text-admin-text mt-1">{row.count}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <h2 className="text-sm font-black text-admin-text uppercase italic mb-4">
          {t("aiMemory.browser")}
        </h2>

        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-admin-panel/40 border border-admin-border rounded-xl text-sm"
              placeholder={t("aiMemory.searchPlaceholder")}
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
            <option value="">{t("aiMemory.allKinds")}</option>
            {MEMORY_KINDS.map((k) => (
              <option key={k} value={k}>
                {memoryKindLabel(t, k)}
              </option>
            ))}
          </select>
          <input
            className="bg-admin-panel/40 border border-admin-border rounded-lg px-3 py-2 text-sm font-mono min-w-[200px]"
            placeholder={t("aiMemory.filterUserId")}
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
            {t("common.refresh")}
          </ButtonComponent>
        </div>

        {memError && <p className="text-sm text-admin-error mb-3">{memError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase text-admin-text-dim border-b border-admin-border">
                <th className="pb-2 pr-4">{t("aiMemory.table.kind")}</th>
                <th className="pb-2 pr-4">{t("aiMemory.table.user")}</th>
                <th className="pb-2 pr-4">{t("aiMemory.table.text")}</th>
                <th className="pb-2 pr-4">{t("aiMemory.table.created")}</th>
              </tr>
            </thead>
            <tbody>
              {loadingMem && !memories ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-admin-text-dim italic">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : memories?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-admin-text-dim italic">
                    {t("aiMemory.noMatch")}
                  </td>
                </tr>
              ) : (
                memories?.items.map((row) => (
                  <tr key={row._id} className="border-b border-admin-border/50 hover:bg-admin-bg/30">
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-admin-primary/10 text-admin-primary">
                        {memoryKindLabel(t, row.kind)}
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
              {t("aiMemory.pagination", {
                page: memories.page,
                pages: memories.pages,
                total: memories.total,
              })}
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
            <h3 className="font-bold text-admin-text">{t("aiMemory.wikiTitle")}</h3>
            <p className="text-sm text-admin-text-dim mt-1">{t("aiMemory.wikiDesc")}</p>
          </div>
          <Link to="/wiki">
            <ButtonComponent variant="oracle" size="sm" className="w-auto!">
              {t("aiMemory.openWiki")}
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </ButtonComponent>
          </Link>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col gap-4">
          <Brain className="w-8 h-8 text-admin-accent" />
          <div>
            <h3 className="font-bold text-admin-text">{t("aiMemory.indexedTitle")}</h3>
            <p className="text-sm text-admin-text-dim mt-1">{t("aiMemory.indexedDesc")}</p>
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
}
