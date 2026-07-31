import { Menu, LogOut } from "lucide-react";
import { useLocation } from "react-router";
import { AdminLanguageSwitcher } from "../../admin/admin-language-switcher";
import { ADMIN_NAV_GROUPS } from "../../admin/admin-nav-config";
import useUserStore from "../../../store/user/user";
import { useAdminT } from "../../../store/locale/locale";
import { useSidebarStore } from "../../../store/ui/sidebar";
import type { AdminMessages } from "../../../i18n/translations";

function resolvePageTitle(
  pathname: string,
  t: (key: keyof AdminMessages) => string
): string {
  const allLinks = ADMIN_NAV_GROUPS.flatMap((g) => g.links);
  const exact = allLinks.find((l) => l.to === pathname);
  if (exact) return t(exact.labelKey);

  const prefix = allLinks
    .filter((l) => l.to !== "/" && pathname.startsWith(l.to))
    .sort((a, b) => b.to.length - a.to.length)[0];
  if (prefix) return t(prefix.labelKey);

  return t("nav.dashboard");
}

export default function NavBarMain() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const { t } = useAdminT();
  const location = useLocation();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const pageTitle = resolvePageTitle(location.pathname, t);

  return (
    <header className="h-16 admin-surface-panel border-b border-admin-border flex items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-admin-card text-admin-text-dim hover:text-admin-text transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-admin-card text-admin-text-dim hover:text-admin-text transition-colors"
            aria-label="Expand sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] text-admin-text-muted tracking-wide uppercase truncate">
            {t("layout.systemStatus")}:{" "}
            <span className="text-admin-success font-medium normal-case tracking-normal">
              {t("layout.online")}
            </span>
          </p>
          <h2 className="text-sm font-semibold text-admin-text truncate">{pageTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden sm:block">
          <AdminLanguageSwitcher compact />
        </div>

        <div className="text-right hidden md:block border-l border-admin-border pl-3">
          <p className="text-sm font-medium leading-none text-admin-text">{user?.nickname}</p>
          <p className="text-[11px] text-admin-primary font-mono mt-1 uppercase tracking-wider">
            {user?.role}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-3 py-2 bg-admin-card border border-admin-border rounded-lg hover:border-admin-error/60 hover:text-admin-error transition-colors cursor-pointer text-admin-text-dim"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold hidden sm:inline">{t("layout.logout")}</span>
        </button>
      </div>
    </header>
  );
}
