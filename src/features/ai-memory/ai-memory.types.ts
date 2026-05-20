export type AiMemoryRow = {
  _id: string;
  user_id: string;
  kind: string;
  text: string;
  summary?: string;
  importance: number;
  embedded_at?: string;
  created_at: string;
};

export type AiMemoryListResponse = {
  items: AiMemoryRow[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export const MEMORY_KIND_LABELS: Record<string, string> = {
  chat_message: "Chat",
  daily_feel: "Daily feel",
  completed_quest: "Quest done",
  planner_chat: "Planner",
  ai_observation: "Observation",
  biometric_summary: "Biometrics",
  summary: "Summary",
};
