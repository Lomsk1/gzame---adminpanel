export interface NotificationsType {
  status: "success";
  fromCache: true;
  total: 0;
  result: 0;
  data: {
    user_id: string;
    sender_id: string;

    _id: string;

    type:
      | "SYSTEM_DIRECTIVE"
      | "SECURITY_ALERT"
      | "ACHIEVEMENT"
      | "NEURAL_UPDATE"

    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

    content: string;
    actionUrl?: string;
    status: "UNREAD" | "READ" | "ARCHIVED" | "DISMISSED";

    isFlash: boolean;
    readAt: Date;

    updated_at: Date;
    created_at: Date;
  }[];
}
