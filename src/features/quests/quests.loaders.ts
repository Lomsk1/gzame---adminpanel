import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { QuestsTypes } from "../../types/quests/quest";

export const questsLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "20";

  const is_foundational = url.searchParams.get("is_foundational") || undefined;

  const questPromise = axiosAuth
    .get<QuestsTypes>(
      `/api/v1/quest/data?page=${page}&limit=${limit}${
        is_foundational &&
        is_foundational !== "all" &&
        `&is_foundational=${is_foundational}`
      }`
    )
    .then((res) => res.data);

  return {
    questsData: questPromise,
  };
};
