import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserDataType } from "../../types/user/user";
import {
  clearStoredToken,
  readStoredToken,
  writeStoredToken,
} from "../../features/auth/auth.storage";

interface UserState {
  user: UserDataType | null;
  token: string | null;
  setUser: (user: UserDataType, token?: string) => void;
  updateUser: (user: UserDataType) => void;
  logout: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: readStoredToken(),

      setUser: (user, token) => {
        if (token) {
          writeStoredToken(token);
          set({ user, token });
        } else {
          set({ user });
        }
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        clearStoredToken();
        set({ user: null, token: null });
        localStorage.removeItem("admin-user-storage");
        window.location.href = "/login";
      },
    }),
    {
      name: "admin-user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

export default useUserStore;
