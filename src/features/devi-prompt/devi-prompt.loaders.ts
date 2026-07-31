import type { LoaderFunctionArgs } from "react-router";
import axiosAuth from "../../helper/axios";

export type DeviPromptKey =
  | "core"
  | "language"
  | "specialist"
  | "action"
  | "mode_router"
  | "memory_extract";

export type DeviPromptSlotMeta = {
  key: DeviPromptKey;
  label: string;
  description: string;
  usedIn: string;
};

export type DeviPromptPayload = {
  key: DeviPromptKey;
  text: string;
  note: string;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
  label: string;
  description: string;
  usedIn: string;
};

export type DeviPromptHistoryItem = {
  id: string;
  promptKey?: DeviPromptKey;
  text: string;
  note: string;
  source: "save" | "restore" | "seed";
  createdBy: string | null;
  createdAt: string;
  preview: string;
};

export const DEVI_PROMPT_KEY_ORDER: DeviPromptKey[] = [
  "core",
  "language",
  "specialist",
  "action",
  "mode_router",
  "memory_extract",
];

export const deviPromptPageLoader = async (_args: LoaderFunctionArgs) => {
  const res = await axiosAuth
    .get<{
      status?: string;
      data?: { slots: DeviPromptSlotMeta[]; prompts: DeviPromptPayload[] };
    }>("/api/v1/devi-prompt")
    .then((r) => r.data)
    .catch(() => ({ data: null }));

  const slots = res.data?.slots ?? [];
  const prompts = res.data?.prompts ?? [];
  const byKey = Object.fromEntries(prompts.map((p) => [p.key, p])) as Partial<
    Record<DeviPromptKey, DeviPromptPayload>
  >;

  return { slots, prompts, byKey };
};
