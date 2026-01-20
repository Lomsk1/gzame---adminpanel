import axiosAuth from "../../helper/axios";

export async function questAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = {
    title: { en: formData.get("title_en"), ka: formData.get("title_ka") },
    expReward: Number(formData.get("exp")),
    category: formData.get("category"),
    psychotype: formData.getAll("psychotypes"), // Multiselect
  };

  const res = await fetch("/api/admin/quests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function questTemplateAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  try {
    if (intent === "delete") {
      await axiosAuth.delete(`/api/v1/quest/data/${id}`);
      return { success: true, message: "NODE_PURGED_SUCCESSFULLY" };
    }

    // Parse the stringified JSON payload from the Drawer
    const rawPayload = formData.get("payload") as string;
    const payload = JSON.parse(rawPayload);

    if (intent === "create") {
      await axiosAuth.post("/api/v1/quest/data", payload);
      return { success: true, message: "NEW_NODE_INITIALIZED" };
    }

    if (intent === "update") {
      await axiosAuth.patch(`/api/v1/quest/data/${id}`, payload);
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
}
