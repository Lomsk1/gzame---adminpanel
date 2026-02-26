import type { ActionFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type SpecialistActionResponse = { success: boolean; message?: string; error?: string };

export const specialistsAction = async ({ request }: ActionFunctionArgs): Promise<SpecialistActionResponse> => {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string | null;

  try {
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

    if (intent === "create") {
      await axiosAuth.post("/api/v1/specialists", body);
      return { success: true, message: "Specialist created." };
    }
    if (intent === "update" && id) {
      await axiosAuth.patch(`/api/v1/specialists/${id}`, body);
      return { success: true, message: "Specialist updated." };
    }

    return { success: false, error: "Unknown intent." };
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : "Request failed.";
    return { success: false, error: message };
  }
};
