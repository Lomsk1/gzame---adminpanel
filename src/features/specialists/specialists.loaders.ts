import axiosAuth from "../../helper/axios";
import type { SpecialistListResponse, SpecialistCategoryListResponse } from "../../types/specialist/specialist";

export const specialistsLoader = async () => {
  const data = await axiosAuth
    .get<SpecialistListResponse>("/api/v1/specialists")
    .then((res) => res.data);
  return { specialistsData: data };
};

/** Load both categories and specialists for the specialists management page */
export const specialistsPageLoader = async () => {
  const emptyCategories: SpecialistCategoryListResponse = { status: "success", data: [] };
  const emptySpecialists: SpecialistListResponse = { status: "success", data: [] };
  try {
    const [categoriesRes, specialistsRes] = await Promise.all([
      axiosAuth.get<SpecialistCategoryListResponse>("/api/v1/specialists/categories").then((r) => r.data).catch(() => emptyCategories),
      axiosAuth.get<SpecialistListResponse>("/api/v1/specialists?limit=500").then((r) => r.data).catch(() => emptySpecialists),
    ]);
    return {
      categoriesData: categoriesRes ?? emptyCategories,
      specialistsData: specialistsRes ?? emptySpecialists,
    };
  } catch {
    return { categoriesData: emptyCategories, specialistsData: emptySpecialists };
  }
};
