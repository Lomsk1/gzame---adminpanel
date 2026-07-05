export const ADMIN_LOCALES = ["en", "ru", "ka"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "en";

export const ADMIN_LOCALE_LABELS: Record<AdminLocale, string> = {
  en: "English",
  ru: "Русский",
  ka: "ქართული",
};

export const ADMIN_LOCALE_SHORT: Record<AdminLocale, string> = {
  en: "EN",
  ru: "RU",
  ka: "KA",
};

export function isAdminLocale(value: string): value is AdminLocale {
  return (ADMIN_LOCALES as readonly string[]).includes(value);
}
