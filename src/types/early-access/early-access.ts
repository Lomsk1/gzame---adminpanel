export type EarlyAccessStatus = "pending" | "contacted" | "invited";

export interface EarlyAccessRecord {
  _id: string;
  fullName: string;
  email: string;
  status: EarlyAccessStatus;
  adminNotes: string;
  created_at: string;
  updated_at: string;
}

export interface EarlyAccessListResponse {
  status: string;
  data: EarlyAccessRecord[];
  total: number;
  page: number;
  limit: number;
}
