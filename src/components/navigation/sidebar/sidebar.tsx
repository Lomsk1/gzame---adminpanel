import { NavLink, useLocation } from "react-router";
import { PanelLeftClose, X } from "lucide-react";
import { ADMIN_NAV_GROUPS, NAV_EXACT_MATCH } from "../../admin/admin-nav-config";
import { AdminLanguageSwitcher } from "../../admin/admin-language-switcher";
import { useAdminT } from "../../../store/locale/locale";
import { useSidebarStore } from "../../../store/ui/sidebar";

export default function MainSidebar() {
  const { t } = useAdminT();
  const location = useLocation();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  const closeMobile = () => setMobileOpen(false);

  const aside = (
    <aside
      className={`h-full bg-admin-panel border-r border-admin-border flex flex-col shrink-0 transition-[width] duration-200 ease-out ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div
        className={`h-16 flex items-center border-b border-admin-border shrink-0 gap-1 ${
          collapsed ? "flex-col justify-center py-2 px-1" : "px-3"
        }`}
      >
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg bg-admin-primary/15 border border-admin-primary/30 text-admin-primary hover:bg-admin-primary/25 transition-colors"
              aria-label="Expand sidebar"
              title={t("app.name")}
            >
              <span className="text-xs font-bold font-mono">G</span>
            </button>
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-dim hover:text-admin-text hover:bg-admin-card"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center min-w-0 flex-1 gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-primary/15 border border-admin-primary/30">
                <span className="text-xs font-bold text-admin-primary font-mono">G</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-base font-semibold tracking-tight text-admin-text truncate">
                  {t("app.name")}
                </span>
                <p className="text-[11px] text-admin-text-muted tracking-wide">{t("app.admin")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-dim hover:text-admin-text hover:bg-admin-card border border-transparent hover:border-admin-border transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-dim hover:text-admin-text hover:bg-admin-card"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 custom-scrollbar">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="space-y-0.5">
            {!collapsed ? (
              <h3 className="px-3 mb-1.5 text-[11px] font-medium text-admin-text-muted tracking-wide uppercase">
                {t(group.labelKey)}
              </h3>
            ) : (
              <div className="mx-auto mb-1 h-px w-6 bg-admin-border" />
            )}
            {group.links.map((link) => {
              const Icon = link.icon;
              const exact = NAV_EXACT_MATCH.has(link.to);
              const isActive = exact
                ? location.pathname === link.to
                : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={exact}
                  title={collapsed ? t(link.labelKey) : undefined}
                  onClick={closeMobile}
                  className={`admin-nav-link group relative flex items-center gap-3 rounded-lg text-sm border transition-colors ${
                    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-admin-primary/10 text-admin-primary border-admin-primary/25 font-medium"
                      : "text-admin-text-dim hover:text-admin-text hover:bg-admin-card/80 border-transparent"
                  }`}
                >
                  {isActive && !collapsed ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-admin-primary" />
                  ) : null}
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`} />
                  {!collapsed ? <span className="truncate">{t(link.labelKey)}</span> : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="p-3 border-t border-admin-border/70">
          <AdminLanguageSwitcher />
        </div>
      ) : null}
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">{aside}</div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex admin-overlay-in">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu backdrop"
            onClick={closeMobile}
          />
          <div className="relative h-full w-60 admin-drawer-in shadow-[var(--shadow-admin-lg)]">
            {/* Force expanded labels in mobile drawer */}
            <MobileSidebarForceExpanded onClose={closeMobile} />
          </div>
        </div>
      ) : null}
    </>
  );
}

function MobileSidebarForceExpanded({ onClose }: { onClose: () => void }) {
  const { t } = useAdminT();
  const location = useLocation();

  return (
    <aside className="h-full w-60 bg-admin-panel border-r border-admin-border flex flex-col">
      <div className="h-16 flex items-center justify-between px-3 border-b border-admin-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-primary/15 border border-admin-primary/30">
            <span className="text-xs font-bold text-admin-primary font-mono">G</span>
          </div>
          <div className="min-w-0">
            <span className="block text-base font-semibold tracking-tight text-admin-text truncate">
              {t("app.name")}
            </span>
            <p className="text-[11px] text-admin-text-muted tracking-wide">{t("app.admin")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-dim hover:text-admin-text hover:bg-admin-card"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 custom-scrollbar">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="space-y-0.5">
            <h3 className="px-3 mb-1.5 text-[11px] font-medium text-admin-text-muted tracking-wide uppercase">
              {t(group.labelKey)}
            </h3>
            {group.links.map((link) => {
              const Icon = link.icon;
              const exact = NAV_EXACT_MATCH.has(link.to);
              const isActive = exact
                ? location.pathname === link.to
                : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={exact}
                  onClick={onClose}
                  className={`admin-nav-link relative flex items-center gap-3 rounded-lg text-sm border px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-admin-primary/10 text-admin-primary border-admin-primary/25 font-medium"
                      : "text-admin-text-dim hover:text-admin-text hover:bg-admin-card/80 border-transparent"
                  }`}
                >
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-admin-primary" />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(link.labelKey)}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-admin-border/70">
        <AdminLanguageSwitcher />
      </div>
    </aside>
  );
}
