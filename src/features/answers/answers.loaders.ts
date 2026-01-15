import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { AnswersTypes } from "../../types/answer/answer";

export const answersLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "20";

  const user_id = url.searchParams.get("user_id") || "";

  const answerPromise = axiosAuth
    .get<AnswersTypes>(
      `/api/v1/answer?page=${page}&limit=${limit}${
        user_id && `&user_id=${user_id}`
      }`
    )
    .then((res) => res.data);

  return {
    answersData: answerPromise,
  };
};
