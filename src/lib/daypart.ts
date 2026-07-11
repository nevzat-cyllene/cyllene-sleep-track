export type Daypart = "morning" | "afternoon" | "evening" | "night";

/** Local-clock daypart for time-aware greetings. */
export function getDaypart(date: Date = new Date()): Daypart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
