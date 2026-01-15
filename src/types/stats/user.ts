import type { Psychotype } from "../user/user";

export interface StatsUserTypes {
  status: "success";
  timestamp: Date;
  data: {
    stats: {
      totals: {
        _id: string;
        totalUsers: number;
        activeUsers: number;
        blockedUsers: number;
        subscribers: number;
        avgLevel: number;
        avgStreak: number;
        totalSubPsichotypeUsers: number;
      };
      growth: {
        _id: string;
        newToday: number;
        newThisWeek: number;
      };
      psychotypeDistribution: Array<{ _id: Psychotype; count: number }>;
      subPsychotypeDistribution: Array<{ _id: Psychotype; count: number }>;
      onboardingCompletionRate: string;
      subscriptionRate: string;
    };
    topUsers: Array<{
      _id: string;
      nickname: string;
      psychotype: Psychotype;
      currentLevel: number;
      currentStreakDays: number;
    }>;
  };
}
