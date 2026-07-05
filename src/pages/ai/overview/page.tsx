import { Link } from "react-router";
import { useLoaderData } from "react-router";
import {
  Brain,
  BookOpen,
  Sparkles,
  ScrollText,
  Network,
  Activity,
  Settings2,
  ArrowRight,
  GitBranch,
  Clock,
} from "lucide-react";
import { StatCard } from "../../../components/stats/stat-card";
import { GlassCard } from "../../../components/cards/card-glass";
import { ButtonComponent } from "../../../components/form/button";
import { WikiRagTester } from "../../../components/ai/wiki-rag-tester";
import type { aiOverviewLoader } from "../../../features/ai-overview/ai-overview.loaders";
import { memoryKindLabel } from "../../../i18n/domain-labels";
import { AdminPageHeader, AdminPageShell } from "../../../components/admin";
import { useAdminT } from "../../../store/locale/locale";

const QUICK_LINK_KEYS = [
  { to: "/wiki", titleKey: "aiOverview.quickLinks.wiki", descKey: "aiOverview.quickLinks.wikiDesc", icon: BookOpen },
  { to: "/ai/memory", titleKey: "aiOverview.quickLinks.memory", descKey: "aiOverview.quickLinks.memoryDesc", icon: Brain },
  { to: "/ai", titleKey: "aiOverview.quickLinks.oracle", descKey: "aiOverview.quickLinks.oracleDesc", icon: Sparkles },
  { to: "/ai/logs", titleKey: "aiOverview.quickLinks.logs", descKey: "aiOverview.quickLinks.logsDesc", icon: ScrollText },
] as const;

export default function AiOverviewPage() {
  const { t } = useAdminT();
  const { overview, error } = useLoaderData<typeof aiOverviewLoader>();
  const cfg = overview?.config;
  const counts = overview?.counts;

  return (
    <AdminPageShell maxWidthClass="max-w-7xl" className="space-y-8">
      <AdminPageHeader
        title={t("pages.aiOverview.title")}
        icon={<Brain className="w-5 h-5 text-admin-primary" />}
      />

      {error ? (
        <GlassCard className="p-4 border-admin-error/30 bg-admin-error/10 text-admin-error text-sm admin-fade-up">
          {error}
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 admin-stagger">
        <StatCard
          title={t("aiOverview.stats.wikiEntries")}
          value={String(counts?.wikiActive ?? "—")}
          trend={counts ? t("aiOverview.stats.wikiTotal", { total: counts.wikiTotal }) : undefined}
          color="bg-admin-primary"
        />
        <StatCard
          title={t("aiOverview.stats.userMemories")}
          value={String(counts?.totalMemories ?? "—")}
          trend={
            counts
              ? t("aiOverview.stats.usersCount", { count: counts.usersWithMemories })
              : undefined
          }
          color="bg-admin-success"
        />
        <StatCard
          title={t("aiOverview.stats.knowledgeEdges")}
          value={String(counts?.knowledgeEdges ?? "—")}
          color="bg-admin-accent"
        />
        <StatCard
          title={t("aiOverview.stats.biometricSnapshots")}
          value={String(counts?.biometricSnapshots ?? "—")}
          color="bg-admin-warning"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 admin-stagger">
        {QUICK_LINK_KEYS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group p-4 rounded-xl border border-admin-border bg-admin-panel/40 hover:border-admin-primary/40 transition-all admin-nav-link"
            >
              <Icon className="w-5 h-5 text-admin-primary mb-2" />
              <p className="font-bold text-admin-text text-sm">{t(link.titleKey)}</p>
              <p className="text-xs text-admin-text-dim mt-1">{t(link.descKey)}</p>
              <ArrowRight className="w-4 h-4 text-admin-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 admin-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-admin-primary" />
            <h2 className="text-sm font-black text-admin-text uppercase italic">{t("aiOverview.pipelines")}</h2>
          </div>
          <div className="space-y-4">
            {(overview?.pipelines ?? []).map((pipe) => (
              <div key={pipe.id} className="border-l-2 border-admin-primary/40 pl-4">
                <p className="text-xs font-bold text-admin-primary uppercase tracking-wider mb-2">
                  {pipe.label}
                </p>
                <ol className="space-y-1">
                  {pipe.steps.map((step, i) => (
                    <li key={i} className="text-sm text-admin-text-dim flex gap-2">
                      <span className="text-admin-primary font-mono text-xs shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6 admin-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-admin-primary" />
              <h2 className="text-sm font-black text-admin-text uppercase italic">
                {t("aiOverview.runtimeConfig")}
              </h2>
            </div>
            {cfg ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-admin-text-dim">{t("aiOverview.config.chatModels")}</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.geminiModelChain.join(", ")}</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.embeddingModel")}</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.embeddingModel}</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.vectorDim")}</dt>
                <dd className="text-admin-text">{cfg.vectorDim}</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.memoryIndex")}</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.memoryVectorIndex}</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.wikiIndex")}</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.wikiVectorIndex}</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.topK")}</dt>
                <dd className="text-admin-text">
                  {cfg.memoryTopK} / {cfg.memoryMinScore}
                </dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.ragCache")}</dt>
                <dd className="text-admin-text">{cfg.memoryRagCacheTtl}s</dd>
                <dt className="text-admin-text-dim">{t("aiOverview.config.embeddingQueue")}</dt>
                <dd className={cfg.embeddingQueueEnabled ? "text-admin-success" : "text-admin-text-dim"}>
                  {cfg.embeddingQueueEnabled ? t("aiOverview.config.bullmq") : t("aiOverview.config.inline")}
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-admin-text-dim">{t("aiOverview.config.unavailable")}</p>
            )}
            {counts && counts.wikiNeedsEmbed > 0 ? (
              <div className="mt-4 p-3 rounded-lg bg-admin-warning/10 border border-admin-warning/30 text-sm text-admin-warning">
                {t("aiOverview.wikiNeedsEmbed", { count: counts.wikiNeedsEmbed })}
              </div>
            ) : null}
          </GlassCard>

          <GlassCard className="p-6 admin-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-admin-primary" />
              <h2 className="text-sm font-black text-admin-text uppercase italic">
                {t("aiOverview.backgroundJobs")}
              </h2>
            </div>
            <ul className="space-y-2">
              {(overview?.crons ?? []).map((cron) => (
                <li key={cron.name} className="flex gap-3 text-sm">
                  <Network className="w-4 h-4 text-admin-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-admin-text">{cron.name}</p>
                    <p className="text-admin-text-dim text-xs">{cron.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      {counts && counts.memoriesByKind.length > 0 ? (
        <GlassCard className="p-6 admin-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-admin-primary" />
            <h2 className="text-sm font-black text-admin-text uppercase italic">
              {t("aiOverview.memoriesByKind")}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {counts.memoriesByKind.map((row) => (
              <div
                key={row._id}
                className="p-3 rounded-xl bg-admin-bg border border-admin-border text-center"
              >
                <p className="text-[10px] uppercase text-admin-text-dim tracking-wider">
                  {memoryKindLabel(t, row._id)}
                </p>
                <p className="text-xl font-black text-admin-text mt-1">{row.count}</p>
              </div>
            ))}
          </div>
          <Link to="/ai/memory" className="inline-block mt-4">
            <ButtonComponent variant="secondary" size="sm" className="w-auto!">
              {t("aiOverview.browseMemories")}
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </ButtonComponent>
          </Link>
        </GlassCard>
      ) : null}

      <WikiRagTester />
    </AdminPageShell>
  );
}
