import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { EarlyAccessListResponse } from "../../types/early-access/early-access";

export const earlyAccessPageLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "50";
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  const earlyAccessData = await axiosAuth
    .get<EarlyAccessListResponse>(`/api/v1/early-access?${params.toString()}`)
    .then((r) => r.data)
    .catch(() => ({
      status: "success",
      data: [],
      total: 0,
      page: 1,
      limit: 50,
    }));

  return { earlyAccessData };
};
