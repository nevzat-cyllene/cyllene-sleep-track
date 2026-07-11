import type { Locale } from "@/i18n/locales";

/** Phase-1 chrome + control menu strings (full page catalogs stay in messages.ts). */
export const chromeMessages = {
  tr: {
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
  },
  en: {
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
      privacyBody: "Only reports and summary metrics sync to your account.",
    },
  },
  ku: {
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
      privacyTitle: "Dengê xav li ser amûrê dimîne",
      privacyBody: "Tenê rapor û metrikên kurte bi hesabê te re tên hevdemkirin.",
    },
    navigation: {
      primary: {
        sleep: { label: "Xew", description: "Dest bi îşevê bike" },
        journal: { label: "Rojnivîsk", description: "Arşîva raporê" },
        statistics: { label: "Statîstîk", description: "Meylên xewê" },
        profile: { label: "Profîl", description: "Hesab û amûr" },
      },
      mobile: {
        sleep: "Xew",
        journal: "Rojnivîsk",
        analysis: "Analîz",
        profile: "Profîl",
      },
      topbar: {
        sleep: { eyebrow: "Îşev", title: "Qada xewê" },
        journal: { eyebrow: "Arşîva te", title: "Rojnivîska xewê" },
        statistics: { eyebrow: "Têgihiştin", title: "Statîstîk" },
        profile: { eyebrow: "Hesabê te", title: "Profîl û mîheng" },
        newNight: "Şeva nû",
        ready: "Amade",
      },
      sidebar: {
        brandSubtitle: "Hişmendiya xewê",
        nightControl: "Kontrola şevê",
        commandPanel: "Panela fermanê",
        nightFlowReady: "Herikîna şevê amade ye",
        upcoming: "Di nêzîk de",
        trustLayer: "Tebeqeya baweriyê",
        tonightReady: "Îşev amade",
        syncedReportHint:
          "Dengê xav li ser amûrê dimîne. Rapora sibehê bi hesabê te re hevdem xuya dibe.",
        commandTiles: {
          device: { label: "Amûr", value: "Hevgirtî" },
          clips: { label: "Klîp", value: "Herêmî" },
          rhythm: { label: "Rîtm", value: "Plansaz" },
        },
        upcomingItems: {
          routines: { label: "Rutin", description: "Amadekirina êvarê", badge: "Nêzîk" },
          audioVault: { label: "Kasaya dengê", description: "Klîpên herêmî", badge: "Amûr" },
          devices: { label: "Amûr", description: "Hevgirtina telefonê", badge: "Beta" },
          calendar: { label: "Salname", description: "Rîtma heftane", badge: "Plan" },
        },
        trustItems: {
          privacy: { label: "Taybetî", description: "Dengê xav nayê barkirin" },
          localAnalysis: { label: "Analîza herêmî", description: "Klîp li ser amûrê dimîne" },
          accountLock: { label: "Kilîda hesabê", description: "Danişîna ewle" },
        },
      },
    },
    common: {
      live: "Live",
      ready: "Amade",
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;
