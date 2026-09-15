import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Loader2,
  RefreshCw,
  CalendarCheck,
  Wand2,
  XCircle,
} from "lucide-react";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { WikiRagTester } from "../../components/ai/wiki-rag-tester";
import axiosAuth from "../../helper/axios";
import { useAdminT } from "../../store/locale/locale";
import type { AdminMessages } from "../../i18n/translations";

type CheckStatus = "pass" | "warn" | "fail";
type CheckGroup = "core" | "wiki" | "memory" | "planner" | "devi";

type SystemCheck = {
  id: string;
  group: CheckGroup;
  label: string;
  status: CheckStatus;
  detail: string;
  meta?: Record<string, unknown>;
};

type SystemChecksPayload = {
  checkedAt: string;
  dbName: string;
  summary: { pass: number; warn: number; fail: number; total: number };
  checks: SystemCheck[];
};

const GROUP_ORDER: CheckGroup[] = ["core", "wiki", "memory", "planner", "devi"];

const GROUP_META: Record<
  CheckGroup,
  { titleKey: keyof AdminMessages; icon: typeof Database; hintKey: keyof AdminMessages }
> = {
  core: {
    titleKey: "systemChecks.groups.core",
    icon: Database,
    hintKey: "systemChecks.groups.coreHint",
  },
  wiki: {
    titleKey: "systemChecks.groups.wiki",
    icon: BookOpen,
    hintKey: "systemChecks.groups.wikiHint",
  },
  memory: {
    titleKey: "systemChecks.groups.memory",
    icon: Brain,
    hintKey: "systemChecks.groups.memoryHint",
  },
  planner: {
    titleKey: "systemChecks.groups.planner",
    icon: CalendarCheck,
    hintKey: "systemChecks.groups.plannerHint",
  },
  devi: {
    titleKey: "systemChecks.groups.devi",
    icon: Wand2,
    hintKey: "systemChecks.groups.deviHint",
  },
};

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-admin-success" />;
  }
  if (status === "warn") {
    return <AlertTriangle className="h-4 w-4 shrink-0 text-admin-warning" />;
  }
  return <XCircle className="h-4 w-4 shrink-0 text-admin-error" />;
}

function statusTone(status: CheckStatus): string {
  if (status === "pass") return "border-admin-success/30 bg-admin-success/5";
  if (status === "warn") return "border-admin-warning/30 bg-admin-warning/5";
  return "border-admin-error/30 bg-admin-error/5";
}

export default function SystemChecksPage() {
  const { t } = useAdminT();
  const [data, setData] = useState<SystemChecksPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosAuth.get<{
        status: string;
        data: SystemChecksPayload;
      }>("/api/v1/stats/system-checks");
      setData(res.data.data);
    } catch {
      setError(t("systemChecks.loadFailed"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  const summary = data?.summary;

  return (
    <AdminPageShell maxWidthClass="max-w-5xl" className="space-y-6">
      <AdminPageHeader
        title={t("pages.systemChecks.title")}
        icon={<Activity className="h-5 w-5 text-admin-primary" />}
      />

      <GlassCard contentClassName="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-admin-text-dim">{t("systemChecks.hint")}</p>
            {data ? (
              <p className="mt-1 text-xs text-admin-text-dim">
                {t("systemChecks.checkedAt", {
                  time: new Date(data.checkedAt).toLocaleString(),
                  db: data.dbName,
                })}
              </p>
            ) : null}
          </div>
          <ButtonComponent
            variant="oracle"
            size="sm"
            className="w-auto! shrink-0 px-4"
            onClick={() => void runChecks()}
            isLoading={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("systemChecks.runAgain")}
          </ButtonComponent>
        </div>

        {error ? (
          <p className="text-sm text-admin-error">{error}</p>
        ) : null}

        {loading && !data ? (
          <div className="flex items-center gap-2 py-8 text-sm text-admin-text-dim">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("systemChecks.running")}
          </div>
        ) : null}

        {summary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-admin-border bg-admin-bg/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-admin-text-dim">
                {t("systemChecks.summary.total")}
              </p>
              <p className="mt-1 text-2xl font-bold text-admin-text">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-admin-success/30 bg-admin-success/10 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-admin-success">
                {t("systemChecks.summary.pass")}
              </p>
              <p className="mt-1 text-2xl font-bold text-admin-success">{summary.pass}</p>
            </div>
            <div className="rounded-xl border border-admin-warning/30 bg-admin-warning/10 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-admin-warning">
                {t("systemChecks.summary.warn")}
              </p>
              <p className="mt-1 text-2xl font-bold text-admin-warning">{summary.warn}</p>
            </div>
            <div className="rounded-xl border border-admin-error/30 bg-admin-error/10 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-admin-error">
                {t("systemChecks.summary.fail")}
              </p>
              <p className="mt-1 text-2xl font-bold text-admin-error">{summary.fail}</p>
            </div>
          </div>
        ) : null}
      </GlassCard>

      {GROUP_ORDER.map((group) => {
        const meta = GROUP_META[group];
        const Icon = meta.icon;
        const rows = data?.checks.filter((c) => c.group === group) ?? [];
        if (!data && loading) return null;
        if (data && rows.length === 0) return null;
        return (
          <GlassCard key={group} contentClassName="space-y-3">
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 text-admin-primary" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-admin-text">
                  {t(meta.titleKey)}
                </h2>
                <p className="mt-0.5 text-xs text-admin-text-dim">{t(meta.hintKey)}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={`flex gap-3 rounded-xl border px-3 py-2.5 ${statusTone(row.status)}`}
                >
                  <StatusIcon status={row.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-admin-text">{row.label}</p>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-admin-text-dim">
                        {t(`systemChecks.status.${row.status}` as keyof AdminMessages)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-admin-text-dim break-words">{row.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {group === "wiki" ? (
              <p className="text-xs text-admin-text-dim">
                {t("systemChecks.wikiManual")}{" "}
                <Link to="/wiki" className="text-admin-primary underline-offset-2 hover:underline">
                  {t("nav.wiki")}
                </Link>
              </p>
            ) : null}
          </GlassCard>
        );
      })}

      <WikiRagTester />

      <GlassCard contentClassName="flex flex-wrap items-center gap-3 text-sm text-admin-text-dim">
        <Cpu className="h-4 w-4 text-admin-primary" />
        <span>{t("systemChecks.alsoSee")}</span>
        <Link to="/ai/overview" className="text-admin-primary hover:underline">
          {t("nav.aiOverview")}
        </Link>
        <span>·</span>
        <Link to="/ai/memory" className="text-admin-primary hover:underline">
          {t("nav.aiMemory")}
        </Link>
      </GlassCard>
    </AdminPageShell>
  );
}
