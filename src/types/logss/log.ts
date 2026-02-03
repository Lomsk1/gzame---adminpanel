export interface UserActivityLogsType {
  status: "success";
  data: {
    sessionHistory: number[];
    securityFlags: {
      isFlagged: boolean;
      warningCount: number;
      restrictionLevel: number;
      lastWarningReason?: string;
    };
    logs: [
      {
        _id: string;
        userId: string;
        event: string;
        status: "SUCCESS" | "ERROR" | "SYSTEM" | "WARNING";
        created_at: Date;
        updated_at: Date;
        __v: number;
      }
    ];
    hourlyActivity: number[];
  };
}
