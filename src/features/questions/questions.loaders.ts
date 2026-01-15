import axiosAuth from "../../helper/axios";
import type { QuestionsTypes } from "../../types/questions/questions";

export const questionsLoader = async () => {
  const questionsPromise = axiosAuth
    .get<QuestionsTypes>("/api/v1/question/data")
    .then((res) => res.data);

  return {
    questionsData: questionsPromise,
  };
};
