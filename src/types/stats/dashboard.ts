export interface RecentAnswer {
  _id: string;
  user_id: {
    _id: string;
    nickname: string;
  };
  finalPsychotype: string;
  subPsychotype?: string;
  geminiVote: string;
  created_at: string;
}

export interface DashboardStats {
  vitalSigns: {
    _id: string | null;
    avgStreak: number;
    globalEnergy: number;
    totalAwakened: number;
    questSuccess: number;
  };
  psychotypeBalance: PsychotypeBalance[];
  funnelData: {
    name: string;
    value: number;
  }[];
  recentAnswers: RecentAnswer[];
}

// This matches the actual Axios response wrapper
export interface DashboardAPIResponse {
  status: "success";
  data: DashboardStats;
}

export interface PsychotypeBalance {
  subject: string;
  primary: number; // Main psychotype count
  secondary: number; // Sub-psychotype count
}
