import axios from "axios";
import axiosAuth from "../../helper/axios";

export const geminiAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const text = formData.get("instruction");
  const instruction_id = formData.get("instruction_id");
  try {
    const res = await axiosAuth.patch(
      `/api/v1/gemini-instruction/${instruction_id}`,
      {
        text,
      }
    );

    const data = res.data;

    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error: err.response?.data?.message || "Sync failed",
      };
    }

    return { error: "Server connection failed. Please try again later." };
  }
};
