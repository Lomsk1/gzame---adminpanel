import { Shield, Undo2, Wallet } from "lucide-react";
import type { ReportListItem } from "../../features/reports/reports.loaders";
import { formatReportEur, reportTotalCents } from "./report-utils";
import { ReportNotifyToggles } from "./report-notify-toggles";
import { useAdminT } from "../../store/locale/locale";

export type ResolveAction = "refund_full" | "refund_partial" | "release_specialist";

type Props = {
  booking: ReportListItem;
  busy: string | null;
  partialEur: string;
  resolutionNote: string;
  infoMessage: string;
  refundServiceFee: boolean;
  notifyParties: boolean;
  sendEmail: boolean;
  onPartialEurChange: (v: string) => void;
  onResolutionNoteChange: (v: string) => void;
  onInfoMessageChange: (v: string) => void;
  onRefundServiceFeeChange: (v: boolean) => void;
  onNotifyChange: (v: boolean) => void;
  onEmailChange: (v: boolean) => void;
  onRequestInfo: () => void;
  onResolveClick: (action: ResolveAction) => void;
};

export function ReportActionsPanel(props: Props) {
  const { t } = useAdminT();
  const {
    booking,
    busy,
    partialEur,
    resolutionNote,
    infoMessage,
    refundServiceFee,
    notifyParties,
    sendEmail,
    onPartialEurChange,
    onResolutionNoteChange,
    onInfoMessageChange,
    onRefundServiceFeeChange,
    onNotifyChange,
    onEmailChange,
    onRequestInfo,
    onResolveClick,
  } = props;

  const totalCents = reportTotalCents(booking);
  const totalLabel = formatReportEur(totalCents);
  const partialCents = partialEur.trim() ? Math.round(Number.parseFloat(partialEur) * 100) : 0;
  const partialValid = partialCents > 0 && partialCents < totalCents;

  return (
    <div className="space-y-5 admin-fade-up">
      <ReportNotifyToggles
        notifyParties={notifyParties}
        sendEmail={sendEmail}
        onNotifyChange={onNotifyChange}
        onEmailChange={onEmailChange}
      />

      <section className="rounded-2xl border border-admin-info/25 bg-admin-info/5 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-admin-text">{t("reports.askClientTitle")}</h3>
          <p className="text-xs text-admin-text-dim mt-0.5">{t("reports.askClientHint")}</p>
        </div>
        <textarea
          value={infoMessage}
          onChange={(e) => onInfoMessageChange(e.target.value)}
          rows={2}
          placeholder={t("reports.infoPlaceholder")}
          className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-3 py-2.5 text-sm text-admin-text resize-y focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
        <button
          type="button"
          disabled={!!busy || !infoMessage.trim()}
          onClick={onRequestInfo}
          className="rounded-xl px-4 py-2.5 text-xs font-bold border border-admin-info/30 bg-admin-info/10 text-admin-info hover:bg-admin-info/20 disabled:opacity-50 transition-colors"
        >
          {busy === "info" ? t("reports.sendingInfo") : t("reports.requestInfo")}
        </button>
      </section>

      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-admin-text">{t("reports.resolveTitle")}</h3>
          <p className="text-xs text-admin-text-dim mt-0.5">{t("reports.resolveHint")}</p>
        </div>

        <textarea
          value={resolutionNote}
          onChange={(e) => onResolutionNoteChange(e.target.value)}
          rows={2}
          placeholder={t("reports.resolutionNotePlaceholder")}
          className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-3 py-2.5 text-sm text-admin-text resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />

        <label className="flex items-center gap-2 text-xs text-admin-text-dim cursor-pointer">
          <input
            type="checkbox"
            checked={refundServiceFee}
            onChange={(e) => onRefundServiceFeeChange(e.target.checked)}
            className="rounded border-admin-border"
          />
          {t("reports.refundServiceFee")}
        </label>

        <div className="rounded-xl border border-admin-border/40 bg-black/20 p-3 space-y-2">
          <label className="text-[10px] font-bold uppercase text-admin-text-dim">
            {t("reports.partialAmount")}
          </label>
          <input
            type="number"
            min={0.01}
            max={(totalCents / 100 - 0.01).toFixed(2)}
            step={0.01}
            placeholder={t("reports.partialLessThan", { amount: totalLabel })}
            value={partialEur}
            onChange={(e) => onPartialEurChange(e.target.value)}
            className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-3 py-2.5 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          {partialEur.trim() && !partialValid ? (
            <p className="text-[11px] text-red-300">
              {t("reports.partialInvalid", { max: formatReportEur(totalCents - 1) })}
            </p>
          ) : partialValid ? (
            <p className="text-[11px] text-emerald-300">
              {t("reports.partialPreview", {
                partial: formatReportEur(partialCents),
              })}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <ResolveActionCard
            title={t("reports.actionFullRefund")}
            description={t("reports.actionFullRefundDesc", { amount: totalLabel })}
            icon={<Undo2 size={16} className="text-red-300" />}
            tone="danger"
            busy={busy === "refund_full"}
            disabled={!!busy}
            processingLabel={t("common.processing")}
            onClick={() => onResolveClick("refund_full")}
          />
          <ResolveActionCard
            title={t("reports.actionPartialRefund")}
            description={t("reports.actionPartialRefundDesc")}
            icon={<Undo2 size={16} className="text-amber-300" />}
            tone="amber"
            busy={busy === "refund_partial"}
            disabled={!!busy || !partialValid}
            processingLabel={t("common.processing")}
            onClick={() => onResolveClick("refund_partial")}
          />
          <ResolveActionCard
            title={t("reports.actionRelease")}
            description={t("reports.actionReleaseDesc")}
            icon={<Shield size={16} className="text-emerald-300" />}
            tone="success"
            busy={busy === "release_specialist"}
            disabled={!!busy}
            processingLabel={t("common.processing")}
            onClick={() => onResolveClick("release_specialist")}
          />
        </div>
      </section>
    </div>
  );
}

function ResolveActionCard({
  title,
  description,
  icon,
  tone,
  busy,
  disabled,
  processingLabel,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "danger" | "amber" | "success";
  busy: boolean;
  disabled?: boolean;
  processingLabel: string;
  onClick: () => void;
}) {
  const tones = {
    danger: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40",
    amber: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40",
    success: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3.5 transition-colors admin-nav-link disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-admin-text">{busy ? processingLabel : title}</p>
          <p className="text-xs text-admin-text-dim mt-1 leading-relaxed">{description}</p>
        </div>
        <Wallet size={14} className="text-admin-text-dim shrink-0 mt-1 opacity-60" />
      </div>
    </button>
  );
}
