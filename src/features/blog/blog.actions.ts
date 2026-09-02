import type { ActionFunctionArgs } from "react-router";
import { deleteBlogPost } from "./blog.client";

export type BlogActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

/** Route action — delete only. Create/update with cover files use blog.client.ts directly. */
export async function blogPageAction({
  request,
}: ActionFunctionArgs): Promise<BlogActionResponse> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string | null;

  if (intent === "delete" && id) {
    try {
      await deleteBlogPost(id);
      return { success: true, message: "Blog post deleted." };
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

  return { success: false, error: "Unknown intent." };
}
