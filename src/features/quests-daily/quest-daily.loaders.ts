import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { QuestDailyTypes } from "../../types/quests/daily";

export const questsDailyLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "200";

  const is_foundational = url.searchParams.get("is_foundational") || undefined;

  const questsDailyPromise = axiosAuth
    .get<QuestDailyTypes>(
      `/api/v1/quest/complete/daily?page=${page}&limit=${limit}${
        is_foundational &&
        is_foundational !== "all" &&
        `&is_foundational=${is_foundational}`
      }`
    )
    .then((res) => res.data);

  return {
    activeQuests: questsDailyPromise,
  };
};
