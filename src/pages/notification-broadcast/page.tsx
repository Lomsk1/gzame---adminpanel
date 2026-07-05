import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import axiosAuth from "../../helper/axios";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

type Scope = "all" | "psychotype";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type NotificationType =
  | "SYSTEM_DIRECTIVE"
  | "SECURITY_ALERT"
  | "ACHIEVEMENT"
  | "NEURAL_UPDATE"
  | "NEW_MESSAGE"
  | "QUEST_REMINDER"
  | "ENERGY_FILLED"
  | "DAILY_MOTIVATION"
  | "STREAK_MILESTONE"
  | "LEVEL_UP";

const SUGGESTED_ACTION_URL: Record<NotificationType, string> = {
  SYSTEM_DIRECTIVE: "/notifications",
  SECURITY_ALERT: "/notifications",
  ACHIEVEMENT: "/notifications",
  NEURAL_UPDATE: "/notifications",
  NEW_MESSAGE: "/chat",
  QUEST_REMINDER: "/quests",
  ENERGY_FILLED: "/quests",
  DAILY_MOTIVATION: "/quests",
  STREAK_MILESTONE: "/quests",
  LEVEL_UP: "/quests",
};

const PSYCHOTYPES = [
  "STALKER",
  "WARRIOR",
  "SHAMAN",
  "ARCHITECT",
  "SPARK",
  "ANOMALY",
  "PENDING",
] as const;

export default function NotificationBroadcastPage() {
  const { t } = useAdminT();
  const [scope, setScope] = useState<Scope>("all");
  const [psychotype, setPsychotype] = useState<(typeof PSYCHOTYPES)[number]>("STALKER");
  const [title, setTitle] = useState(() => t("broadcast.defaultTitle"));
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [type, setType] = useState<NotificationType>("SYSTEM_DIRECTIVE");
  const [actionUrl, setActionUrl] = useState(SUGGESTED_ACTION_URL.SYSTEM_DIRECTIVE);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    totalUsers: number;
    notificationsCreated: number;
    push: { sent: number; failed: number; usersWithoutToken: number };
    scope: Scope;
    psychotype?: string;
  } | null>(null);

  const sendBroadcast = async () => {
    if (!content.trim()) {
      toast.error(t("broadcast.contentRequired"));
      return;
    }
    setSending(true);
    const toastId = toast.loading(t("broadcast.sending"));
    try {
      const res = await axiosAuth.post<{
        status: string;
        message?: string;
        totalUsers: number;
        notificationsCreated: number;
        scope: Scope;
        psychotype?: string;
        push: { sent: number; failed: number; usersWithoutToken: number };
      }>("/api/v1/notification/broadcast", {
        scope,
        psychotype: scope === "psychotype" ? psychotype : undefined,
        title: title.trim(),
        content: content.trim(),
        priority,
        type,
        actionUrl: actionUrl.trim() || "/notifications",
      });

      const data = res.data;
      setLastResult({
        totalUsers: data.totalUsers,
        notificationsCreated: data.notificationsCreated,
        push: data.push,
        scope: data.scope,
        psychotype: data.psychotype,
      });

      toast.success(t("broadcast.complete"), {
        id: toastId,
        description: t("broadcast.completeDesc", {
          users: data.totalUsers,
          sent: data.push.sent,
          noToken: data.push.usersWithoutToken,
        }),
      });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : t("broadcast.failed");
      toast.error(t("broadcast.failed"), { id: toastId, description: message });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPageShell className="space-y-6">
      <AdminPageHeader title={t("pages.broadcast.title")} />

      <GlassCard>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.targetScope")}</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              >
                <option value="all">{t("broadcast.scopeAll")}</option>
                <option value="psychotype">{t("broadcast.scopePsychotype")}</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.psychotype")}</span>
              <select
                value={psychotype}
                onChange={(e) => setPsychotype(e.target.value as (typeof PSYCHOTYPES)[number])}
                disabled={scope !== "psychotype"}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary disabled:opacity-50"
              >
                {PSYCHOTYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.type")}</span>
              <select
                value={type}
                onChange={(e) => {
                  const nextType = e.target.value as NotificationType;
                  setType(nextType);
                  setActionUrl(SUGGESTED_ACTION_URL[nextType]);
                }}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              >
                <option value="SYSTEM_DIRECTIVE">SYSTEM_DIRECTIVE</option>
                <option value="SECURITY_ALERT">SECURITY_ALERT</option>
                <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                <option value="NEURAL_UPDATE">NEURAL_UPDATE</option>
                <option value="QUEST_REMINDER">QUEST_REMINDER</option>
                <option value="ENERGY_FILLED">ENERGY_FILLED</option>
                <option value="DAILY_MOTIVATION">DAILY_MOTIVATION</option>
                <option value="STREAK_MILESTONE">STREAK_MILESTONE</option>
                <option value="LEVEL_UP">LEVEL_UP</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.priority")}</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.actionUrl")}</span>
              <input
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder={SUGGESTED_ACTION_URL[type]}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              />
              <p className="text-[10px] text-admin-text-dim">
                {t("broadcast.suggestedFor")} <span className="font-bold">{type}</span>:{" "}
                <button
                  type="button"
                  onClick={() => setActionUrl(SUGGESTED_ACTION_URL[type])}
                  className="text-admin-primary underline"
                >
                  {SUGGESTED_ACTION_URL[type]}
                </button>
              </p>
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.titleLabel")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.messageContent")}</span>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("broadcast.messagePlaceholder")}
              className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary resize-none"
            />
          </label>

          <div className="pt-2">
            <ButtonComponent
              variant="oracle"
              isLoading={sending}
              onClick={sendBroadcast}
              className="w-full md:w-auto md:px-10"
            >
              {t("broadcast.send")}
            </ButtonComponent>
          </div>
        </div>
      </GlassCard>

      {lastResult ? (
        <GlassCard>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.result.targeted")}</p>
              <p className="mt-1 text-2xl font-black text-admin-primary">{lastResult.totalUsers}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.result.push")}</p>
              <p className="mt-1 text-2xl font-black text-admin-text">
                {lastResult.push.sent} / {lastResult.push.failed}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">{t("broadcast.result.noToken")}</p>
              <p className="mt-1 text-2xl font-black text-admin-warning">{lastResult.push.usersWithoutToken}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}
    </AdminPageShell>
  );
}
