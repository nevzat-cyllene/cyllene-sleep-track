export const locales = ["tr", "en", "ku"] as const;

export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE = "cyllene.locale";
export const LOCALE_STORAGE_KEY = "cyllene.locale";

export const localeOptions = [
  { code: "tr" as const, short: "TR", label: "Türkçe", nativeLabel: "Türkçe" },
  { code: "en" as const, short: "EN", label: "English", nativeLabel: "English" },
  { code: "ku" as const, short: "KU", label: "Kurdish", nativeLabel: "Kurdî" },
];

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function parseLocale(value: string | null | undefined, fallback: Locale = "tr"): Locale {
  return isLocale(value) ? value : fallback;
}

/** Write cookie readable by the Next.js server layout (no flicker). */
export function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
}
