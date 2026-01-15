import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { StatsUserTypes } from "../../types/stats/user";
import type { UsersDataType } from "../../types/user/user";

export const userStatsLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  // Return promises directly for independent streaming
  return {
    /* Stats */
    userStatsData: axiosAuth
      .get<StatsUserTypes>("/api/v1/stats/users")
      .then((res) => res.data.data),

    /* Users */
    usersData: axiosAuth
      .get<UsersDataType>(`/api/v1/auth/users/get-all`, {
        params: {
          email: email || undefined,
          limit: email ? 999 : 50,
          role: "user",
        },
      })
      .then((res) => res.data),
    initialEmail: email,
  };
};
