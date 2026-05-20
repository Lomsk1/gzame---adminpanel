import { NavLink } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Sparkles,
  ScrollText,
  Users,
  TrendingUp,
  UserPlus,
  HelpCircle,
  ClipboardList,
  Target,
  CalendarDays,
  MessageSquare,
  Stethoscope,
  MousePointerClick,
  Radio,
  Cloud,
  Cpu,
} from "lucide-react";

type NavLinkItem = { to: string; label: string; icon: LucideIcon };

type NavGroup = { label: string; links: NavLinkItem[] };

/** Exact-match only — prevents /ai from highlighting on /ai/overview, /ai/memory, etc. */
const NAV_EXACT_MATCH = new Set(["/", "/ai", "/specialists"]);

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    links: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "AI & Memory",
    links: [
      { to: "/ai/overview", label: "AI Command Center", icon: Cpu },
      { to: "/wiki", label: "LLM Wiki", icon: BookOpen },
      { to: "/ai/memory", label: "Memory Browser", icon: Brain },
      { to: "/ai", label: "Gemini Oracle", icon: Sparkles },
      { to: "/ai/logs", label: "AI Logs", icon: ScrollText },
    ],
  },
  {
    label: "Users & Growth",
    links: [
      { to: "/users", label: "Users", icon: Users },
      { to: "/levels", label: "Level Config", icon: TrendingUp },
      { to: "/early-access", label: "Early Access", icon: UserPlus },
    ],
  },
  {
    label: "Psychometry",
    links: [
      { to: "/questions", label: "Questions", icon: HelpCircle },
      { to: "/answers", label: "Answer Logs", icon: ClipboardList },
    ],
  },
  {
    label: "Quests",
    links: [
      { to: "/quests", label: "Quest Templates", icon: Target },
      { to: "/daily-quests", label: "Daily Quests", icon: CalendarDays },
    ],
  },
  {
    label: "Community",
    links: [
      { to: "/rooms", label: "Chat Rooms", icon: MessageSquare },
      { to: "/specialists", label: "Specialists", icon: Stethoscope },
      { to: "/specialists/booking-clicks", label: "Booking Clicks", icon: MousePointerClick },
    ],
  },
  {
    label: "System",
    links: [
      { to: "/notification-broadcast", label: "Broadcast", icon: Radio },
      { to: "/cloud", label: "Cloud", icon: Cloud },
    ],
  },
];

export default function MainSidebar() {
  return (
    <aside className="w-64 h-screen bg-admin-panel border-r border-admin-border flex flex-col sticky top-0 shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-admin-border">
        <div className="w-8 h-8 bg-admin-primary rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <div>
          <span className="text-lg font-black tracking-tighter text-admin-text">GZAME</span>
          <p className="text-[9px] text-admin-text-dim uppercase tracking-widest">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-7 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 mb-2 text-[10px] font-semibold text-admin-text-dim uppercase tracking-widest">
              {group.label}
            </h3>
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={NAV_EXACT_MATCH.has(link.to)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                      isActive
                        ? "bg-admin-primary/15 text-admin-primary border-admin-primary/40 font-semibold shadow-[inset_3px_0_0_0_rgb(59,130,246)]"
                        : "text-admin-text-dim hover:text-admin-text hover:bg-admin-card/80 border-transparent hover:border-admin-border"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                      />
                      <span className="truncate">{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
