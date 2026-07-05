import type { ReportListItem } from "../../features/reports/reports.loaders";

export function formatReportEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function reportTotalCents(booking: ReportListItem) {
  return booking.total_charge_cents ?? booking.service_snapshot.price_cents;
}

/** Report can still receive admin resolution / info requests. */
export function isReportActionable(booking: ReportListItem) {
  return booking.status === "disputed" && !booking.dispute_resolved_at && !booking.dispute_resolution;
}

export function resolutionLabel(resolution?: string) {
  switch (resolution) {
    case "refund_full":
      return "Full refund to client";
    case "refund_partial":
      return "Partial refund + remainder to specialist";
    case "release_specialist":
      return "Payment released to specialist";
    default:
      return resolution?.replace(/_/g, " ") ?? "Resolved";
  }
}

export const REPORT_PANEL =
  "rounded-2xl border border-admin-border/50 bg-admin-panel/70 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(0,0,0,0.45)]";
