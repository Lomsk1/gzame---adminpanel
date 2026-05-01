import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type AndroidApkReleasePayload = {
  downloadUrl: string;
  versionLabel: string;
  fileName: string;
  updatedAt: string;
} | null;

export const cloudPageLoader = async (_args: LoaderFunctionArgs) => {
  const res = await axiosAuth
    .get<{ status?: string; data?: AndroidApkReleasePayload }>("/api/v1/android-apk")
    .then((r) => r.data)
    .catch(() => ({ data: null as AndroidApkReleasePayload }));

  return { release: res.data ?? null };
};
