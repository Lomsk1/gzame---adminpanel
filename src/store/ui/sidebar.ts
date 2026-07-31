import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
  toggleMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (value) => set({ collapsed: value }),
      setMobileOpen: (value) => set({ mobileOpen: value }),
      toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
    }),
    {
      name: "admin-sidebar-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
);
