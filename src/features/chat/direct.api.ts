import axiosAuth from "../../helper/axios";

export interface DirectMessagePayload {
  _id: string;
  content: string;
  user_id: { _id: string; nickname?: string; avatar_url?: string };
  created_at: string;
}

export interface DirectConversationPayload {
  _id: string;
  participants: Array<{ _id: string; nickname?: string; avatar_url?: string }>;
}

export interface DirectConversationListItem {
  _id: string;
  participants: Array<{ _id: string; nickname?: string; avatar_url?: string }>;
  other_user?: { _id: string; nickname?: string; avatar_url?: string };
  unread_count: number;
  last_message?: { content?: string; created_at?: string };
  last_message_preview?: string;
  last_message_at?: string;
  message_count?: number;
}

/** Get all direct conversations for the current user. */
export async function getDirectConversations(): Promise<{
  data: DirectConversationListItem[];
}> {
  const res = await axiosAuth.get("/api/v1/direct/conversations");
  return res.data;
}

export async function getAdminDirectConversations(): Promise<{
  data: DirectConversationListItem[];
}> {
  const res = await axiosAuth.get("/api/v1/direct/admin/conversations");
  return res.data;
}

/** Get or create a direct conversation with another user. */
export async function getOrCreateDirectConversation(
  userId: string
): Promise<{ data: DirectConversationPayload }> {
  const res = await axiosAuth.get(`/api/v1/direct/conversations/with/${userId}`);
  return res.data;
}

const DEFAULT_MESSAGE_LIMIT = 30;

/** Get messages for a direct conversation (newest first by default; use before for older). */
export async function getDirectMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<{ data: DirectMessagePayload[]; hasMore?: boolean }> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? DEFAULT_MESSAGE_LIMIT));
  if (options?.before) params.set("before", options.before);
  const res = await axiosAuth.get(
    `/api/v1/direct/conversations/${conversationId}/messages?${params.toString()}`
  );
  const raw = res.data?.data ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  const limit = options?.limit ?? DEFAULT_MESSAGE_LIMIT;
  return {
    data: list,
    hasMore: list.length >= limit,
  };
}

export async function getAdminDirectMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<{ data: DirectMessagePayload[]; hasMore?: boolean }> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? DEFAULT_MESSAGE_LIMIT));
  if (options?.before) params.set("before", options.before);
  const res = await axiosAuth.get(
    `/api/v1/direct/admin/conversations/${conversationId}/messages?${params.toString()}`
  );
  const raw = res.data?.data ?? res.data;
  const list = Array.isArray(raw) ? raw : [];
  const limit = options?.limit ?? DEFAULT_MESSAGE_LIMIT;
  return {
    data: list,
    hasMore: list.length >= limit,
  };
}

/** Send a direct message. */
export async function sendDirectMessage(
  conversationId: string,
  content: string
): Promise<{ data: DirectMessagePayload }> {
  const res = await axiosAuth.post(
    `/api/v1/direct/conversations/${conversationId}/messages`,
    { content }
  );
  return res.data;
}

export async function adminDeleteDirectConversation(conversationId: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/direct/admin/conversations/${conversationId}`);
}

export async function adminDeleteDirectMessage(messageId: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/direct/admin/messages/${messageId}`);
}
