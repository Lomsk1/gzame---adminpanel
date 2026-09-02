import axiosAuth from "../../helper/axios";
import type { BlogListResponse } from "../../types/blog/blog";

export async function blogPageLoader() {
  const res = await axiosAuth.get<BlogListResponse>("/api/v1/blog/all");
  return { posts: res.data.data ?? [] };
}
