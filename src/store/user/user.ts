import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { UserDataType } from "../../types/user/user";

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
      token: Cookies.get("auth_token") || null,

      setUser: (user, token) => {
        if (token) {
          Cookies.set("auth_token", token, {
            secure: true,
            sameSite: "strict",
            expires: 7,
          });
          set({ user, token });
        } else {
          set({ user });
        }
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        Cookies.remove("auth_token");
        set({ user: null, token: null });

        localStorage.clear();

        window.location.href = "/login";
      },
    }),
    {
      name: "admin-user-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useUserStore;
