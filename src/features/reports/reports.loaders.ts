import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type ReportQueue = "open" | "resolved" | "all";

export type ReportListItem = {
  _id: string;
  status: string;
  scheduled_at: string;
  dispute_reason?: string;
  dispute_evidence_urls?: string[];
  dispute_reported_at?: string;
  dispute_resolved_at?: string;
  dispute_resolution?: string;
  dispute_resolution_note?: string;
  dispute_admin_notes?: string;
  dispute_refund_cents?: number;
  dispute_info_request_message?: string;
  dispute_info_requested_at?: string;
  dispute_awaiting_client_info?: boolean;
  dispute_client_followups?: Array<{
    message: string;
    evidence_urls?: string[];
    created_at: string;
  }>;
  total_charge_cents?: number;
  service_snapshot: { title: string; price_cents: number; currency: string };
  specialist_id?: { _id: string; name?: string; kyc_status?: string };
  user_id?: { _id: string; nickname?: string; email?: string };
};

export type ReportsOverview = {
  open: number;
  resolvedToday: number;
  withEvidence: number;
  totalResolved: number;
};

export const reportsPageLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const queue = (url.searchParams.get("queue") || "open") as ReportQueue;
  const page = url.searchParams.get("page") || "1";
  const search = url.searchParams.get("search") || "";
  const selectedId = url.searchParams.get("id") || "";

  const [overview, listRes] = await Promise.all([
    axiosAuth
      .get<{ data: ReportsOverview }>("/api/v1/stats/reports/overview")
      .then((r) => r.data.data)
      .catch(() => ({ open: 0, resolvedToday: 0, withEvidence: 0, totalResolved: 0 })),
    axiosAuth
      .get<{ data: ReportListItem[]; total: number; page: number; limit: number }>(
        `/api/v1/stats/reports?queue=${queue}&page=${page}&limit=30${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      )
      .then((r) => r.data)
      .catch(() => ({ data: [], total: 0, page: 1, limit: 30 })),
  ]);

  const activeId = selectedId || listRes.data[0]?._id || "";
  const detail = activeId
    ? await axiosAuth
        .get<{ data: { booking: ReportListItem; deviPack: Record<string, unknown> | null } }>(
          `/api/v1/stats/reports/${activeId}`,
        )
        .then((r) => r.data.data)
        .catch(() => null)
    : null;

  return {
    queue,
    search,
    page: listRes.page,
    total: listRes.total,
    limit: listRes.limit,
    overview,
    reports: listRes.data,
    selectedId: activeId,
    detail,
  };
};
