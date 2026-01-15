import type { ActionFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const questionsAction = async ({
  request,
}: ActionFunctionArgs): Promise<ActionResponse> => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  try {
    if (intent === "delete") {
      await axiosAuth.delete(`/api/v1/question/data/${id}`);
      return { success: true, message: "NODE_PURGED_SUCCESSFULLY" };
    }

    // Parse the stringified JSON payload from the Drawer
    const rawPayload = formData.get("payload") as string;
    const payload = JSON.parse(rawPayload);

    if (intent === "create") {
      await axiosAuth.post("/api/v1/question/data", payload);
      return { success: true, message: "NEW_NODE_INITIALIZED" };
    }

    if (intent === "update") {
      await axiosAuth.patch(`/api/v1/question/data/${id}`, payload);
      return { success: true, message: "NODE_RECALIBRATED" };
    }

    return { success: false, error: "UNKNOWN_INTENT" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || "SYSTEM_UPLINK_ERROR",
    };
  }
};
