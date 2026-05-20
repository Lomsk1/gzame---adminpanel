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
import { MEMORY_KIND_LABELS } from "../../../features/ai-memory/ai-memory.types";

const QUICK_LINKS = [
  { to: "/wiki", label: "LLM Wiki", icon: BookOpen, desc: "Curate shared knowledge" },
  { to: "/ai/memory", label: "AI Memory", icon: Brain, desc: "Browse indexed memories" },
  { to: "/ai", label: "Gemini Oracle", icon: Sparkles, desc: "Quest psychotype instruction" },
  { to: "/ai/logs", label: "AI Logs", icon: ScrollText, desc: "Oracle decision stream" },
];

export default function AiOverviewPage() {
  const { overview, error } = useLoaderData<typeof aiOverviewLoader>();
  const cfg = overview?.config;
  const counts = overview?.counts;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="border-b border-admin-primary/20 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-admin-primary" />
          <span className="text-[10px] font-bold text-admin-text-dim uppercase tracking-widest">
            DEVI · RAG · Memory · Wiki
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-admin-text uppercase italic tracking-tighter">
          AI <span className="text-admin-primary">Command Center</span>
        </h1>
        <p className="text-sm text-admin-text-dim mt-2 max-w-3xl">
          Full visibility into how DEVI remembers users, retrieves wiki knowledge, and runs background
          intelligence. Configure indexes in Atlas — see{" "}
          <code className="text-admin-primary text-xs">gzame-server/src/model/ai/README.md</code>.
        </p>
      </header>

      {error && (
        <GlassCard className="p-4 border-admin-error/30 bg-admin-error/10 text-admin-error text-sm">
          {error}
        </GlassCard>
      )}

      {/* Vital stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Wiki entries"
          value={String(counts?.wikiActive ?? "—")}
          trend={counts ? `/${counts.wikiTotal} total` : undefined}
          color="bg-admin-primary"
        />
        <StatCard
          title="User memories"
          value={String(counts?.totalMemories ?? "—")}
          trend={counts ? `${counts.usersWithMemories} users` : undefined}
          color="bg-admin-success"
        />
        <StatCard
          title="Knowledge edges"
          value={String(counts?.knowledgeEdges ?? "—")}
          color="bg-admin-accent"
        />
        <StatCard
          title="Biometric snapshots"
          value={String(counts?.biometricSnapshots ?? "—")}
          color="bg-admin-warning"
        />
      </div>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group p-4 rounded-xl border border-admin-border bg-admin-panel/40 hover:border-admin-primary/40 transition-all"
            >
              <Icon className="w-5 h-5 text-admin-primary mb-2" />
              <p className="font-bold text-admin-text text-sm">{link.label}</p>
              <p className="text-xs text-admin-text-dim mt-1">{link.desc}</p>
              <ArrowRight className="w-4 h-4 text-admin-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipelines */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-admin-primary" />
            <h2 className="text-sm font-black text-admin-text uppercase italic">Data pipelines</h2>
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

        {/* Config + crons */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-admin-primary" />
              <h2 className="text-sm font-black text-admin-text uppercase italic">Runtime config</h2>
            </div>
            {cfg ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-admin-text-dim">Chat models</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.geminiModelChain.join(", ")}</dd>
                <dt className="text-admin-text-dim">Embedding model</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.embeddingModel}</dd>
                <dt className="text-admin-text-dim">Vector dimensions</dt>
                <dd className="text-admin-text">{cfg.vectorDim}</dd>
                <dt className="text-admin-text-dim">Memory index</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.memoryVectorIndex}</dd>
                <dt className="text-admin-text-dim">Wiki index</dt>
                <dd className="text-admin-text font-mono text-xs">{cfg.wikiVectorIndex}</dd>
                <dt className="text-admin-text-dim">Top-K / min score</dt>
                <dd className="text-admin-text">
                  {cfg.memoryTopK} / {cfg.memoryMinScore}
                </dd>
                <dt className="text-admin-text-dim">RAG cache TTL</dt>
                <dd className="text-admin-text">{cfg.memoryRagCacheTtl}s</dd>
                <dt className="text-admin-text-dim">Embedding queue</dt>
                <dd className={cfg.embeddingQueueEnabled ? "text-admin-success" : "text-admin-text-dim"}>
                  {cfg.embeddingQueueEnabled ? "BullMQ enabled" : "Inline (sync)"}
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-admin-text-dim">Config unavailable</p>
            )}
            {counts && counts.wikiNeedsEmbed > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-admin-warning/10 border border-admin-warning/30 text-sm text-admin-warning">
                {counts.wikiNeedsEmbed} wiki entries need embedding — open Wiki and use Re-embed.
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-admin-primary" />
              <h2 className="text-sm font-black text-admin-text uppercase italic">Background jobs</h2>
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

      {/* Memory breakdown */}
      {counts && counts.memoriesByKind.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-admin-primary" />
            <h2 className="text-sm font-black text-admin-text uppercase italic">Memories by kind</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {counts.memoriesByKind.map((row) => (
              <div
                key={row._id}
                className="p-3 rounded-xl bg-admin-bg border border-admin-border text-center"
              >
                <p className="text-[10px] uppercase text-admin-text-dim tracking-wider">
                  {MEMORY_KIND_LABELS[row._id] ?? row._id}
                </p>
                <p className="text-xl font-black text-admin-text mt-1">{row.count}</p>
              </div>
            ))}
          </div>
          <Link to="/ai/memory" className="inline-block mt-4">
            <ButtonComponent variant="secondary" size="sm" className="w-auto!">
              Browse all memories
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </ButtonComponent>
          </Link>
        </GlassCard>
      )}

      <WikiRagTester />
    </div>
  );
}
