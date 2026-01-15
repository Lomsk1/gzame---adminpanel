import type { Psychotype } from "../user/user";

export interface AnswersTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: {
    totalScores: {
      WARRIOR: number;
      SHAMAN: number;
      ARCHITECT: number;
      STALKER: number;
      SPARK: number;
      ANOMALY: number;
    };
    percentageScores: {
      WARRIOR: number;
      SHAMAN: number;
      ARCHITECT: number;
      STALKER: number;
      SPARK: number;
      ANOMALY: number;
    };
    _id: string;
    user_id: {
      _id: string;
      nickname: string;
      email: string;
      isActive: boolean;
      id: string;
    };
    sessionId: string;
    answers: {
      questionId: string;
      selectedOptionSequence: number;
      _id: string;
    }[];
    finalPsychotype: Psychotype;
    isCombinedClass: boolean;
    geminiVote: Psychotype;
    gemini_decisionReason: string;
    created_at: Date;
    updated_at: Date;
  }[];
}
