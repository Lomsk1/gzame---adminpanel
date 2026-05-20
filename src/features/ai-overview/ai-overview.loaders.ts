import axiosAuth from "../../helper/axios";

export type AiOverviewData = {
  config: {
    geminiModelChain: string[];
    embeddingModel: string;
    vectorDim: number;
    memoryVectorIndex: string;
    wikiVectorIndex: string;
    memoryTopK: number;
    memoryMinScore: number;
    memorySnippetMaxChars: number;
    memoryRagCacheTtl: number;
    embeddingQueueEnabled: boolean;
    memoryCompactionAgeDays: number;
    memoryCompactionThreshold: number;
  };
  counts: {
    wikiTotal: number;
    wikiActive: number;
    wikiNeedsEmbed: number;
    wikiByCategory: { _id: string; count: number }[];
    totalMemories: number;
    memoriesByKind: { _id: string; count: number }[];
    knowledgeEdges: number;
    biometricSnapshots: number;
    usersWithMemories: number;
  };
  pipelines: { id: string; label: string; steps: string[] }[];
  crons: { name: string; desc: string }[];
};

export async function aiOverviewLoader() {
  try {
    const res = await axiosAuth.get<{ status: string; data: AiOverviewData }>(
      "/api/v1/stats/ai-overview"
    );
    return { overview: res.data.data, error: null as string | null };
  } catch {
    return {
      overview: null as AiOverviewData | null,
      error: "Could not load AI overview. Is the server running?",
    };
  }
}
