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

/** Monday-first short headers for calendar grids. */
const KU_WEEKDAYS_SHORT_MON = ["Duş", "Sêş", "Çar", "Pên", "În", "Şem", "Yek"] as const;

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

/** Monday-first weekday labels for in-app calendars (TR / EN / KU). */
export function getCalendarWeekdayShorts(locale: string | null | undefined): string[] {
  if (isKuDateLocale(locale)) return [...KU_WEEKDAYS_SHORT_MON];
  const intlLocale = resolveIntlLocale(locale);
  // Build Mon→Sun from a known week starting Monday 2024-01-01.
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(day);
  });
}

export function toLocalDateKeyFromParts(year: number, monthIndex: number, day: number) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function shiftMonth(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

/** Days in month + Monday-first pad for grid (null = empty cell). */
export function buildMonthGrid(year: number, monthIndex: number): Array<number | null> {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Convert Sunday=0…Saturday=6 → Monday-first index 0…6
  const mondayIndex = (first.getDay() + 6) % 7;
  const cells: Array<number | null> = Array.from({ length: mondayIndex }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
