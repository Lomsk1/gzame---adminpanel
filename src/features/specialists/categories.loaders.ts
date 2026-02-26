import axiosAuth from "../../helper/axios";
import type { SpecialistCategoryListResponse } from "../../types/specialist/specialist";

export const categoriesLoader = async () => {
  const data = await axiosAuth
    .get<SpecialistCategoryListResponse>("/api/v1/specialists/categories")
    .then((res) => res.data);
  return { categoriesData: data };
};
