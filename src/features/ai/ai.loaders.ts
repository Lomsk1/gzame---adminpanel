import axiosAuth from "../../helper/axios";
import type { AIInstructionType } from "../../types/ai/ai";

export const AIInstructionLoader = async () => {
  const instructionPromise = axiosAuth
    .get<AIInstructionType>("/api/v1/gemini-instruction")
    .then((res) => res.data.data);

  return {
    instructionData: instructionPromise,
  };
};
