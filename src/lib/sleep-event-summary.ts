import type { SleepEventType, SleepSession } from "@/types";

type SessionEventCounts = Pick<
  SleepSession,
  "snore_count" | "cough_count" | "talk_count" | "noise_count"
>;

type Translate = (path: string, params?: Record<string, string | number>) => string;

const EVENT_PRIORITY: SleepEventType[] = ["snore", "cough", "talk", "noise"];

export function getSleepEventSummary(session: SessionEventCounts, t: Translate) {
  const counts: Record<SleepEventType, number> = {
    snore: session.snore_count,
    cough: session.cough_count,
    talk: session.talk_count,
    noise: session.noise_count,
  };

  const type = EVENT_PRIORITY.reduce<SleepEventType>((best, current) => {
    if (counts[current] > counts[best]) return current;
    return best;
  }, "snore");

  const count = counts[type];

  if (count <= 0) {
    return {
      type: "noise" as SleepEventType,
      count: 0,
      title: t("events.types.generic.title"),
      compactLabel: t("events.zeroEvents"),
      statTitle: t("events.types.generic.title"),
      statSubtitle: t("events.notDetected"),
    };
  }

  return {
    type,
    count,
    title: t(`events.types.${type}.title`),
    compactLabel: `${count} ${t(`events.types.${type}.unit`)}`,
    statTitle: t(`events.types.${type}.title`),
    statSubtitle: t("events.detected"),
  };
}
