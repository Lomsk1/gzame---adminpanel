export interface QuestionsTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: [
    {
      title: {
        en: string;
        ka: string;
        ru?: string;
        ja?: string;
      };
      _id: string;
      created_at: Date;
      isActive: boolean;
      options: [
        {
          title: {
            ka: string;
            en: string;
            ru?: string;
            ja?: string;
          };
          scores: {
            WARRIOR: number;
            SHAMAN: number;
            ARCHITECT: number;
            STALKER: number;
            SPARK: number;
            ANOMALY: number;
          };
          sequence: number;
          _id: string;
        }
      ];
      priority: boolean;
      sequence: number;
      updated_at: Date;
    }
  ];
}
