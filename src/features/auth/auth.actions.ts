import { redirect } from "react-router";
import { axiosPublic } from "../../helper/axios";
import useUserStore from "../../store/user/user";
import axios from "axios";
import type { UserDataType } from "../../types/user/user";
import {
  markAuthBootstrap,
  writeStoredToken,
} from "./auth.storage";

function parseSignInResponse(data: unknown): { token: string; user: UserDataType } | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token : null;
  const user = body.user;
  if (!token || !user || typeof user !== "object") return null;
  return { token, user: user as UserDataType };
}

export const loginAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const login = formData.get("login");
  const password = formData.get("password");

  try {
    const res = await axiosPublic.post("/api/v1/auth/signin", {
      login,
      password,
    });

    const parsed = parseSignInResponse(res.data);
    if (!parsed) {
      return { error: "Unexpected server response. Please try again." };
    }

    const { token, user } = parsed;

    if (user.role !== "admin") {
      return { error: "Access denied. Admin privileges required." };
    }

    writeStoredToken(token);
    markAuthBootstrap();
    useUserStore.setState({ user, token });

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
