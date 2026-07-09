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

export function formatOnboardingSummary(answers: OnboardingAnswers) {
  const rows: { label: string; value: string }[] = [];

  if (answers.sleepSatisfaction) {
    rows.push({
      label: "Uyku memnuniyeti",
      value: LABELS.sleepSatisfaction[answers.sleepSatisfaction],
    });
  }
  if (answers.sleepHours) {
    rows.push({
      label: "Hedef uyku süresi",
      value: LABELS.sleepHours[answers.sleepHours],
    });
  }
  if (answers.nightWaking) {
    rows.push({
      label: "Gece uyanma",
      value: LABELS.nightWaking[answers.nightWaking],
    });
  }
  if (answers.snoringConcern) {
    rows.push({
      label: "Horlama",
      value: LABELS.snoringConcern[answers.snoringConcern],
    });
  }
  if (answers.healthConditions?.length) {
    const health = answers.healthConditions
      .filter((c) => c !== "none")
      .map((c) => LABELS.healthConditions[c])
      .join(", ");
    rows.push({
      label: "Sağlık",
      value: health || "Bildirilmedi",
    });
  }

  return rows;
}
