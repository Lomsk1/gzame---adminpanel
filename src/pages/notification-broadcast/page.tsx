import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import axiosAuth from "../../helper/axios";

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
  const [scope, setScope] = useState<Scope>("all");
  const [psychotype, setPsychotype] = useState<(typeof PSYCHOTYPES)[number]>("STALKER");
  const [title, setTitle] = useState("System update");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [type, setType] = useState<NotificationType>("SYSTEM_DIRECTIVE");
  const [actionUrl, setActionUrl] = useState("/notifications");
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
      toast.error("Message content is required.");
      return;
    }
    setSending(true);
    const toastId = toast.loading("Sending broadcast...");
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

      toast.success("Broadcast complete", {
        id: toastId,
        description: `Users: ${data.totalUsers}, Push sent: ${data.push.sent}, No token: ${data.push.usersWithoutToken}`,
      });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : "Broadcast failed.";
      toast.error("Broadcast failed", { id: toastId, description: message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1 border-b border-admin-border/60 pb-6">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-admin-text">
          Notification Broadcast
        </h1>
        <p className="text-sm text-admin-text-dim">
          Send one notification to all active users or by psychotype.
        </p>
      </header>

      <GlassCard>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Target scope</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              >
                <option value="all">All active users</option>
                <option value="psychotype">By psychotype</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Psychotype</span>
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
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
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
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Priority</span>
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
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Action URL</span>
              <input
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/notifications"
                className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-admin-bg/80 p-3 text-sm text-admin-text outline-none focus:border-admin-primary"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Message content</span>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter broadcast message..."
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
              Send broadcast
            </ButtonComponent>
          </div>
        </div>
      </GlassCard>

      {lastResult ? (
        <GlassCard>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Targeted users</p>
              <p className="mt-1 text-2xl font-black text-admin-primary">{lastResult.totalUsers}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Push sent / failed</p>
              <p className="mt-1 text-2xl font-black text-admin-text">
                {lastResult.push.sent} / {lastResult.push.failed}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Users without token</p>
              <p className="mt-1 text-2xl font-black text-admin-warning">{lastResult.push.usersWithoutToken}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
