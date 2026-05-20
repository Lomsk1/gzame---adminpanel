import axiosAuth from "../../helper/axios";
import type { WikiListResponse } from "../../types/wiki/wiki";

export async function wikiPageLoader() {
  const res = await axiosAuth.get<WikiListResponse>("/api/v1/wiki");
  return { entries: res.data.data ?? [] };
}
