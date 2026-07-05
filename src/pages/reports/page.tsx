import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { format } from "date-fns";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MessageSquareWarning,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import axiosAuth from "../../helper/axios";
import { StatCard } from "../../components/stats/stat-card";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { AdminPageHeader, AdminPageShell, ADMIN_PANEL_CLASS } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";
import {
  ReportActionsPanel,
  type ResolveAction,
} from "../../components/reports/report-actions-panel";
import { ReportFinancialExplainer } from "../../components/reports/report-financial-explainer";
import { ReportQueueRow } from "../../components/reports/report-queue-row";
import { ReportResolutionBanner } from "../../components/reports/report-resolution-banner";
import {
  formatReportEur,
  isReportActionable,
  reportTotalCents,
} from "../../components/reports/report-utils";
import type { reportsPageLoader, ReportListItem } from "../../features/reports/reports.loaders";

const QUEUE_TABS = [
  { id: "open", labelKey: "reports.queue.open" },
  { id: "resolved", labelKey: "reports.queue.resolved" },
  { id: "all", labelKey: "reports.queue.all" },
] as const;

type PendingConfirm =
  | { type: "resolve"; action: ResolveAction }
  | { type: "info" }
  | null;

export default function ReportsPage() {
  const { t } = useAdminT();
  const { queue, search, page, total, limit, overview, reports, selectedId, detail } =
    useLoaderData() as Awaited<ReturnType<typeof reportsPageLoader>>;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [searchInput, setSearchInput] = useState(search);
  const [busy, setBusy] = useState<string | null>(null);
  const [partialEur, setPartialEur] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [adminNotes, setAdminNotes] = useState(detail?.booking?.dispute_admin_notes ?? "");
  const [infoMessage, setInfoMessage] = useState("");
  const [notifyParties, setNotifyParties] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [refundServiceFee, setRefundServiceFee] = useState(true);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  const booking = detail?.booking;
  const deviRec = detail?.deviPack?.devi_recommendation as
    | { action?: string; rationale?: string }
    | undefined;

  useEffect(() => {
    setAdminNotes(detail?.booking?.dispute_admin_notes ?? "");
    setPartialEur("");
    setResolutionNote("");
    setInfoMessage("");
    setPendingConfirm(null);
  }, [detail?.booking?._id, detail?.booking?.dispute_admin_notes]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const actionable = booking ? isReportActionable(booking) : false;

  const selectReport = (id: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("id", id);
    setSearchParams(p);
  };

  const setQueue = (next: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("queue", next);
    p.delete("page");
    p.delete("id");
    setSearchParams(p);
  };

  const applySearch = () => {
    const p = new URLSearchParams(searchParams);
    p.set("page", "1");
    if (searchInput.trim()) p.set("search", searchInput.trim());
    else p.delete("search");
    setSearchParams(p);
  };

  const runResolve = useCallback(
    async (action: ResolveAction) => {
      if (!selectedId || !booking) return;
      setBusy(action);
      try {
        const amountCents =
          action === "refund_partial" && partialEur.trim()
            ? Math.round(Number.parseFloat(partialEur) * 100)
            : undefined;
        await axiosAuth.post(`/api/v1/stats/reports/${selectedId}/resolve`, {
          action,
          amountCents,
          refundServiceFee,
          resolutionNote: resolutionNote.trim() || undefined,
          notifyParties,
          sendEmail,
        });
        toast.success(t("reports.resolvedSuccess"));
        setPartialEur("");
        setResolutionNote("");
        setPendingConfirm(null);
        revalidator.revalidate();
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Action failed";
        toast.error(msg);
      } finally {
        setBusy(null);
      }
    },
    [
      selectedId,
      booking,
      partialEur,
      refundServiceFee,
      resolutionNote,
      notifyParties,
      sendEmail,
      revalidator,
    ],
  );

  const runRequestInfo = async () => {
    if (!selectedId || !infoMessage.trim()) return;
    setBusy("info");
    try {
      await axiosAuth.post(`/api/v1/stats/reports/${selectedId}/request-info`, {
        message: infoMessage.trim(),
        adminNotes: adminNotes.trim() || undefined,
        notifyParties,
        sendEmail,
      });
      toast.success(t("reports.clientNotified"));
      setInfoMessage("");
      setPendingConfirm(null);
      revalidator.revalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const saveNotes = async () => {
    if (!selectedId || !adminNotes.trim()) return;
    setBusy("notes");
    try {
      await axiosAuth.patch(`/api/v1/stats/reports/${selectedId}/notes`, {
        adminNotes: adminNotes.trim(),
      });
      toast.success(t("reports.notesSaved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const confirmCopy = useMemo(() => {
    if (!pendingConfirm || !booking) return null;
    const total = formatReportEur(reportTotalCents(booking));
    const service = booking.service_snapshot?.title ?? "Consultation";

    if (pendingConfirm.type === "info") {
      return {
        title: t("reports.confirm.infoTitle"),
        message: t("reports.confirm.infoMessage"),
        confirmLabel: t("reports.confirm.infoConfirm"),
        variant: "primary" as const,
        onConfirm: runRequestInfo,
      };
    }

    const action = pendingConfirm.action;
    if (action === "refund_full") {
      return {
        title: t("reports.confirm.fullTitle"),
        message: t("reports.confirm.fullMessage", { amount: total, service }),
        confirmLabel: t("reports.confirm.fullConfirm"),
        variant: "danger" as const,
        onConfirm: () => runResolve("refund_full"),
      };
    }
    if (action === "refund_partial") {
      const partial = formatReportEur(Math.round(Number.parseFloat(partialEur) * 100));
      return {
        title: t("reports.confirm.partialTitle"),
        message: t("reports.confirm.partialMessage", { partial, service }),
        confirmLabel: t("reports.confirm.partialConfirm"),
        variant: "danger" as const,
        onConfirm: () => runResolve("refund_partial"),
      };
    }
    return {
      title: t("reports.confirm.releaseTitle"),
      message: t("reports.confirm.releaseMessage", { service, amount: total }),
      confirmLabel: t("reports.confirm.releaseConfirm"),
      variant: "success" as const,
      onConfirm: () => runResolve("release_specialist"),
    };
  }, [pendingConfirm, booking, partialEur, runResolve, t]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={t("pages.reports.title")}
        description={t("pages.reports.subtitle")}
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25">
            <AlertTriangle className="text-amber-400" size={22} />
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => revalidator.revalidate()}
            className="inline-flex items-center gap-2 rounded-xl border border-admin-border px-4 py-2.5 text-sm font-semibold text-admin-text-dim hover:text-admin-text hover:bg-admin-bg/40 transition-colors"
          >
            <RefreshCw size={16} />
            {t("common.refresh")}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 admin-fade-up" style={{ animationDelay: "80ms" }}>
        <StatCard title={t("reports.stats.open")} value={String(overview.open)} color="bg-amber-500" />
        <StatCard title={t("reports.stats.resolvedToday")} value={String(overview.resolvedToday)} color="bg-emerald-500" />
        <StatCard title={t("reports.stats.withEvidence")} value={String(overview.withEvidence)} color="bg-violet-500" />
        <StatCard title={t("reports.stats.totalResolved")} value={String(overview.totalResolved)} color="bg-blue-500" />
      </div>

      <ReportFinancialExplainer />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(300px,380px)_1fr] gap-4 min-h-[680px] admin-fade-up" style={{ animationDelay: "120ms" }}>
        <aside className={`${ADMIN_PANEL_CLASS} flex flex-col overflow-hidden`}>
          <div className="p-4 border-b border-admin-border/40 space-y-3">
            <div className="flex gap-1 p-1 rounded-xl bg-admin-bg/60">
              {QUEUE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueue(tab.id)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                    queue === tab.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                      : "text-admin-text-dim hover:text-admin-text"
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-dim"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder={t("reports.searchPlaceholder")}
                  className="w-full rounded-xl border border-admin-border bg-admin-bg/80 pl-9 pr-3 py-2.5 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-primary/30"
                />
              </div>
              <button
                type="button"
                onClick={applySearch}
                className="rounded-xl px-3.5 py-2 text-xs font-bold bg-admin-primary/20 text-admin-primary border border-admin-primary/30 hover:bg-admin-primary/30 transition-colors"
              >
                {t("common.go")}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-admin-border/30">
            {reports.length === 0 ? (
              <p className="p-8 text-sm text-admin-text-dim text-center">{t("reports.emptyQueue")}</p>
            ) : (
              reports.map((r) => (
                <ReportQueueRow
                  key={r._id}
                  report={r}
                  active={r._id === selectedId}
                  onSelect={() => selectReport(r._id)}
                />
              ))
            )}
          </div>

          {totalPages > 1 ? (
            <div className="p-3 border-t border-admin-border/40 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("page", String(page - 1));
                  setSearchParams(p);
                }}
                className="p-2 rounded-lg border border-admin-border disabled:opacity-40 hover:bg-admin-bg/50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-admin-text-dim font-medium">
                {t("common.page", { current: page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("page", String(page + 1));
                  setSearchParams(p);
                }}
                className="p-2 rounded-lg border border-admin-border disabled:opacity-40 hover:bg-admin-bg/50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </aside>

        <main className={`${ADMIN_PANEL_CLASS} p-5 md:p-6 overflow-y-auto space-y-5`}>
          {!booking ? (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-admin-text-dim gap-3">
              <MessageSquareWarning size={44} className="opacity-35" />
              <p className="text-sm">{t("reports.selectReport")}</p>
            </div>
          ) : (
            <>
              <ReportDetailHeader booking={booking} actionable={actionable} />

              {!actionable ? <ReportResolutionBanner booking={booking} /> : null}

              <div className="grid sm:grid-cols-2 gap-3">
                <PartyCard
                  label={t("reports.partyClient")}
                  name={booking.user_id?.nickname ?? booking.user_id?.email ?? "—"}
                  sub={booking.user_id?.email}
                />
                <PartyCard
                  label={t("reports.partySpecialist")}
                  name={booking.specialist_id?.name ?? "—"}
                  sub={
                    booking.specialist_id?.kyc_status
                      ? `KYC: ${booking.specialist_id.kyc_status}`
                      : undefined
                  }
                />
              </div>

              <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {t("reports.clientReport")}
                </h3>
                <p className="text-sm text-admin-text whitespace-pre-wrap leading-relaxed">
                  {booking.dispute_reason?.trim() || t("reports.noDescription")}
                </p>
                {booking.dispute_reported_at ? (
                  <p className="text-xs text-admin-text-dim">
                    {t("reports.filed", {
                      date: format(new Date(booking.dispute_reported_at), "PPp"),
                    })}
                  </p>
                ) : null}
              </section>

              <EvidenceSection booking={booking} />

              <ConversationSection booking={booking} />

              {deviRec ? (
                <section className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
                  <h3 className="text-xs font-bold uppercase text-violet-300 flex items-center gap-2">
                    <Shield size={14} />
                    {t("reports.deviRecommendation")}
                  </h3>
                  <p className="text-sm font-semibold text-admin-text mt-2 capitalize">
                    {deviRec.action ?? "review"}
                  </p>
                  {deviRec.rationale ? (
                    <p className="text-xs text-admin-text-dim mt-1 leading-relaxed">{deviRec.rationale}</p>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-2xl border border-admin-border/40 bg-admin-bg/30 p-4 space-y-3">
                <h3 className="text-sm font-bold text-admin-text">{t("reports.internalNotes")}</h3>
                <p className="text-xs text-admin-text-dim">{t("reports.internalNotesHint")}</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder={t("reports.notesPlaceholder")}
                  className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-3 py-2.5 text-sm text-admin-text resize-y focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                />
                <button
                  type="button"
                  disabled={busy === "notes" || !adminNotes.trim()}
                  onClick={saveNotes}
                  className="text-xs font-bold text-admin-primary hover:underline disabled:opacity-50"
                >
                  {busy === "notes" ? t("reports.savingNotes") : t("reports.saveNotes")}
                </button>
              </section>

              {actionable ? (
                <ReportActionsPanel
                  booking={booking}
                  busy={busy}
                  partialEur={partialEur}
                  resolutionNote={resolutionNote}
                  infoMessage={infoMessage}
                  refundServiceFee={refundServiceFee}
                  notifyParties={notifyParties}
                  sendEmail={sendEmail}
                  onPartialEurChange={setPartialEur}
                  onResolutionNoteChange={setResolutionNote}
                  onInfoMessageChange={setInfoMessage}
                  onRefundServiceFeeChange={setRefundServiceFee}
                  onNotifyChange={setNotifyParties}
                  onEmailChange={setSendEmail}
                  onRequestInfo={() => setPendingConfirm({ type: "info" })}
                  onResolveClick={(action) => setPendingConfirm({ type: "resolve", action })}
                />
              ) : null}
            </>
          )}
        </main>
      </div>

      {confirmCopy ? (
        <ConfirmDialog
          open
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          cancelLabel={t("common.cancel")}
          variant={confirmCopy.variant}
          loading={!!busy}
          onCancel={() => {
            if (!busy) setPendingConfirm(null);
          }}
          onConfirm={confirmCopy.onConfirm}
        />
      ) : null}
    </AdminPageShell>
  );
}

function ReportDetailHeader({
  booking,
  actionable,
}: {
  booking: ReportListItem;
  actionable: boolean;
}) {
  const { t } = useAdminT();
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 pb-1 border-b border-admin-border/30">
      <div>
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${
            actionable ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {actionable ? t("reports.openActionRequired") : t("reports.resolvedLocked")}
        </p>
        <h2 className="text-xl font-bold text-admin-text mt-1">{booking.service_snapshot?.title}</h2>
        <p className="text-sm text-admin-text-dim mt-1">
          {booking.scheduled_at ? format(new Date(booking.scheduled_at), "PPp") : "—"} ·{" "}
          {formatReportEur(reportTotalCents(booking))}
        </p>
      </div>
      <StatusBadge booking={booking} actionable={actionable} />
    </div>
  );
}

function StatusBadge({
  booking,
  actionable,
}: {
  booking: ReportListItem;
  actionable: boolean;
}) {
  const { t } = useAdminT();
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase shrink-0 ${
        actionable
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
      }`}
    >
      {actionable ? t("reports.underReview") : booking.dispute_resolution?.replace(/_/g, " ") ?? booking.status}
    </span>
  );
}

function PartyCard({ label, name, sub }: { label: string; name: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-admin-border/50 bg-admin-bg/40 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-admin-text-dim">{label}</p>
      <p className="text-sm font-semibold text-admin-text mt-1">{name}</p>
      {sub ? <p className="text-xs text-admin-text-dim mt-0.5 truncate">{sub}</p> : null}
    </div>
  );
}

function EvidenceSection({ booking }: { booking: ReportListItem }) {
  const { t } = useAdminT();
  const count = booking.dispute_evidence_urls?.length ?? 0;
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-dim mb-2">
        {t("reports.photoEvidence", { count })}
      </h3>
      {count > 0 ? (
        <div className="flex flex-wrap gap-2">
          {booking.dispute_evidence_urls!.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-admin-border/60 hover:ring-2 ring-admin-primary/40 transition-shadow"
            >
              <img src={url} alt={`Evidence ${i + 1}`} className="h-24 w-24 object-cover" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-admin-text-dim italic">{t("reports.noPhotos")}</p>
      )}
    </section>
  );
}

function ConversationSection({ booking }: { booking: ReportListItem }) {
  const { t } = useAdminT();
  const hasThread =
    booking.dispute_info_request_message || (booking.dispute_client_followups?.length ?? 0) > 0;
  if (!hasThread) return null;

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">{t("reports.conversation")}</h3>
      {booking.dispute_info_request_message ? (
        <div className="rounded-xl bg-black/20 border border-admin-border/30 p-3">
          <p className="text-[10px] font-bold uppercase text-admin-text-dim mb-1">
            {t("reports.adminRequest")}
            {booking.dispute_info_requested_at
              ? ` · ${format(new Date(booking.dispute_info_requested_at), "PPp")}`
              : ""}
          </p>
          <p className="text-sm text-admin-text whitespace-pre-wrap leading-relaxed">
            {booking.dispute_info_request_message}
          </p>
          {booking.dispute_awaiting_client_info ? (
            <p className="text-xs text-amber-300 mt-2 font-semibold">{t("reports.waitingClient")}</p>
          ) : null}
        </div>
      ) : null}
      {booking.dispute_client_followups?.map((reply, i) => (
        <div
          key={`${reply.created_at}-${i}`}
          className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3"
        >
          <p className="text-[10px] font-bold uppercase text-emerald-300 mb-1">
            {t("reports.clientReply")}
            {reply.created_at ? ` · ${format(new Date(reply.created_at), "PPp")}` : ""}
          </p>
          <p className="text-sm text-admin-text whitespace-pre-wrap leading-relaxed">{reply.message}</p>
          {(reply.evidence_urls?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {reply.evidence_urls!.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg border border-admin-border/40" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
