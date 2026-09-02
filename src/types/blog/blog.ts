export type BlogStatus = "draft" | "published";

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image?: string;
  tags: string[];
  status: BlogStatus;
  author_name: string;
  reading_time_minutes: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  status: string;
  data: BlogPost[];
}
