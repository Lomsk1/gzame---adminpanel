import { ADMIN_LOCALES, ADMIN_LOCALE_SHORT, type AdminLocale } from "../../i18n/config";
import { useAdminT } from "../../store/locale/locale";

export function AdminLanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useAdminT();

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-admin-border bg-admin-card/80 p-1"
      role="group"
      aria-label={t("layout.language")}
    >
      {ADMIN_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code as AdminLocale)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 ${
            locale === code
              ? "bg-admin-primary/20 text-admin-primary border border-admin-primary/35 shadow-sm"
              : "text-admin-text-dim hover:text-admin-text border border-transparent"
          }`}
          title={code}
        >
          {compact ? ADMIN_LOCALE_SHORT[code] : ADMIN_LOCALE_SHORT[code]}
        </button>
      ))}
    </div>
  );
}
