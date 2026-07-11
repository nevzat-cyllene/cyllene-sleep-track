import type { SleepEventType, SleepSession } from "@/types";

type SessionEventCounts = Pick<
  SleepSession,
  "snore_count" | "cough_count" | "talk_count" | "noise_count"
>;

const EVENT_COPY: Record<
  SleepEventType,
  {
    title: string;
    unit: string;
  }
> = {
  snore: { title: "Horlama", unit: "horlama" },
  cough: { title: "Öksürük", unit: "öksürük" },
  talk: { title: "Konuşma", unit: "konuşma" },
  noise: { title: "Ani ses", unit: "ani ses" },
};

const EVENT_PRIORITY: SleepEventType[] = ["snore", "cough", "talk", "noise"];

export function getSleepEventSummary(session: SessionEventCounts) {
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
      title: "Ses olayı",
      compactLabel: "0 olay",
      statTitle: "Ses olayı",
      statSubtitle: "olay tespit edilmedi",
    };
  }

  const copy = EVENT_COPY[type];

  return {
    type,
    count,
    title: copy.title,
    compactLabel: `${count} ${copy.unit}`,
    statTitle: copy.title,
    statSubtitle: "olay tespit edildi",
  };
}
