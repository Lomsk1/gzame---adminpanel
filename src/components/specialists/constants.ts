export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=spec";

export const LIFE_SPHERES = [
  { id: "finance", label: "Finance" },
  { id: "relationships", label: "Relationships" },
  { id: "energy", label: "Energy" },
  { id: "health", label: "Health" },
  { id: "self_realization", label: "Self-realization" },
  { id: "environment", label: "Environment" },
  { id: "skills", label: "Skills" },
] as const;

export const COUNTRY_OPTIONS = [
  { code: "GE", name: "Georgia" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PL", name: "Poland" },
  { code: "UA", name: "Ukraine" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "UAE" },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "RO", name: "Romania" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "AM", name: "Armenia" },
] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", short: "EN" },
  { code: "ka", label: "Georgian", short: "KA" },
  { code: "ru", label: "Russian", short: "RU" },
  { code: "ja", label: "Japanese", short: "JA" },
] as const;

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
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? code;
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
