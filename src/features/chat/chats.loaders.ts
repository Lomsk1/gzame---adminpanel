import axiosAuth from "../../helper/axios";
import type { RoomsTypes } from "../../types/chat/chat";

export const chatsRoomsLoader = async () => {
  const roomsPromise = axiosAuth
    .get<RoomsTypes>(`/api/v1/rooms/admin/data`)
    .then((res) => res.data);

  return {
    roomsData: roomsPromise,
  };
};
