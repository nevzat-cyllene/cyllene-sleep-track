import { translateClient } from "@/i18n/lookup";

export interface WakeGreeting {
  title: string;
  message: string;
}

/** Kayıt bitişinde bağlama uygun karşılama metni. */
export function getWakeGreeting(elapsedMs: number, now = new Date()): WakeGreeting {
  const hour = now.getHours();
  const sleptMinutes = elapsedMs / 60000;
  const isMorning = hour >= 5 && hour < 12;
  const longSleep = sleptMinutes >= 180;
  const t = translateClient;

  if (isMorning && longSleep) {
    return {
      title: t("wakeGreeting.morningTitle"),
      message: t("wakeGreeting.morningMessage"),
    };
  }

  if (longSleep) {
    return {
      title: t("wakeGreeting.wokeTitle"),
      message: t("wakeGreeting.wokeMessage"),
    };
  }

  return {
    title: t("wakeGreeting.doneTitle"),
    message: t("wakeGreeting.doneMessage"),
  };
}
