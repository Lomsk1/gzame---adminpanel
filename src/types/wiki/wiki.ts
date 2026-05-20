export type WikiCategory =
  | "psychotype"
  | "framework"
  | "recommendation_rule"
  | "growth_system"
  | "gps_life"
  | "gamification"
  | "expert_system"
  | "general";

export interface WikiEntry {
  _id: string;
  slug: string;
  category: WikiCategory;
  title: string;
  body: string;
  tags: string[];
  is_active: boolean;
  embedded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WikiListResponse {
  status: string;
  data: WikiEntry[];
}
