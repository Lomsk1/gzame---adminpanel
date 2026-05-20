import type { ActionFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";
import type { WikiCategory } from "../../types/wiki/wiki";

export type WikiActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function wikiPageAction({
  request,
}: ActionFunctionArgs): Promise<WikiActionResponse> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string | null;

  try {
    if (intent === "delete" && id) {
      await axiosAuth.delete(`/api/v1/wiki/${id}`);
      return { success: true, message: "Wiki entry deleted." };
    }

    if (intent === "reembed" && id) {
      await axiosAuth.post(`/api/v1/wiki/${id}/reembed`);
      return { success: true, message: "Re-embedded successfully." };
    }

    const payloadRaw = formData.get("payload") as string;
    if (!payloadRaw) return { success: false, error: "Missing payload." };

    const payload = JSON.parse(payloadRaw) as {
      title: string;
      body: string;
      category: WikiCategory;
      tags: string[];
      slug?: string;
      is_active: boolean;
    };

    const body = {
      title: payload.title,
      body: payload.body,
      category: payload.category,
      tags: payload.tags ?? [],
      slug: payload.slug,
      is_active: payload.is_active !== false,
    };

    if (intent === "create") {
      await axiosAuth.post("/api/v1/wiki", body);
      return { success: true, message: "Wiki entry created." };
    }
    if (intent === "update" && id) {
      await axiosAuth.patch(`/api/v1/wiki/${id}`, body);
      return { success: true, message: "Wiki entry updated." };
    }

    return { success: false, error: "Unknown intent." };
  } catch (err: unknown) {
    const message =
      err &&
      typeof err === "object" &&
      "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
        : "Request failed.";
    return { success: false, error: message };
  }
}
