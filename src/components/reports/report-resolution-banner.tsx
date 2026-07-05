import { format } from "date-fns";
import { Lock, Undo2, Wallet, CheckCircle2 } from "lucide-react";
import type { ReportListItem } from "../../features/reports/reports.loaders";
import { formatReportEur } from "./report-utils";
import { useAdminT } from "../../store/locale/locale";
import type { AdminMessages } from "../../i18n/translations";

type Props = {
  booking: ReportListItem;
};

function resolutionKey(resolution?: string): keyof AdminMessages | null {
  switch (resolution) {
    case "refund_full":
      return "reports.resolution.refundFull";
    case "refund_partial":
      return "reports.resolution.refundPartial";
    case "release_specialist":
      return "reports.resolution.releaseSpecialist";
    default:
      return null;
  }
}

export function ReportResolutionBanner({ booking }: Props) {
  const { t } = useAdminT();
  if (!booking.dispute_resolution && !booking.dispute_resolved_at) return null;

  const rKey = resolutionKey(booking.dispute_resolution);
  const icon =
    booking.dispute_resolution === "release_specialist" ? (
      <CheckCircle2 size={18} className="text-emerald-400" />
    ) : booking.dispute_resolution === "refund_partial" ? (
      <Undo2 size={18} className="text-amber-300" />
    ) : (
      <Undo2 size={18} className="text-red-300" />
    );

  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-950/20 p-5 space-y-3 admin-fade-up">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {t("reports.finalDecision")}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase text-admin-text-dim border border-admin-border/40">
              <Lock size={10} />
              {t("reports.locked")}
            </span>
          </div>
          <p className="text-base font-bold text-admin-text mt-1">
            {rKey ? t(rKey) : booking.dispute_resolution?.replace(/_/g, " ")}
          </p>
          {booking.dispute_resolved_at ? (
            <p className="text-xs text-admin-text-dim mt-1">
              {format(new Date(booking.dispute_resolved_at), "PPp")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {booking.dispute_refund_cents ? (
          <div className="rounded-xl bg-black/20 border border-admin-border/30 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-admin-text-dim">{t("reports.clientRefund")}</p>
            <p className="text-sm font-bold text-red-200 mt-0.5">
              {formatReportEur(booking.dispute_refund_cents)}
            </p>
            <p className="text-[11px] text-admin-text-dim mt-1">{t("reports.refundTimeline")}</p>
          </div>
        ) : null}
        {booking.dispute_resolution === "release_specialist" ||
        booking.dispute_resolution === "refund_partial" ? (
          <div className="rounded-xl bg-black/20 border border-admin-border/30 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-admin-text-dim flex items-center gap-1">
              <Wallet size={11} />
              {t("reports.specialistPayout")}
            </p>
            <p className="text-sm font-bold text-emerald-200 mt-0.5">
              {booking.dispute_resolution === "refund_partial"
                ? t("reports.remainderReleased")
                : t("reports.fullReleased")}
            </p>
            <p className="text-[11px] text-admin-text-dim mt-1">{t("reports.payoutTimeline")}</p>
          </div>
        ) : null}
      </div>

      {booking.dispute_resolution_note ? (
        <div className="rounded-xl bg-black/20 border border-admin-border/30 p-3">
          <p className="text-[10px] font-bold uppercase text-admin-text-dim mb-1">
            {t("reports.messageToParties")}
          </p>
          <p className="text-sm text-admin-text whitespace-pre-wrap">{booking.dispute_resolution_note}</p>
        </div>
      ) : null}

      <p className="text-[11px] text-admin-text-dim leading-relaxed">{t("reports.permanentNote")}</p>
    </section>
  );
}
