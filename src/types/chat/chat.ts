export interface User {
  _id: string;
  nickname: string;
  avatar_url?: string;
  currentLevel: number;
  psychotype?: "STALKER" | "WARRIOR" | "SHAMAN" | "ARCHITECT" | "SPARK";
  role?: "user" | "admin" | "moderator";
  consistency?: number;
  region?: {
    continent: string;
    country?: string;
    timezone?: string;
  };
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  _id: string;
  room_id: string;
  user_id: User;
  content: string;
  message_type: "text" | "system";
  moderation_status: "pending" | "approved" | "rejected" | "flagged";
  moderation_score?: number;
  replied_to?: string;
  created_at: string;
  updated_at: string;
  isOptimistic?: boolean;
  attachments?: string[];
}

export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: "class" | "guild" | "mission" | "leadership" | "mastermind" | "private";
  psychotype?: "STALKER" | "WARRIOR" | "SHAMAN" | "ARCHITECT" | "SPARK";
  region: {
    continent:
      | "americas"
      | "europe"
      | "asia"
      | "africa"
      | "oceania"
      | "global"
      | "private";
    subregion?: string;
    country?: string;
    timezone?: string;
    language?: string;
    geo_scope:
      | "global"
      | "continental"
      | "subregional"
      | "national"
      | "local"
      | "private";
  };
  min_level: number;
  required_consistency?: number;
  max_participants?: number;
  is_public: boolean;
  created_by: string;
  moderators: string[];
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_active?: boolean;
  settings?: {
    allow_attachments: boolean;
    slow_mode_interval?: number;
    require_approval?: boolean;
  };
}

export interface RoomAccessResult {
  canAccess: boolean;
  reason?: string;
  requiredLevel?: number;
  requiredConsistency?: number;
  requiredPsychotype?: string;
}

export interface SocketConnectionStats {
  socketId: string;
  connected: boolean;
  disconnected: boolean;
  auth: any;
  reconnecting: boolean;
  roomInfo: any;
  onlineUsersCount: number;
  messagesCount: number;
  pendingMessages: number;
}

export interface RoomsTypes {
  status: "success";
  fromCache: boolean;
  total: number;
  result: number;
  data: [
    {
      region: {
        continent: string;
        geo_scope: string;
        language: "en" | "ka";
      };
      _id: string;
      name: string;
      description: string;
      type: "private" | "public";
      min_level: number;
      required_consistency: number;
      is_public: boolean;
      created_by: string;
      moderators: [];
      created_at: Date;
      updated_at: Date;
    },
  ];
}
