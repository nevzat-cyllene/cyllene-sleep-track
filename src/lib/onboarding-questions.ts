export type OnboardingStepId =
  | "intro"
  | "satisfaction"
  | "sleep_hours"
  | "night_waking"
  | "ready";

export interface OnboardingOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  subtitle?: string;
  options?: OnboardingOption[];
}

/** Giriş yapmış kullanıcılar için kısa onboarding (4 soru) */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "intro",
    title: "",
    subtitle: "Profilinizi 30 saniyede oluşturalım.",
  },
  {
    id: "satisfaction",
    title: "Uykunuzdan ne kadar memnunsunuz?",
    options: [
      { id: "very", label: "Çok memnunum", emoji: "😁" },
      { id: "neutral", label: "Nötr", emoji: "😐" },
      { id: "unsatisfied", label: "Memnun değilim", emoji: "☹️" },
      { id: "very_unsatisfied", label: "Hiç memnun değilim", emoji: "😫" },
    ],
  },
  {
    id: "sleep_hours",
    title: "Gecede ortalama kaç saat uyuyorsunuz?",
    options: [
      { id: "4-5", label: "4–5 saat" },
      { id: "5-6", label: "5–6 saat" },
      { id: "6-7", label: "6–7 saat" },
      { id: "7-8", label: "7–8 saat" },
      { id: "8+", label: "8 saat ve üzeri" },
    ],
  },
  {
    id: "night_waking",
    title: "Gece uyanıyor musunuz?",
    options: [
      { id: "never", label: "Nadiren / hiç" },
      { id: "sometimes", label: "Bazen" },
      { id: "often", label: "Sık sık" },
      { id: "nightly", label: "Hemen her gece" },
    ],
  },
  {
    id: "ready",
    title: "Profiliniz hazır",
    subtitle: "İlk gece kaydınızı başlattığınızda rapor dili ve öncelikleriniz buna göre şekillenecek.",
  },
];
