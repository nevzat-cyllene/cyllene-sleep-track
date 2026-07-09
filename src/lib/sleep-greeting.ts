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

  if (isMorning && longSleep) {
    return {
      title: "Günaydın",
      message: "Uyku kaydınız tamamlandı. Analiz edilip günlüğe ekleniyor.",
    };
  }

  if (longSleep) {
    return {
      title: "Uyandınız",
      message: "Uyku kaydınız tamamlandı. Analiz edilip günlüğe ekleniyor.",
    };
  }

  return {
    title: "Kayıt tamamlandı",
    message: "Kısa kayıt analiz edilip günlüğe ekleniyor.",
  };
}
