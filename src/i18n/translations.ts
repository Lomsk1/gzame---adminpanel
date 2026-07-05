import type { AdminLocale } from "./config";
import { DEFAULT_ADMIN_LOCALE } from "./config";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import ka from "./locales/ka.json";

export type AdminMessages = typeof en;

const catalogs: Record<AdminLocale, AdminMessages> = { en, ru, ka };

export function getAdminMessages(locale: AdminLocale): AdminMessages {
  return catalogs[locale] ?? catalogs[DEFAULT_ADMIN_LOCALE];
}

export function translate(
  locale: AdminLocale,
  key: keyof AdminMessages,
  params?: Record<string, string | number>,
): string {
  const messages = getAdminMessages(locale);
  const fallback = getAdminMessages(DEFAULT_ADMIN_LOCALE);
  let text = messages[key] ?? fallback[key] ?? String(key);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    }
  }
  return text;
}
