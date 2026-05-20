import axiosAuth from "../../helper/axios";

export type AiCostStats = {
  periodDays: number;
  embeddings: {
    totalCalls: number;
    totalChars: number;
    totalBatchItems: number;
  };
  memoriesIndexedByKind: { _id: string; count: number }[];
  totalActiveMemories: number;
};

export async function aiMemoryLoader() {
  try {
    const res = await axiosAuth.get<{ status: string; data: AiCostStats }>(
      "/api/v1/stats/ai-costs?days=30"
    );
    return { stats: res.data.data, error: null as string | null };
  } catch {
    return {
      stats: null as AiCostStats | null,
      error: "Could not load AI memory stats. Is the server running?",
    };
  }
}
