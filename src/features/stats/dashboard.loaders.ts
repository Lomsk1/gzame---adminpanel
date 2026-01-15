import axiosAuth from "../../helper/axios";
import type { DashboardAPIResponse } from "../../types/stats/dashboard";

export const dashboardLoader = async () => {
  const statsPromise = axiosAuth
    .get<DashboardAPIResponse>("/api/v1/stats/dashboard")
    .then((res) => res.data.data);

  return {
    dashboardData: statsPromise, // This is a Promise<DashboardStats>
  };
};