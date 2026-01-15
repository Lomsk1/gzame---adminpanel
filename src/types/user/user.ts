export type Psychotype =
  | "STALKER"
  | "WARRIOR"
  | "SHAMAN"
  | "ARCHITECT"
  | "SPARK"
  | "ANOMALY"
  | "PENDING";

export const PSYCHOTYPE_CONFIG: Record<
  Psychotype,
  { color: string; bg: string; border: string }
> = {
  STALKER: {
    color: "text-purple-400",
    bg: "bg-purple-500",
    border: "border-purple-400/10",
  },
  WARRIOR: {
    color: "text-red-400",
    bg: "bg-red-500",
    border: "border-red-400/10",
  },
  SHAMAN: {
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-400/10",
  },
  ARCHITECT: {
    color: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-400/10",
  },
  SPARK: {
    color: "text-yellow-400",
    bg: "bg-yellow-500",
    border: "border-yellow-400/10",
  },
  ANOMALY: {
    color: "text-pink-400",
    bg: "bg-pink-500",
    border: "border-pink-400/10",
  },
  PENDING: {
    color: "text-grey-400",
    bg: "bg-grey-400",
    border: "border-grey-400/10",
  },
};

export interface UserTypes {
  status: "success";
  data: UserDataType;
}

export interface UserDataType {
  nickname: string;
  email: string;

  email_activation: boolean;
  email_code: number;
  email_code_expire: number;

  status: "active" | "blocked" | "inactive";
  psychotype: Psychotype | "PENDING";
  subPsychotype?: Psychotype;
  bio?: string;

  isCombinedClass: boolean;

  /* Progression and Energy */
  currentLevel: number;
  currentEXP: number;
  energyPoints: number;
  last_energy_reset?: Date;

  /* Psychotype Calibration and Scoring */
  dateOfBirth: Date;
  greatestPain: string;

  /* Monetization and Task Limits */
  isSubscribed: boolean;
  tasksCompletedThisWeek: number;
  taskLimitReset: Date;

  /* Streak */
  currentStreakDays: number;
  lastCompletionDate: Date;
  lastStreakCheckDate: Date;

  role: "admin" | "user";
  signup_ip?: string;

  password: string;
  passwordConfirm?: string;

  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  updated_at: Date;
  created_at: Date;
  blockExpiresAt?: Date;
  isActive: boolean;

  hourlyActivity?: number[];
  sessionHistory?: number[];
  securityFlags?: {
    isFlagged?: boolean;
    warningCount?: number;
    lastWarningReason?: string;
    restrictionLevel?: number; // 0: None, 1: Warned, 2: Limited, 3: Banned
  };

  __v: number;
  _id: string;
  admin_notes?: string;
}

export interface UsersDataType {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: (UserDataType & {
    profile: {
      _id: string;
      user_id: string;
      workingSpace: string;
    };
  })[];
}
