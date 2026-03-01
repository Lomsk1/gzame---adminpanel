import type { ActionFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type CategoryActionResponse = { success: boolean; message?: string; error?: string };

export const categoriesAction = async ({ request }: ActionFunctionArgs): Promise<CategoryActionResponse> => {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string | null;

  try {
    if (intent === "delete" && id) {
      await axiosAuth.delete(`/api/v1/specialists/categories/${id}`);
      return { success: true, message: "Category deleted." };
    }

    const payloadRaw = formData.get("payload") as string;
    if (!payloadRaw) return { success: false, error: "Missing payload." };
    const payload = JSON.parse(payloadRaw) as { title: { en: string; ka: string; ru?: string } };

    if (intent === "create") {
      await axiosAuth.post("/api/v1/specialists/categories", payload);
      return { success: true, message: "Category created." };
    }
    if (intent === "update" && id) {
      await axiosAuth.patch(`/api/v1/specialists/categories/${id}`, payload);
      return { success: true, message: "Category updated." };
    }

    return { success: false, error: "Unknown intent." };
  } catch (err: unknown) {
    const message = err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : "Request failed.";
    return { success: false, error: message };
  }
};
