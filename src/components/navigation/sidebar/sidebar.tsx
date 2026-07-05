import { NavLink } from "react-router";
import { ADMIN_NAV_GROUPS, NAV_EXACT_MATCH } from "../../admin/admin-nav-config";
import { AdminLanguageSwitcher } from "../../admin/admin-language-switcher";
import { useAdminT } from "../../../store/locale/locale";

export default function MainSidebar() {
  const { t } = useAdminT();

  return (
    <aside className="w-64 h-screen bg-admin-panel border-r border-admin-border flex flex-col sticky top-0 shrink-0 admin-slide-in-right">
      <div className="h-20 flex items-center px-6 border-b border-admin-border">
        <div className="w-8 h-8 bg-admin-primary rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.4)] admin-scale-in" />
        <div>
          <span className="text-lg font-black tracking-tighter text-admin-text">{t("app.name")}</span>
          <p className="text-[9px] text-admin-text-dim uppercase tracking-widest">{t("app.admin")}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-7 custom-scrollbar">
        {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.labelKey} className="space-y-1 admin-fade-up" style={{ animationDelay: `${groupIndex * 40}ms` }}>
            <h3 className="px-3 mb-2 text-[10px] font-semibold text-admin-text-dim uppercase tracking-widest">
              {t(group.labelKey)}
            </h3>
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={NAV_EXACT_MATCH.has(link.to)}
                  className={({ isActive }) =>
                    `admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border ${
                      isActive
                        ? "admin-nav-link-active bg-admin-primary/15 text-admin-primary border-admin-primary/40 font-semibold shadow-[inset_3px_0_0_0_rgb(59,130,246)]"
                        : "text-admin-text-dim hover:text-admin-text hover:bg-admin-card/80 border-transparent hover:border-admin-border"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-70"}`}
                      />
                      <span className="truncate">{t(link.labelKey)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-admin-border/60">
        <AdminLanguageSwitcher />
      </div>
    </aside>
  );
}
