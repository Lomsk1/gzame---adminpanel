import { COUNTRIES, getCountryName as lookupCountryName } from "../../lib/countries";

export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=spec";

/** Baltic states — shown first in admin picker. */
const BALTIC_CODES = ["EE", "LV", "LT"] as const;

/** EU member states (ISO 3166-1 alpha-2). */
const EU_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

/** Other priority markets for GzaMe reach. */
const KEY_MARKET_CODES = [
  "GE", "US", "GB", "CH", "NO", "IS", "UA", "TR", "AE", "IL", "IN", "JP", "KR",
  "AU", "CA", "BR", "MX", "SG", "HK", "NZ", "KZ", "AZ", "AM", "MD", "RS", "ME",
  "MK", "AL", "BA", "BY", "RU",
] as const;

function buildCountryOptions() {
  const pinnedOrder = [
    ...BALTIC_CODES,
    ...EU_CODES.filter((c) => !BALTIC_CODES.includes(c as (typeof BALTIC_CODES)[number])),
    ...KEY_MARKET_CODES.filter(
      (c) =>
        !BALTIC_CODES.includes(c as (typeof BALTIC_CODES)[number]) &&
        !EU_CODES.includes(c as (typeof EU_CODES)[number]),
    ),
  ];
  const pinnedSet = new Set<string>(pinnedOrder);
  const nameByCode = new Map(COUNTRIES.map((c) => [c.code, c.name]));

  const pinned = pinnedOrder
    .filter((code) => nameByCode.has(code))
    .map((code) => ({ code, name: nameByCode.get(code)! }));

  const rest = COUNTRIES.filter((c) => !pinnedSet.has(c.code)).map((c) => ({
    code: c.code,
    name: c.name,
  }));

  return [...pinned, ...rest];
}

export const COUNTRY_OPTIONS = buildCountryOptions();

export const LIFE_SPHERES = [
  { id: "finance", label: "Finance" },
  { id: "relationships", label: "Relationships" },
  { id: "energy", label: "Energy" },
  { id: "health", label: "Health" },
  { id: "self_realization", label: "Self-realization" },
  { id: "environment", label: "Environment" },
  { id: "skills", label: "Skills" },
] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", short: "EN" },
  { code: "ka", label: "Georgian", short: "KA" },
  { code: "ru", label: "Russian", short: "RU" },
  { code: "ja", label: "Japanese", short: "JA" },
] as const;

export const TRUST_TIER_OPTIONS = [
  {
    value: "T0",
    label: "T0 — New",
    reservePct: 10,
    clearanceDays: 5,
    hint: "10% rolling reserve · 5-day bank payout clearance",
  },
  {
    value: "T1",
    label: "T1 — Established",
    reservePct: 5,
    clearanceDays: 1,
    hint: "5% rolling reserve · 1-day clearance",
  },
  {
    value: "T2",
    label: "T2 — Trusted",
    reservePct: 2,
    clearanceDays: 0,
    hint: "2% rolling reserve · same-day clearance",
  },
] as const;

export type TrustTierValue = (typeof TRUST_TIER_OPTIONS)[number]["value"];

export function trustTierLabel(tier?: string): string {
  return TRUST_TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier ?? "T0";
}

export const KYC_OPTIONS = [
  { value: "none", label: "None", tone: "muted" },
  { value: "pending", label: "Pending", tone: "warning" },
  { value: "verified", label: "Verified", tone: "success" },
  { value: "rejected", label: "Rejected", tone: "error" },
] as const;

export const CURRENCY_OPTIONS = [
  { code: "eur", label: "EUR", symbol: "€" },
  { code: "usd", label: "USD", symbol: "$" },
  { code: "gbp", label: "GBP", symbol: "£" },
  { code: "gel", label: "GEL", symbol: "₾" },
  { code: "jpy", label: "JPY", symbol: "¥" },
  { code: "chf", label: "CHF", symbol: "CHF" },
] as const;

export function countryToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

export function getCountryName(code: string): string {
  return lookupCountryName(code);
}

export function formatPrice(cents?: number, currency = "EUR"): string {
  if (cents == null) return "";
  return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
}

export function formatServicePrice(service?: {
  price_cents?: number;
  currency?: string;
}): string {
  if (service?.price_cents == null) return "";
  return formatPrice(service.price_cents, service.currency ?? "EUR");
}

export function buildSpecialistServices(data: {
  serviceTitle?: string;
  serviceDuration?: number;
  servicePrice?: number | string;
  serviceCurrency?: string;
}) {
  const title = data.serviceTitle?.trim();
  if (!title) return [];

  const service: {
    title: string;
    duration_minutes: number;
    price_cents?: number;
    currency?: string;
  } = {
    title,
    duration_minutes: Math.max(5, data.serviceDuration ?? 60),
  };

  const priceRaw = data.servicePrice;
  const hasPrice =
    priceRaw !== undefined &&
    priceRaw !== null &&
    String(priceRaw).trim() !== "" &&
    !Number.isNaN(Number(priceRaw)) &&
    Number(priceRaw) >= 0;

  if (hasPrice) {
    service.price_cents = Math.round(Number(priceRaw) * 100);
    service.currency = (data.serviceCurrency ?? "eur").toLowerCase();
  }

  return [service];
}
