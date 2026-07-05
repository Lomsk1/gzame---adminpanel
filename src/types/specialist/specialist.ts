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
  portal_enabled?: boolean;
  invite_code?: string;
  suggested_spheres?: string[];
  kyc_status?: 'none' | 'pending' | 'verified' | 'rejected';
  trust_tier?: 'T0' | 'T1' | 'T2';
  reserve_pct?: number;
  dispute_rate_90d?: number;
  services?: {
    title: string;
    duration_minutes: number;
    price_cents?: number;
    currency?: string;
  }[];
  monthly_client_limit?: number;
  /** ISO 3166-1 alpha-2 country codes. */
  countries?: string[];
  /** Languages the specialist works in (en, ka, ru, ja). */
  languages?: string[];
  user_id?: string;
  portal_user_email?: string;
  stripe_connect_account_id?: string;
  is_ambassador?: boolean;
  ambassador_country_code?: string;
  ambassador_referral_code?: string;
  referred_by_specialist_id?: string;
  referred_by_specialist?: { _id: string; name: string };
  legal_name?: string;
  entity_type?: string;
  tax_id?: string;
  tax_country?: string;
  address_line1?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpecialistListResponse {
  status: string;
  data: Specialist[];
  total?: number;
}
