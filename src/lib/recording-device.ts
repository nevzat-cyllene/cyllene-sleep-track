import { siteConfig } from "@/lib/site-config";

export type DevicePlatform = "ios" | "android" | "desktop" | "unknown";

export type WakeLockStatus = "active" | "fallback" | "inactive";

export interface RecordingGuidance {
  status: "ok" | "warning" | "critical";
  title: string;
  message: string;
  steps?: string[];
}

export type GuidanceTranslate = (
  path: string,
  params?: Record<string, string | number>
) => string;

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

export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getPlatformSteps(
  platform: DevicePlatform,
  isPwa: boolean,
  t: GuidanceTranslate
): string[] {
  if (platform === "ios") {
    const steps = [
      t("deviceGuidance.steps.iosAutoLock"),
      t("deviceGuidance.steps.iosSleepFocus"),
      t("deviceGuidance.steps.iosDoNotLock"),
      t("deviceGuidance.steps.keepChargingAndOpen"),
    ];

    if (!isPwa) {
      steps.unshift(
        t("deviceGuidance.steps.iosInstall", { appName: siteConfig.name })
      );
    }

    return steps;
  }

  if (platform === "android") {
    return [
      t("deviceGuidance.steps.androidScreenTimeout"),
      t("deviceGuidance.steps.androidBattery", { appShortName: siteConfig.shortName }),
      t("deviceGuidance.steps.androidDoNotClose"),
      t("deviceGuidance.steps.keepCharging"),
    ];
  }

  return [
    t("deviceGuidance.steps.desktopKeepTabOpen"),
    t("deviceGuidance.steps.desktopPreventSleep"),
  ];
}

export function getRecordingGuidance(
  platform: DevicePlatform,
  wakeLockStatus: WakeLockStatus,
  isPwa: boolean,
  t: GuidanceTranslate
): RecordingGuidance {
  if (wakeLockStatus === "active") {
    return {
      status: "ok",
      title: t("deviceGuidance.recording.active.title"),
      message: isPwa
        ? t("deviceGuidance.recording.active.pwaMessage", {
            appShortName: siteConfig.shortName,
          })
        : t("deviceGuidance.recording.active.browserMessage"),
    };
  }

  if (wakeLockStatus === "fallback") {
    return {
      status: "warning",
      title: t("deviceGuidance.recording.fallback.title"),
      message: t("deviceGuidance.recording.fallback.message"),
      steps: getPlatformSteps(platform, isPwa, t),
    };
  }

  return {
    status: "critical",
    title: t("deviceGuidance.recording.inactive.title"),
    message: t("deviceGuidance.recording.inactive.message"),
    steps: getPlatformSteps(platform, isPwa, t),
  };
}

export function getPreRecordingGuidance(
  platform: DevicePlatform,
  isPwa: boolean,
  t: GuidanceTranslate
): RecordingGuidance {
  if (isPwa) {
    if (platform === "ios") {
      return {
        status: "warning",
        title: t("deviceGuidance.preRecording.iosInstalled.title"),
        message: t("deviceGuidance.preRecording.iosInstalled.message"),
        steps: getPlatformSteps(platform, isPwa, t),
      };
    }

    return {
      status: "ok",
      title: t("deviceGuidance.preRecording.installed.title"),
      message: t("deviceGuidance.preRecording.installed.message"),
    };
  }

  if (platform === "ios") {
    return {
      status: "warning",
      title: t("deviceGuidance.preRecording.iosNeedsInstall.title"),
      message: t("deviceGuidance.preRecording.iosNeedsInstall.message", {
        appName: siteConfig.name,
      }),
      steps: getPlatformSteps(platform, isPwa, t),
    };
  }

  // Install / "Ana ekrana ekle" guidance is mobile-only.
  if (platform === "android") {
    return {
      status: "warning",
      title: t("deviceGuidance.preRecording.androidInstallRecommended.title"),
      message: t("deviceGuidance.preRecording.androidInstallRecommended.message"),
      steps: [t("deviceGuidance.steps.browserInstall")],
    };
  }

  return {
    status: "ok",
    title: t("deviceGuidance.preRecording.browser.title"),
    message: t("deviceGuidance.preRecording.browser.message"),
  };
}
