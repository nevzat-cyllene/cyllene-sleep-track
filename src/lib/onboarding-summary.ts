import type { OnboardingAnswers } from "./onboarding-storage";

const LABELS = {
  sleepSatisfaction: {
    very: "Çok memnun",
    neutral: "Nötr",
    unsatisfied: "Memnun değil",
    very_unsatisfied: "Hiç memnun değil",
  },
  sleepHours: {
    "4-5": "4–5 saat",
    "5-6": "5–6 saat",
    "6-7": "6–7 saat",
    "7-8": "7–8 saat",
    "8+": "8+ saat",
  },
  nightWaking: {
    never: "Nadiren",
    sometimes: "Bazen",
    often: "Sık sık",
    nightly: "Her gece",
  },
  snoringConcern: {
    none: "Yok / bilmiyorum",
    mild: "Hafif",
    moderate: "Orta",
    severe: "Şiddetli",
  },
  healthConditions: {
    none: "Yok",
    apnea: "Uyku apnesi",
    rls: "Huzursuz bacak",
    narcolepsy: "Narkolepsi",
  },
} as const;

function getLabel<T extends Record<string, string>>(map: T, value: unknown) {
  if (typeof value !== "string") return null;
  return map[value as keyof T] ?? null;
}

export function formatOnboardingSummary(answers: OnboardingAnswers) {
  const rows: { label: string; value: string }[] = [];

  const sleepSatisfaction = getLabel(LABELS.sleepSatisfaction, answers.sleepSatisfaction);
  if (sleepSatisfaction) {
    rows.push({ label: "Uyku memnuniyeti", value: sleepSatisfaction });
  }

  const sleepHours = getLabel(LABELS.sleepHours, answers.sleepHours);
  if (sleepHours) {
    rows.push({ label: "Hedef uyku süresi", value: sleepHours });
  }

  const nightWaking = getLabel(LABELS.nightWaking, answers.nightWaking);
  if (nightWaking) {
    rows.push({ label: "Gece uyanma", value: nightWaking });
  }

  const snoringConcern = getLabel(LABELS.snoringConcern, answers.snoringConcern);
  if (snoringConcern) {
    rows.push({ label: "Horlama", value: snoringConcern });
  }

  if (Array.isArray(answers.healthConditions) && answers.healthConditions.length) {
    const health = answers.healthConditions
      .filter((condition) => condition !== "none")
      .map((condition) => getLabel(LABELS.healthConditions, condition))
      .filter(Boolean)
      .join(", ");
    rows.push({
      label: "Sağlık",
      value: health || "Bildirilmedi",
    });
  }

  return rows;
}
