export interface LevelConfigTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: [
    {
      rewards?: {
        energy_bonus?: number;
        unlock_features?: string[];
        promo_codes?: string[];
        visual_rewards?: string[];
      };
      _id: string;
      level: number;
      exp_required: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }
  ];
}
