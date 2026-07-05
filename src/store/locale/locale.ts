import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ADMIN_LOCALE,
  isAdminLocale,
  type AdminLocale,
} from "../../i18n/config";
import { translate, type AdminMessages } from "../../i18n/translations";

interface AdminLocaleState {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: keyof AdminMessages, params?: Record<string, string | number>) => string;
}

export const useAdminLocaleStore = create<AdminLocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_ADMIN_LOCALE,
      setLocale: (locale) => {
        set({
          locale,
          t: (key, params) => translate(locale, key, params),
        });
      },
      t: (key, params) => translate(get().locale, key, params),
    }),
    {
      name: "gzame-admin-locale",
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state && !isAdminLocale(state.locale)) {
          state.setLocale(DEFAULT_ADMIN_LOCALE);
        } else if (state) {
          state.setLocale(state.locale);
        }
      },
    },
  ),
);

export function useAdminT() {
  const locale = useAdminLocaleStore((s) => s.locale);
  const setLocale = useAdminLocaleStore((s) => s.setLocale);
  const t = useAdminLocaleStore((s) => s.t);
  return { locale, setLocale, t };
}
