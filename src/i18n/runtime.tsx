"use client";

import * as React from "react";
import { messages as baseMessages } from "@/i18n/messages";

export const localeOptions = [
  { code: "tr", short: "TR", label: "Türkçe", nativeLabel: "Türkçe" },
  { code: "en", short: "EN", label: "English", nativeLabel: "English" },
  { code: "ku", short: "KU", label: "Kurdish", nativeLabel: "Kurdî" },
] as const;

export type Locale = (typeof localeOptions)[number]["code"];

type MessageNode =
  | string
  | readonly string[]
  | { readonly [key: string]: MessageNode }
  | readonly MessageNode[];

type MessageTree = Record<string, MessageNode>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  m: <T>(path: string, fallback: T) => T;
};

const STORAGE_KEY = "cyllene.locale";
const LEGACY_REMOVED_LOCALES = new Set(["ar", "fa"]);

const extraMessages = {
  tr: {
    brand: {
      developerCredit: "Cyllene Uyku Takipçisi geliştirici",
    },
    appControl: {
      aria: "Ayarlar ve dil",
      title: "Cyllene kontrol",
      subtitle: "Dil, hesap ve gece akışı tek, sakin bir menüde.",
      quickAccess: "Hızlı erişim",
      profile: "Profil ve ayarlar",
      newNight: "Yeni gece başlat",
      journal: "Uyku günlüğü",
      language: "Dil",
      active: "Aktif",
      ready: "Hazır",
      privacyTitle: "Ham ses cihazında kalır",
      privacyBody: "Hesabına yalnızca rapor ve özet metrikler senkronize edilir.",
    },
    install: {
      close: "Kapat",
      openInBrowserTitle: "Cyllene’i tarayıcıda açın",
      openInBrowserBody: "Chrome, Safari, Yandex… hepsi olur",
      open: "Aç",
      promptTitle: "Cyllene Uyku Takipçisini indirmek ister misiniz?",
      iosHint: "Paylaş → Ana Ekrana Ekle",
      androidHint: "İndir’e basınca yükleme başlar",
      browserHint: "Tarayıcı menüsünden Uygulamayı yükle’yi seçin",
      cancelled: "Yükleme iptal edildi",
      failed: "Yükleme başlatılamadı",
      oneTap: "Tek dokunuşla yükle",
      download: "İndir",
      iosInstructionBefore: "Safari’de",
      addToHome: "Ana Ekrana Ekle",
    },
    recordingPermission: {
      chip: "Mikrofon izni istenir",
      note: "Başlatınca tarayıcı mikrofon erişimi isteyecek; lütfen izin verin.",
    },
  },
  en: {
    brand: {
      developerCredit: "Cyllene Sleep Tracker developer",
    },
    appControl: {
      aria: "Settings and language",
      title: "Cyllene Control",
      subtitle: "Language, account, and night flow in one calm menu.",
      quickAccess: "Quick access",
      profile: "Profile and settings",
      newNight: "Start a new night",
      journal: "Sleep journal",
      language: "Language",
      active: "Active",
      ready: "Ready",
      privacyTitle: "Raw audio stays on your device",
      privacyBody: "Only reports and summary metrics are synced to your account.",
    },
    install: {
      close: "Close",
      openInBrowserTitle: "Open Cyllene in your browser",
      openInBrowserBody: "Chrome, Safari, Yandex… any modern browser works",
      open: "Open",
      promptTitle: "Would you like to install Cyllene Sleep Tracker?",
      iosHint: "Share → Add to Home Screen",
      androidHint: "Tap Install to start",
      browserHint: "Choose Install app from your browser menu",
      cancelled: "Installation cancelled",
      failed: "Installation could not be started",
      oneTap: "Install with one tap",
      download: "Install",
      iosInstructionBefore: "In Safari, use",
      addToHome: "Add to Home Screen",
    },
    recordingPermission: {
      chip: "Microphone permission required",
      note: "When you start, the browser will ask for microphone access; please allow it.",
    },
  },
  ku: {
    brand: {
      developerCredit: "Pêşdebirê Cyllene şopandina xewê",
    },
    appControl: {
      aria: "Mîheng û ziman",
      title: "Kontrola Cyllene",
      subtitle: "Ziman, hesab û herikîna şevê di yek menuyeke aram de.",
      quickAccess: "Gihîştina bilez",
      profile: "Profîl û mîheng",
      newNight: "Dest bi şeveke nû bike",
      journal: "Rojnivîska xewê",
      language: "Ziman",
      active: "Çalak",
      ready: "Amade",
      privacyTitle: "Dengê xav li ser amûra te dimîne",
      privacyBody: "Tenê rapor û metrikên kurte bi hesabê te re tên hevdemkirin.",
    },
    install: {
      close: "Bigire",
      openInBrowserTitle: "Cyllene di gerokê de veke",
      openInBrowserBody: "Chrome, Safari, Yandex… hemû gerokên nûjen baş in",
      open: "Veke",
      promptTitle: "Tu dixwazî Cyllene Şopandina Xewê saz bikî?",
      iosHint: "Parve bike → Li Ekrana Sereke zêde bike",
      androidHint: "Bi tikandina Saz bike, sazkirin dest pê dike",
      browserHint: "Ji menûya gerokê Sazkirina sepanê hilbijêre",
      cancelled: "Sazkirin hate betalkirin",
      failed: "Sazkirin dest pê nekir",
      oneTap: "Bi yek tikandinê saz bike",
      download: "Saz bike",
      iosInstructionBefore: "Di Safari de bi kar bîne",
      addToHome: "Li Ekrana Sereke zêde bike",
    },
    recordingPermission: {
      chip: "Destûra mikrofonê pêwîst e",
      note: "Dema dest pê bikî, gerok dê destûra mikrofonê bixwaze; ji kerema xwe destûr bide.",
    },
    marketing: {
      header: {
        eyebrow: "Hişmendiya xewê",
        startFree: "Belaş dest pê bike",
      },
      hero: {
        eyebrow: "Hişmendiya xewê · analîza li ser amûrê",
        titleLines: ["Xebata şevê", "ya laşê xwe", "xuya", "bike."],
        body:
          "Dema tu dihnivî, Cyllene dixebite. Horîn, kuxik û dengên ji nişka ve çêdibin bi taybetî li ser amûra te têne analîzkirin. Daneyên tevlihev vediguherîne rêbereke tenduristiyê ya zelal ku sibehê bi te re ye.",
        primaryCta: "Belaş dest pê bike",
        secondaryCta: "Têkeve hesabê xwe",
        loggedInCta: "Biçe panelê",
        journalCta: "Rojnivîska xewê",
        assurances: ["Kartê krediyê ne pêwîst e", "Dengê xav nayê barkirin", "Skor û rêzika demê"],
      },
      features: [
        {
          title: "Nîşana xewê li ser amûra te vedikole",
          description:
            "Horîn, kuxik, axaftin û dengên ji nişka ve di telefonê de digire. Tomarên xav ji amûra te dernakevin.",
        },
        {
          title: "Rîtma şevê zelal dike",
          description:
            "Daneyên tevlihev ên şevê vediguherîne kurteya xewê ya têgihiştinbar: dem, tundî û kêliyên girîng.",
        },
        {
          title: "Rapora sibehê zelal dike",
          description:
            "Skora xewê, rêzika demê ya dengê û bûyerên ku dixwazî bibihîzî di yek herikînê de nîşan dide.",
        },
      ],
      reportPreview: {
        title: "Hişmendiya xewê",
        subtitle: "Rapora şevê ya Cyllene · analîza li ser amûrê",
        privacyBadge: "Dengê xav nayê barkirin",
        sleepScore: "Skora xewê",
        calmerThanPrevious: "Li gorî şeva berê %8 aramtir",
        totalSleep: "Xewa tevahî",
        soundTrace: "Şopa dengê",
        markedMoment: "kêliya nîşankirî",
        notAudioFile: "Ne pelê dengê ye; tenê metrikên raporê tên hevdemkirin.",
        detectedMoments: "Kêliyên tespîtkirî",
        playableEvents: "Bûyerên ku dikarin bên guhdarîkirin û rêzika demê ya şevê",
        eventCount: "14 bûyer",
        reportReady: "Kurteya raporê amade ye",
        reportReadyMeta: "Skor · rêzika demê · bûyer",
        nightReport: "Rapora Şevê ya Cyllene",
        sampleDateRange: "09 Tîrmeh · 00:18—07:56",
        processedOnDevice: "Li ser amûrê hate xebitandin",
        sleepSignature: "Îmzeya xewê",
        signatureMeta: "Aramî, şopa dengê û herikîna qonaxan",
        liveAnalysis: "analîza zindî",
        localAudioProtection: "Parastina dengê ya herêmî",
        localAudioProtectionBody:
          "Klîp li ser amûrê dimînin; hesabê te tenê rapor û metrikên kurte hevdem dike.",
        noRawTransfer: "Veguhastina pelê xav tune",
        morningSummaryReady: "Kurteya sibehê amade ye",
        morningSummaryMeta: "Skora zelal · rêzika demê · bûyer",
        exampleReportView: "Nimûneya raporê",
        onDevice: "li ser amûrê",
      },
      eventSamples: {
        snoreCluster: { title: "Komkirina horînê", meta: "36 sn · tundiya nizm" },
        coughSeries: { title: "Rêza kuxikê", meta: "12 sn · bûyereke yekane" },
        suddenNoise: { title: "Dengê ji nişka ve", meta: "8 sn · hate nîşankirin" },
      },
      privacy: {
        title: "Taybetî di navenda sêwiranê de ye",
        rawAudioStaysLocal: "Dengê xav naçe ewrê",
        secureAccount: "Avahiya hesabê ya ewle",
        realtimeAnalysis: "Analîza dem-rast li ser telefonê",
      },
      insight: {
        title: "Ji nîşana xewê ber bi têgihiştinê",
        subtitle: "Sibehê bi wêneyeke zelaltir a xewê dest pê bike.",
        body:
          "Cyllene nîşanên dengê yên şevê vediguherîne raporeke sibehê ya sade. Tevlihevî tune; tenê hûrguliyên zelal hene ku alîkarî dikin tu xewa xwe fam bikî.",
      },
      closing: {
        eyebrow: "Ev şev amade ye",
        title: "Rapora sibehê ya yekem dikare vê şevê amade be.",
        body:
          "Hesabê belaş çêbike, telefonê nêzîkî xwe deyne û rîtma nedîtî ya xewê bi raporeke zelal a sibehê keşf bike.",
        primaryCta: "Hesabê belaş veke",
        secondaryCta: "Hesab çêbike",
      },
      footer: {
        startFree: "Belaş dest pê bike",
      },
    },
  },
} as const satisfies Record<Locale, MessageTree>;

const I18nContext = React.createContext<I18nContextValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return localeOptions.some((option) => option.code === value);
}

function detectLocaleFromLanguageTag(language: string): Locale | null {
  const normalized = language.toLowerCase();
  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("ku") || normalized.startsWith("ckb") || normalized.startsWith("kmr")) {
    return "ku";
  }
  return null;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "tr";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
    if (stored && LEGACY_REMOVED_LOCALES.has(stored)) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable in strict browser modes.
  }

  const preferredLanguages =
    window.navigator.languages && window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language];

  for (const language of preferredLanguages) {
    const detected = detectLocaleFromLanguageTag(language ?? "");
    if (detected) return detected;
  }

  return "tr";
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) return value;
  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)),
    value
  );
}

function translatePath(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
) {
  const catalogLocale = locale === "en" ? "en" : "tr";
  const value =
    getByPath(extraMessages[locale], path) ??
    getByPath(baseMessages[catalogLocale], path) ??
    getByPath(extraMessages.tr, path) ??
    getByPath(baseMessages.tr, path);

  if (typeof value !== "string") return path;
  return interpolate(value, params);
}

function readMessage<T>(locale: Locale, path: string, fallback: T): T {
  const catalogLocale = locale === "en" ? "en" : "tr";
  const value =
    getByPath(extraMessages[locale], path) ??
    getByPath(baseMessages[catalogLocale], path) ??
    getByPath(extraMessages.tr, path) ??
    getByPath(baseMessages.tr, path);

  return value === undefined ? fallback : (value as T);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("tr");

  React.useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }, [locale]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (path, params) => translatePath(locale, path, params),
      m: (path, fallback) => readMessage(locale, path, fallback),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }
  return context;
}
