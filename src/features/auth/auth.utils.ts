import { redirect } from "react-router";
import axiosAuth from "../../helper/axios";
import useUserStore from "../../store/user/user";
import type { UserTypes } from "../../types/user/user";
import {
  clearStoredToken,
  consumeAuthBootstrap,
  isRouterRedirect,
  readStoredToken,
  writeStoredToken,
} from "./auth.storage";

export const requireAdmin = async () => {
  const token = readStoredToken() || useUserStore.getState().token;
  if (!token) throw redirect("/login");

  const storeUser = useUserStore.getState().user;

  // Fresh login: trust the session we just wrote; skip /auth/check race.
  if (consumeAuthBootstrap() && storeUser?.role === "admin") {
    return storeUser;
  }

  if (storeUser?.role === "admin") {
    return storeUser;
  }

  try {
    const res = await axiosAuth.get("/api/v1/auth/check");
    const payload = res.data as UserTypes & { token?: string };

    if (payload.status !== "success" || payload.data?.role !== "admin") {
      clearStoredToken();
      useUserStore.setState({ user: null, token: null });
      throw redirect("/login");
    }

    const nextToken = payload.token ?? token;
    writeStoredToken(nextToken);
    useUserStore.setState({ user: payload.data, token: nextToken });
    return payload.data;
  } catch (err) {
    if (isRouterRedirect(err)) throw err;
    console.error("Auth Loader Error:", err);
    clearStoredToken();
    useUserStore.setState({ user: null, token: null });
    throw redirect("/login");
  }
};
