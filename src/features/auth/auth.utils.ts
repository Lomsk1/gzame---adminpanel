import Cookies from "js-cookie";
import { redirect } from "react-router";
import axiosAuth from "../../helper/axios";
import useUserStore from "../../store/user/user";
import type { UserTypes } from "../../types/user/user";

export const requireAdmin = async () => {
  const token = Cookies.get("auth_token");
  if (!token) throw redirect("/login");

  const existingUser = useUserStore.getState().user;

  if (existingUser && existingUser.role === "admin") {
    return existingUser;
  }

  try {
    const res = await axiosAuth.get("/api/v1/auth/check");
    const user: UserTypes = res.data;

    if (user.status !== "success" || user.data?.role !== "admin") {
      useUserStore.getState().logout();
      throw redirect("/login");
    }

    // 4. Sync Store
    useUserStore.getState().setUser(user.data, token);
    return user;
  } catch (err) {
    console.error("Auth Loader Error:", err);
    useUserStore.getState().logout();
    throw redirect("/login");
  }
};
