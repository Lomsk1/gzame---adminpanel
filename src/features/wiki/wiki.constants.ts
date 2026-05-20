import type { WikiCategory } from "../../types/wiki/wiki";

export const WIKI_CATEGORIES: WikiCategory[] = [
  "psychotype",
  "framework",
  "recommendation_rule",
  "growth_system",
  "gps_life",
  "gamification",
  "expert_system",
  "general",
];

export const WIKI_CATEGORY_META: Record<
  WikiCategory,
  { label: string; description: string; color: string }
> = {
  psychotype: {
    label: "Psychotype",
    description: "WARRIOR, EXPLORER, etc. — how DEVI frames the user",
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  framework: {
    label: "Framework",
    description: "CBT, ACT, habit science — methods DEVI can reference",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  recommendation_rule: {
    label: "Recommendation",
    description: "When to suggest quests, specialists, or actions",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  growth_system: {
    label: "Growth",
    description: "Levels, streaks, progression mechanics",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  gps_life: {
    label: "GPS Life",
    description: "Life journey, chapters, directional context",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  gamification: {
    label: "Gamification",
    description: "Quests, energy, rewards language",
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  expert_system: {
    label: "Expert system",
    description: "Specialist matching and referral logic",
    color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  general: {
    label: "General",
    description: "Cross-cutting knowledge",
    color: "bg-admin-primary/15 text-admin-primary border-admin-primary/30",
  },
};

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
