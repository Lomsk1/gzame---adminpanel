/** Single booking click record (admin list) */
export interface BookingClickRecord {
  _id: string;
  clicked_at: string;
  created_at: string;
  user: {
    _id: string;
    nickname: string;
    email: string;
  } | null;
  specialist: {
    _id: string;
    name: string;
  } | null;
}

export interface BookingClicksResponse {
  status: string;
  data: BookingClickRecord[];
  total: number;
  page: number;
  limit: number;
}
