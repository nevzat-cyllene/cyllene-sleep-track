/** Kurmanji (Latin) calendar labels — Intl has no solid `ku` month data in most browsers. */

const KU_MONTHS_SHORT = [
  "Çile",
  "Sibat",
  "Adar",
  "Nîsan",
  "Gulan",
  "Hezîran",
  "Tîrmeh",
  "Tebax",
  "Îlon",
  "Cotmeh",
  "Mijdar",
  "Berfanbar",
] as const;

const KU_MONTHS_LONG = KU_MONTHS_SHORT;

/** Sunday-first, matching `Date#getDay()`. */
const KU_WEEKDAYS_LONG = [
  "Yekşem",
  "Duşem",
  "Sêşem",
  "Çarşem",
  "Pêncşem",
  "În",
  "Şemî",
] as const;

export function isKuDateLocale(locale: string | null | undefined) {
  if (!locale) return false;
  const normalized = locale.toLowerCase();
  return (
    normalized === "ku" ||
    normalized.startsWith("ku-") ||
    normalized.startsWith("kmr") ||
    normalized.startsWith("ckb")
  );
}

/** Locale tag safe for Intl number/time formatting. */
export function resolveIntlLocale(locale: string | null | undefined) {
  if (!locale) return "tr-TR";
  if (isKuDateLocale(locale)) return "tr-TR";
  if (locale === "tr" || locale.startsWith("tr")) return "tr-TR";
  if (locale === "en" || locale.startsWith("en")) return "en-US";
  return locale;
}

export function formatKuDate(date: Date, style: "short" | "long" = "short") {
  const months = style === "long" ? KU_MONTHS_LONG : KU_MONTHS_SHORT;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatKuMonthYear(date: Date) {
  return `${KU_MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatKuWeekdayLong(date: Date) {
  return KU_WEEKDAYS_LONG[date.getDay()];
}

export function formatKuDayMonth(date: Date) {
  return `${date.getDate()} ${KU_MONTHS_SHORT[date.getMonth()]}`;
}

export function formatKuWeekdayRange(start: Date, end: Date) {
  const weekday = formatKuWeekdayLong(start);
  const month = KU_MONTHS_LONG[start.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const sameDay =
    startDay === endDay &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameDay) return `${weekday} ${startDay} ${month}`;
  return `${weekday} ${startDay}–${endDay} ${month}`;
}
