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
): RecordingGuidance {
  if (isPwa) {
    if (platform === "ios") {
      return {
        status: "warning",
        title: "Uygulama kurulu — iyi başlangıç",
        message:
          "Kayda başladığınızda bu ekran açık kalır ve ekran kilidi devreye girer. iPhone'da ekran yine de kapanabilir; kayıt kesilmesin diye otomatik kilit süresini uzatın:",
        steps: getPlatformSteps(platform, isPwa),
      };
    }

    return {
      status: "ok",
      title: "Uygulama kurulu — hazırsınız",
      message:
        "Kayda bastığınızda bu ekran açık kalır ve mikrofon gece boyunca çalışır. Telefonu yatağınıza yakın, şarjda ve bu ekran görünür şekilde bırakın.",
    };
  }

  if (platform === "ios") {
    return {
      status: "warning",
      title: "Önce ana ekrana ekleyin",
      message:
        `${siteConfig.name}'i Ana Ekrana Ekleyip oradan açın; ardından kayıt ekranı uyanık kalır:`,
      steps: getPlatformSteps(platform, isPwa),
    };
  }

  if (platform === "android") {
    return {
      status: "warning",
      title: "Ana ekrana eklemenizi öneririz",
      message:
        "Tarayıcı sekmesinden kayıt yapabilirsiniz; ancak ana ekrana eklediğinizde ekran uyanık kalma ve mikrofon daha güvenilir çalışır.",
      steps: ["Tarayıcı menüsünden Ana Ekrana Ekle / Uygulamayı yükle"],
    };
  }

  if (platform === "desktop") {
    return {
      status: "ok",
      title: "Tarayıcıdan kullanıma hazır",
      message:
        "Bilgisayardan da kayıt yapabilirsiniz. Kayıt sırasında bu sekmeyi açık bırakın ve cihazın uyku moduna geçmesini engelleyin. Gece takibi için telefon daha uygundur.",
    };
  }

  return {
    status: "warning",
    title: "Ana ekrana eklemenizi öneririz",
    message:
      "Tarayıcı sekmesinden kayıt yapabilirsiniz; ancak ana ekrana eklediğinizde ekran uyanık kalma ve mikrofon daha güvenilir çalışır.",
    steps: ["Tarayıcı menüsünden Ana Ekrana Ekle / Uygulamayı yükle"],
  };
}
