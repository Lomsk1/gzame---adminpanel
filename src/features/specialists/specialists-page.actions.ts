import type { ActionFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import { axiosMultipartAuth } from "../../helper/axios";

export type SpecialistsPageActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

async function runAction(
  formData: FormData
): Promise<SpecialistsPageActionResponse> {
  const type = formData.get("type") as string;
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string | null;

  if (type === "category") {
    if (intent === "delete" && id) {
      await axiosAuth.delete(`/api/v1/specialists/categories/${id}`);
      return { success: true, message: "Category deleted." };
    }
    const payloadRaw = formData.get("payload") as string;
    if (!payloadRaw) return { success: false, error: "Missing payload." };
    const payload = JSON.parse(payloadRaw) as { title: { en: string; ka: string; ru?: string; ja?: string } };
    if (intent === "create") {
      await axiosAuth.post("/api/v1/specialists/categories", payload);
      return { success: true, message: "Category created." };
    }
    if (intent === "update" && id) {
      await axiosAuth.patch(`/api/v1/specialists/categories/${id}`, payload);
      return { success: true, message: "Category updated." };
    }
  }

  if (type === "specialist") {
    if (intent === "delete" && id) {
      await axiosAuth.delete(`/api/v1/specialists/${id}`);
      return { success: true, message: "Specialist deleted." };
    }
    const payloadRaw = formData.get("payload") as string;
    if (!payloadRaw) return { success: false, error: "Missing payload." };
    const payload = JSON.parse(payloadRaw) as {
      avatar?: string;
      name: string;
      bio: string;
      categoryIds: string[];
      link: string;
      booking: string;
      order: number;
      tags: string[];
      specialty: string;
      isActive: boolean;
    };
    const body = {
      avatar: payload.avatar || undefined,
      name: payload.name,
      bio: payload.bio,
      categories: payload.categoryIds,
      link: payload.link,
      booking: payload.booking,
      order: payload.order ?? 0,
      tags: payload.tags ?? [],
      specialty: payload.specialty || undefined,
      isActive: payload.isActive !== false,
    };
    let specialistId: string | null = id;
    if (intent === "create") {
      const res = await axiosAuth.post<{ data?: { _id?: string }; _id?: string }>("/api/v1/specialists", body);
      const created = res.data?.data ?? res.data;
      specialistId = (created && typeof created === "object" && "_id" in created ? (created as { _id: string })._id : null) ?? null;
      if (!specialistId) return { success: true, message: "Specialist created." };
    } else if (intent === "update" && id) {
      await axiosAuth.patch(`/api/v1/specialists/${id}`, body);
    }
    const avatarFile = formData.get("avatar");
    if (specialistId && avatarFile instanceof File && avatarFile.size > 0) {
      const uploadForm = new FormData();
      uploadForm.append("avatar", avatarFile);
      await axiosMultipartAuth.patch(`/api/v1/specialists/${specialistId}/avatar`, uploadForm);
    }
    if (intent === "create") return { success: true, message: "Specialist created." };
    if (intent === "update") return { success: true, message: "Specialist updated." };
  }

  return { success: false, error: "Unknown type or intent." };
}

export async function specialistsPageAction(
  args: ActionFunctionArgs
): Promise<SpecialistsPageActionResponse> {
  const formData = await args.request.formData();
  const result = await runAction(formData).catch((err) => {
    const axErr = err as { response?: { data?: { message?: string } } };
    const message =
      axErr?.response?.data?.message != null
        ? axErr.response.data.message
        : "Request failed.";
    return { success: false, error: message };
  });
  return result;
}
