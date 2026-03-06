import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { BookingClicksResponse } from "../../types/specialist/booking-clicks";
import type { SpecialistListResponse } from "../../types/specialist/specialist";

export const bookingClicksPageLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "50";
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";
  const specialistId = url.searchParams.get("specialistId") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  if (specialistId) params.set("specialistId", specialistId);

  const [clicksRes, specialistsRes] = await Promise.all([
    axiosAuth
      .get<BookingClicksResponse>(`/api/v1/specialists/booking-clicks?${params.toString()}`)
      .then((r) => r.data)
      .catch(() => ({ status: "success", data: [], total: 0, page: 1, limit: 50 })),
    axiosAuth
      .get<SpecialistListResponse>("/api/v1/specialists")
      .then((r) => r.data)
      .catch(() => ({ status: "success", data: [] })),
  ]);

  return {
    bookingClicksData: clicksRes,
    specialistsData: specialistsRes?.data ?? [],
  };
};
