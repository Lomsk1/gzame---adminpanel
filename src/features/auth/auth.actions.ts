import { redirect } from "react-router";
import { axiosPublic } from "../../helper/axios";
import useUserStore from "../../store/user/user";
import axios from "axios";
import type { UserDataType } from "../../types/user/user";

export const loginAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const login = formData.get("login");
  const password = formData.get("password");

  try {
    const res = await axiosPublic.post("/api/v1/auth/signin", {
      login,
      password,
    });
    const { token, user }: { token: string; user: UserDataType } = res.data;

    if (user?.role !== "admin") {
      useUserStore.getState().logout();
      return { error: "Access denied. Admin privileges required." };
    }

    useUserStore.getState().setUser(user, token);

    return redirect("/");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error: err.response?.data?.message || "Invalid login or password",
      };
    }

    return { error: "Server connection failed. Please try again later." };
  }
};
