import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type PaymentsOverview = {
  bookingsByStatus: Record<string, number>;
  bookingVolume: {
    orderCents: number;
    serviceFeeCents: number;
    totalChargeCents: number;
    platformFeeCents: number;
    count: number;
  };
  subscriptionsByStatus: Record<string, number>;
  subscribedUsers: number;
  stripeSpecialists: Array<{ _id: string; count: number; withConnect: number }>;
  ambassadors: number;
  referredSpecialists: number;
  ambassadorAccruals?: Record<string, { count: number; totalCents: number }>;
  recentBookings: Array<Record<string, unknown>>;
};

export type AdminBooking = {
  _id: string;
  status: string;
  scheduled_at: string;
  service_snapshot: { title: string; price_cents: number; currency: string };
  total_charge_cents?: number;
  service_fee_cents?: number;
  specialist_id?: { name?: string; kyc_status?: string };
  user_id?: { nickname?: string; email?: string };
  dispute_reason?: string;
  dispute_evidence_urls?: string[];
};

export const paymentsPageLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "overview";
  const page = url.searchParams.get("page") || "1";
  const status = url.searchParams.get("status") || "";

  const [overviewRes, bookingsRes, subscriptionsRes, ambassadorsRes, accrualsRes, specialistsRes] =
    await Promise.all([
      axiosAuth
        .get<{ data: PaymentsOverview }>("/api/v1/stats/payments/overview")
        .then((r) => r.data.data)
        .catch(() => null),
      tab === "bookings" || tab === "overview"
        ? axiosAuth
            .get<{ data: AdminBooking[]; total: number; page: number; limit: number }>(
              `/api/v1/stats/payments/bookings?page=${page}&limit=50${status ? `&status=${status}` : ""}`,
            )
            .then((r) => r.data)
            .catch(() => ({ data: [], total: 0, page: 1, limit: 50 }))
        : Promise.resolve({ data: [], total: 0, page: 1, limit: 50 }),
      tab === "subscriptions"
        ? axiosAuth
            .get<{ data: Record<string, unknown>[]; total: number }>(
              `/api/v1/stats/payments/subscriptions?page=${page}&limit=50`,
            )
            .then((r) => r.data)
            .catch(() => ({ data: [], total: 0 }))
        : Promise.resolve({ data: [], total: 0 }),
      axiosAuth
        .get<{
          data: {
            ambassadors: Array<Record<string, unknown>>;
            recruits: Array<Record<string, unknown>>;
          };
        }>("/api/v1/stats/payments/ambassadors")
        .then((r) => r.data.data)
        .catch(() => ({ ambassadors: [], recruits: [] })),
      tab === "accruals"
        ? axiosAuth
            .get<{ data: Record<string, unknown>[]; total: number }>(
              `/api/v1/stats/payments/ambassador-accruals?page=${page}&limit=50`,
            )
            .then((r) => r.data)
            .catch(() => ({ data: [], total: 0 }))
        : Promise.resolve({ data: [], total: 0 }),
      axiosAuth.get("/api/v1/specialists").then((r) => r.data?.data ?? []).catch(() => []),
    ]);

  return {
    tab,
    overview: overviewRes,
    bookings: bookingsRes,
    subscriptions: subscriptionsRes,
    ambassadors: ambassadorsRes,
    accruals: accrualsRes,
    specialists: specialistsRes,
  };
};
