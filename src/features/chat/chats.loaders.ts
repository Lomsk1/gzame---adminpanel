import axiosAuth from "../../helper/axios";
import type { RoomsTypes } from "../../types/chat/chat";
import type { ChatMessage } from "../../types/chat/chat";

export const chatsRoomsLoader = async () => {
  const roomsPromise = axiosAuth
    .get<RoomsTypes>(`/api/v1/rooms/admin/data`)
    .then((res) => res.data);

  return {
    roomsData: roomsPromise,
  };
};

/** Delete a room and all its messages (admin only). */
export async function deleteRoom(roomId: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/rooms/admin/room/${roomId}`);
}

const ROOM_MESSAGES_LIMIT = 30;

/** Get older messages for a room (paginated; before = messageId of oldest message we have). */
export async function getRoomMessages(
  roomId: string,
  options?: { limit?: number; before?: string }
): Promise<{ data: ChatMessage[]; hasMore?: boolean }> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? ROOM_MESSAGES_LIMIT));
  if (options?.before) params.set("before", options.before);
  const res = await axiosAuth.get(
    `/api/v1/rooms/${roomId}/messages?${params.toString()}`
  );
  const data = res.data?.data ?? res.data ?? [];
  const list = Array.isArray(data) ? data : [];
  const limit = options?.limit ?? ROOM_MESSAGES_LIMIT;
  return {
    data: list,
    hasMore: list.length >= limit,
  };
}
