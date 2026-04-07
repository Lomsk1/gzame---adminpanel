/** Category for specialists (e.g. "Coach", "Therapist") - title in en/ka/ru/ja */
export interface SpecialistCategory {
  _id: string;
  title: { en: string; ka: string; ru?: string; ja?: string };
  created_at?: string;
  updated_at?: string;
}

export interface SpecialistCategoryListResponse {
  status: string;
  data: SpecialistCategory[];
  total?: number;
}

/** Specialist - avatar, name, bio, categories, link, booking, order, tags, specialty, isActive */
export interface Specialist {
  _id: string;
  avatar?: string;
  name: string;
  bio: string;
  categories: SpecialistCategory[] | string[];
  link: string;
  booking: string;
  /** Display/promotion order (lower = higher). */
  order?: number;
  tags?: string[];
  specialty?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SpecialistListResponse {
  status: string;
  data: Specialist[];
  total?: number;
}
