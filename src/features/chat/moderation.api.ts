import axiosAuth from "../../helper/axios";

export interface ChatBlockedUserItem {
  _id: string;
  user_id: { _id: string; nickname?: string; email?: string; avatar_url?: string };
  reason?: string;
  updated_at: string;
}

export interface ChatBlockedWordItem {
  _id: string;
  word: string;
  normalized_word: string;
  is_active: boolean;
  updated_at: string;
}

export async function getChatBlockedUsers(): Promise<{ data: ChatBlockedUserItem[] }> {
  const res = await axiosAuth.get("/api/v1/rooms/admin/chat-blocked-users");
  return res.data;
}

export async function adminBlockUserFromChat(userId: string, reason?: string): Promise<void> {
  await axiosAuth.post(`/api/v1/rooms/admin/chat-blocked-users/${userId}`, { reason });
}

export async function adminUnblockUserFromChat(userId: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/rooms/admin/chat-blocked-users/${userId}`);
}

export async function getBlockedWords(): Promise<{ data: ChatBlockedWordItem[] }> {
  const res = await axiosAuth.get("/api/v1/rooms/admin/blocked-words");
  return res.data;
}

export async function addBlockedWord(word: string): Promise<void> {
  await axiosAuth.post("/api/v1/rooms/admin/blocked-words", { word });
}

export async function deleteBlockedWord(wordId: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/rooms/admin/blocked-words/${wordId}`);
}
