import type { ReportListItem } from "../../features/reports/reports.loaders";
import { useAdminT } from "../../store/locale/locale";

type Props = {
  report: ReportListItem;
  active: boolean;
  onSelect: () => void;
};

export function ReportQueueRow({ report, active, onSelect }: Props) {
  const { t } = useAdminT();
  const evidence = report.dispute_evidence_urls?.length ?? 0;
  const open = report.status === "disputed" && !report.dispute_resolved_at;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 transition-all border-l-2 admin-nav-link ${
        active
          ? "bg-amber-500/10 border-l-amber-400"
          : "border-l-transparent hover:bg-admin-bg/50"
      }`}
    >
      <div className="flex justify-between gap-2 items-start">
        <p className="text-sm font-semibold text-admin-text line-clamp-1">
          {report.service_snapshot?.title}
        </p>
        {open ? (
          <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300 border border-amber-500/30">
            {t("queue.open")}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300 border border-emerald-500/25">
            {t("queue.done")}
          </span>
        )}
      </div>
      <p className="text-xs text-admin-text-dim mt-1.5 line-clamp-2 leading-relaxed">
        {report.dispute_reason || t("reports.noDescription")}
      </p>
      <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2.5 text-[10px] text-admin-text-dim">
        <span>{report.user_id?.nickname ?? t("reports.partyClient")}</span>
        <span aria-hidden>·</span>
        <span>{report.specialist_id?.name ?? t("reports.partySpecialist")}</span>
        {evidence > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span className="text-admin-info font-semibold">
              {t(evidence === 1 ? "queue.photos" : "queue.photos_plural", { count: evidence })}
            </span>
          </>
        ) : null}
        {report.dispute_awaiting_client_info ? (
          <>
            <span aria-hidden>·</span>
            <span className="text-amber-300 font-semibold">{t("queue.awaitingClient")}</span>
          </>
        ) : null}
      </div>
    </button>
  );
}
