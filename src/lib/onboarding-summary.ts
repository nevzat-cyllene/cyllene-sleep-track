import type { OnboardingAnswers } from "./onboarding-storage";

type Translate = (path: string, params?: Record<string, string | number>) => string;

const satisfactionKey: Record<string, string> = {
  very: "very",
  neutral: "neutral",
  unsatisfied: "unsatisfied",
  very_unsatisfied: "veryUnsatisfied",
};

const sleepHoursKey: Record<string, string> = {
  "4-5": "fourFive",
  "5-6": "fiveSix",
  "6-7": "sixSeven",
  "7-8": "sevenEight",
  "8+": "eightPlus",
};

const nightWakingKey: Record<string, string> = {
  never: "rarely",
  sometimes: "sometimes",
  often: "often",
  nightly: "nightly",
};

export function formatOnboardingSummary(answers: OnboardingAnswers, t: Translate) {
  const rows: { label: string; value: string }[] = [];

  if (answers.sleepSatisfaction && satisfactionKey[answers.sleepSatisfaction]) {
    rows.push({
      label: t("onboarding.summary.sleepSatisfaction"),
      value: t(
        `onboarding.questions.satisfaction.${satisfactionKey[answers.sleepSatisfaction]}`
      ),
    });
  }

  if (answers.sleepHours && sleepHoursKey[answers.sleepHours]) {
    rows.push({
      label: t("onboarding.summary.targetSleepDuration"),
      value: t(`onboarding.questions.sleepHours.${sleepHoursKey[answers.sleepHours]}`),
    });
  }

  if (answers.nightWaking && nightWakingKey[answers.nightWaking]) {
    rows.push({
      label: t("onboarding.summary.nightWaking"),
      value: t(`onboarding.questions.nightWaking.${nightWakingKey[answers.nightWaking]}`),
    });
  }

  if (answers.snoringConcern) {
    const snorePath =
      answers.snoringConcern === "severe"
        ? "onboarding.summary.severe"
        : answers.snoringConcern === "none"
          ? "onboarding.summary.unknown"
          : null;
    if (snorePath) {
      rows.push({
        label: t("onboarding.summary.snoring"),
        value: t(snorePath),
      });
    }
  }

  if (Array.isArray(answers.healthConditions) && answers.healthConditions.length) {
    const health = answers.healthConditions
      .filter((condition) => condition !== "none")
      .map((condition) => {
        if (condition === "apnea") return t("onboarding.summary.apnea");
        if (condition === "rls") return t("onboarding.summary.restlessLegs");
        return null;
      })
      .filter(Boolean)
      .join(", ");
    rows.push({
      label: t("onboarding.summary.health"),
      value: health || t("onboarding.summary.notReported"),
    });
  }

  return rows;
}
