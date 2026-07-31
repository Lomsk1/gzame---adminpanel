import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type AppVersionConfigPayload = {
  enabled: boolean;
  minVersion: string;
  minBuildNumber: number;
  forceUpdate: boolean;
  storeUrlAndroid: string;
  storeUrlIos: string;
  title: string;
  message: string;
  updatedAt: string | null;
};

const EMPTY: AppVersionConfigPayload = {
  enabled: false,
  minVersion: "1.0.0",
  minBuildNumber: 0,
  forceUpdate: true,
  storeUrlAndroid: "https://play.google.com/store/apps/details?id=com.gzame.app",
  storeUrlIos: "",
  title: "",
  message: "",
  updatedAt: null,
};

export const appVersionPageLoader = async (_args: LoaderFunctionArgs) => {
  const res = await axiosAuth
    .get<{ status?: string; data?: AppVersionConfigPayload }>("/api/v1/app-version/admin")
    .then((r) => r.data)
    .catch(() => ({ data: null as AppVersionConfigPayload | null }));

  return { config: res.data ?? EMPTY };
};
