import type { Psychotype } from "../user/user";

export interface QuestDailyTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: {
    _id: string;
    user_id: string;
    quest_set: {
      title: {
        ka: string;
        en: string;
      };
      description: {
        ka: string;
        en: string;
      };
      _id: string;
      psychotype: Psychotype[];
      category: "mental" | "stalking" | "action";
    }[];
    assigned_at: Date;
    completed: boolean[];
    psychotype_used: Psychotype;
    quest_type: "foundational" | "daily";
    created_at: Date;
    updated_at: Date;
  }[];
}
