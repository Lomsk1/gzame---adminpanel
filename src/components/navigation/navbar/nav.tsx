import { AdminLanguageSwitcher } from "../../admin/admin-language-switcher";
import useUserStore from "../../../store/user/user";
import { useAdminT } from "../../../store/locale/locale";

export default function NavBarMain() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const { t } = useAdminT();

  return (
    <header className="h-20 bg-admin-panel/50 backdrop-blur-md border-b border-admin-border flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 admin-fade-in">
      <h2 className="text-sm font-medium text-admin-text-dim">
        {t("layout.systemStatus")}:{" "}
        <span className="text-admin-success font-semibold">{t("layout.online")}</span>
      </h2>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:block">
          <AdminLanguageSwitcher compact />
        </div>

        <div className="text-right hidden md:block">
          <p className="text-sm font-bold leading-none">{user?.nickname}</p>
          <p className="text-[10px] text-admin-primary uppercase tracking-widest">{user?.role}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-3 py-2 bg-admin-card border border-admin-border rounded-lg hover:border-admin-error transition-colors group cursor-pointer admin-nav-link"
        >
          <span className="text-xs font-semibold group-hover:text-admin-error transition-colors">
            {t("layout.logout")}
          </span>
        </button>
      </div>
    </header>
  );
}
