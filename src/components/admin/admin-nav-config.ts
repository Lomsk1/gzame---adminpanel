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
  CreditCard,
  AlertTriangle,
  Radio,
  Cloud,
  Cpu,
} from "lucide-react";
import type { AdminMessages } from "../../i18n/translations";

export const NAV_EXACT_MATCH = new Set(["/", "/ai", "/specialists"]);

export type NavLinkDef = {
  to: string;
  labelKey: keyof AdminMessages;
  icon: LucideIcon;
};

export type NavGroupDef = {
  labelKey: keyof AdminMessages;
  links: NavLinkDef[];
};

export const ADMIN_NAV_GROUPS: NavGroupDef[] = [
  {
    labelKey: "nav.groups.overview",
    links: [{ to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "nav.groups.ai",
    links: [
      { to: "/ai/overview", labelKey: "nav.aiOverview", icon: Cpu },
      { to: "/wiki", labelKey: "nav.wiki", icon: BookOpen },
      { to: "/ai/memory", labelKey: "nav.aiMemory", icon: Brain },
      { to: "/ai", labelKey: "nav.aiOracle", icon: Sparkles },
      { to: "/ai/logs", labelKey: "nav.aiLogs", icon: ScrollText },
    ],
  },
  {
    labelKey: "nav.groups.users",
    links: [
      { to: "/users", labelKey: "nav.users", icon: Users },
      { to: "/levels", labelKey: "nav.levels", icon: TrendingUp },
      { to: "/early-access", labelKey: "nav.earlyAccess", icon: UserPlus },
    ],
  },
  {
    labelKey: "nav.groups.psychometry",
    links: [
      { to: "/questions", labelKey: "nav.questions", icon: HelpCircle },
      { to: "/answers", labelKey: "nav.answers", icon: ClipboardList },
    ],
  },
  {
    labelKey: "nav.groups.quests",
    links: [
      { to: "/quests", labelKey: "nav.quests", icon: Target },
      { to: "/daily-quests", labelKey: "nav.dailyQuests", icon: CalendarDays },
    ],
  },
  {
    labelKey: "nav.groups.community",
    links: [
      { to: "/rooms", labelKey: "nav.chat", icon: MessageSquare },
      { to: "/specialists", labelKey: "nav.specialists", icon: Stethoscope },
      { to: "/specialists/booking-clicks", labelKey: "nav.bookingClicks", icon: MousePointerClick },
      { to: "/payments", labelKey: "nav.payments", icon: CreditCard },
      { to: "/reports", labelKey: "nav.reports", icon: AlertTriangle },
    ],
  },
  {
    labelKey: "nav.groups.system",
    links: [
      { to: "/notification-broadcast", labelKey: "nav.broadcast", icon: Radio },
      { to: "/cloud", labelKey: "nav.cloud", icon: Cloud },
    ],
  },
];

export const ADMIN_PANEL_CLASS =
  "rounded-2xl border border-admin-border/50 bg-admin-panel/70 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(0,0,0,0.45)]";
