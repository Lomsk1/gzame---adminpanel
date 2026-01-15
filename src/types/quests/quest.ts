import type { Psychotype } from "../user/user";

export interface QuestsTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: [
    {
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
      expReward: number;
      energyCost: number;
      minLevel: number;
      isActive: boolean;
      is_foundational: boolean;
      created_at: Date;
      updated_at: Date;
    }
  ];
}
