import { siteConfig } from "@/lib/site-config";

export type DevicePlatform = "ios" | "android" | "desktop" | "unknown";

export type WakeLockStatus = "active" | "fallback" | "inactive";

export interface RecordingGuidance {
  status: "ok" | "warning" | "critical";
  title: string;
  message: string;
  steps?: string[];
}

export function getDevicePlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "desktop";
  return "unknown";
}

export function isMobilePlatform(platform?: DevicePlatform): boolean {
  const p = platform ?? getDevicePlatform();
  return p === "ios" || p === "android";
}

export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getPlatformSteps(platform: DevicePlatform, isPwa: boolean): string[] {
  if (platform === "ios") {
    const steps = [
      "Ayarlar → Ekran ve Parlaklık → Otomatik Kilit → Hiçbir Zaman (veya en uzun süre)",
      "Ayarlar → Odak → Uyku Modu kapalı olsun",
      "Kayıt sırasında güç tuşuna basıp telefonu kilitlemeyin",
      "Telefonu şarja takın ve bu ekranı açık bırakın",
    ];

    if (!isPwa) {
      steps.unshift(
        `Safari'de paylaş → Ana Ekrana Ekle ile ${siteConfig.name}'i kurun`
      );
    }

    return steps;
  }

  if (platform === "android") {
    return [
      "Ayarlar → Ekran → Ekran zaman aşımı → 30 dakika veya Hiçbir Zaman",
      `Ayarlar → Uygulamalar → ${siteConfig.shortName} → Pil → Kısıtlama yok / Sınırsız`,
      "Kayıt sırasında ekranı kapatmayın veya uygulamadan çıkmayın",
      "Telefonu şarja takın",
    ];
  }

  return [
    "Tarayıcı sekmesini veya uygulama penceresini açık bırakın",
    "Bilgisayarın uyku moduna geçmesini engelleyin",
  ];
}

export function getRecordingGuidance(
  platform: DevicePlatform,
  wakeLockStatus: WakeLockStatus,
  isPwa: boolean
): RecordingGuidance {
  if (wakeLockStatus === "active") {
    return {
      status: "ok",
      title: "Ekran açık kalacak",
      message: isPwa
        ? `${siteConfig.shortName} ana ekrandan açık. Bu kayıt ekranı gece boyunca uyanık kalır; mikrofon kesintisiz çalışır. Yine de telefonu şarja takmanızı öneririz.`
        : "Ekran uyanık tutuluyor. Kayıt bu ekran açıkken devam eder — telefonu kilitlemeyin ve şarja takın.",
    };
  }

  if (wakeLockStatus === "fallback") {
    return {
      status: "warning",
      title: "Ekran kapanabilir",
      message:
        "Tam ekran kilidi desteklenmiyor; yedek yöntem kullanılıyor. Kayıt kesilmemesi için şu ayarları yapın:",
      steps: getPlatformSteps(platform, isPwa),
    };
  }

  return {
    status: "critical",
    title: "Kayıt kesilebilir",
    message:
      "Ekran uyanık tutulamadı. Telefon kilitlenince veya ekran kapanınca mikrofon durabilir. Lütfen şunları yapın:",
    steps: getPlatformSteps(platform, isPwa),
  };
}

export function getPreRecordingGuidance(
  platform: DevicePlatform,
  isPwa: boolean
): RecordingGuidance | null {
  if (platform === "desktop") {
    return null;
  }

  if (isPwa) {
    if (platform === "ios") {
      return {
        status: "warning",
        title: "iPhone ekran kilidi",
        message:
          "Kayıt sırasında ekran açık kalır; yine de otomatik kilit süresini uzatmanızı öneririz:",
        steps: getPlatformSteps(platform, isPwa),
      };
    }

    return null;
  }

  if (platform === "ios") {
    return {
      status: "warning",
      title: "Kayıt öncesi öneri",
      message:
        "Uzun uyku kaydı için uygulamayı ana ekrana ekleyip oradan açmanız daha güvenilirdir. İsterseniz tarayıcıdan da başlayabilirsiniz.",
      steps: getPlatformSteps(platform, isPwa),
    };
  }

  return null;
}
