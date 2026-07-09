export interface OnboardingAnswers {
  sleepSatisfaction?: "very" | "neutral" | "unsatisfied" | "very_unsatisfied";
  sleepHours?: "4-5" | "5-6" | "6-7" | "7-8" | "8+";
  nightWaking?: "never" | "sometimes" | "often" | "nightly";
  snoringConcern?: "none" | "mild" | "moderate" | "severe";
  healthConditions?: ("none" | "apnea" | "rls" | "narcolepsy")[];
  completedAt?: number;
}

const ONBOARDING_KEY = "cyllene-onboarding";
const WELCOME_KEY = "cyllene-welcome-complete";

export function getOnboardingAnswers(): OnboardingAnswers | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ONBOARDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    return null;
  }
}

export function saveOnboardingAnswers(answers: OnboardingAnswers): void {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(answers));
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(WELCOME_KEY) === "1";
}

export function markOnboardingComplete(answers?: OnboardingAnswers): void {
  localStorage.setItem(WELCOME_KEY, "1");
  if (answers) {
    saveOnboardingAnswers({ ...answers, completedAt: Date.now() });
  }
}

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return !hasCompletedOnboarding();
}
