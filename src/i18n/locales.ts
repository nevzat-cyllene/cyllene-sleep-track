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

export function detectLocaleFromLanguageTag(language: string): Locale | null {
  const normalized = language.toLowerCase();
  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("en")) return "en";
  if (
    normalized.startsWith("ku") ||
    normalized.startsWith("ckb") ||
    normalized.startsWith("kmr")
  ) {
    return "ku";
  }
  return null;
}

export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "tr";
  const parts = header.split(",").map((part) => part.trim().split(";")[0] ?? "");
  for (const part of parts) {
    const detected = detectLocaleFromLanguageTag(part);
    if (detected) return detected;
  }
  return "tr";
}

export function detectLocaleFromNavigator(): Locale {
  if (typeof navigator === "undefined") return "tr";
  const preferred =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const language of preferred) {
    const detected = detectLocaleFromLanguageTag(language ?? "");
    if (detected) return detected;
  }
  return "tr";
}

/**
 * Prefer OS / regional settings over browser UI language.
 * `navigator.language` follows the browser; Intl often follows the device locale
 * (e.g. Windows Turkish + Chrome English → tr).
 */
export function detectLocaleFromDevice(): Locale {
  if (typeof Intl !== "undefined") {
    try {
      const deviceTag = Intl.DateTimeFormat().resolvedOptions().locale;
      const fromDevice = detectLocaleFromLanguageTag(deviceTag ?? "");
      if (fromDevice) return fromDevice;
    } catch {
      // ignore
    }
  }
  return detectLocaleFromNavigator();
}

/** Write cookie readable by the Next.js server layout (no flicker). */
export function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
}
