export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
};

import type { ActionFunctionArgs } from "react-router";
// actions.ts
import axiosAuth from "../../helper/axios";

export const levelConfigActions = async ({
  request,
}: ActionFunctionArgs): Promise<ActionResponse> => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  try {
    const payload = {
      level: Number(formData.get("level")),
      exp_required: Number(formData.get("exp_required")),
      is_active: formData.get("is_active") === "true",
      rewards: {
        energy_bonus: Number(formData.get("energy_bonus")),
      },
    };

    if (intent === "delete") {
      await axiosAuth.delete(`/api/v1/level-config/${id}`);
      return { success: true, message: "NODE_PURGED_SUCCESSFULLY" };
    }

    if (intent === "toggle") {
      await axiosAuth.patch(`/api/v1/level-config/${id}`, {
        is_active: formData.get("is_active") === "true",
      });
      return { success: true, message: "NODE_STATUS_TOGGLED" };
    }

    if (intent === "create") {
      await axiosAuth.post("/api/v1/level-config", payload);
      return { success: true, message: "NEW_NODE_INITIALIZED" };
    }

    if (intent === "update") {
      await axiosAuth.patch(`/api/v1/level-config/${id}`, payload);
      return { success: true, message: "NODE_CONFIG_UPDATED" };
    }

    return { success: false, error: "UNKNOWN_INTENT_PROTOCOL" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || "SYSTEM_KERNAL_ERROR",
    };
  }
};
