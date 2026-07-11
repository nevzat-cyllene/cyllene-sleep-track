import type { Locale } from "@/i18n/locales";

/**
 * KU overlays for Phase-2 app screens (Kurmanji Latin).
 * Missing keys still fall back to EN catalog.
 */
export const kuAppMessages = {
  common: {
    emDash: "—",
    preparing: "Tê amadekirin...",
    screenPreparing: "Ekran tê amadekirin",
    flowEyebrow: "Cyllene Flow",
    live: "Live",
    ready: "Amade",
    loadingDots: "Tê barkirin...",
  },
  formatting: {
    locale: "ku",
  },
  sleepHub: {
    guestSavedLocally: "Bê têketin tomar li ser amûrê hate hilanîn.",
    eyebrow: "Rîtma xewê amade ye",
    trustBadge: "Analîza li ser amûrê",
    title: "Şev baş.",
    body: "Telefonê nêzîkî xwe deyne; Cyllene nîşanên şevê vediguherîne rapora sibehê.",
    startTonight: "Dest bi vê şevê bike",
    lastNight: "Şeva dawî",
    totalSleep: "Xewa tevahî",
    soundEvent: "Bûyera dengê",
    firstReportEyebrow: "Rapora te ya yekem",
    firstReportTitle: "Sibehê li vir çîrokekê hebe.",
    firstReportBody:
      "Dema şeva yekem temam bibe, skora xewê, bûyerên dengê û rêzika demê li vir xuya dibin.",
    nightArchive: "Arşîva şevê",
    nightArchiveBody: "Hemû tomar, klîp û raporên sibehê di yek cihî de binerê.",
    viewPastNights: "Li şevên berê binêre",
  },
  journal: {
    deleteSuccess: "Tomara şevê hate jêbirin.",
    deleteError: "Tomara şevê nehat jêbirin.",
    archiveEyebrow: "Arşîva şevê",
    title: "Rojnivîska xewê",
    emptyTitle: "Rûpela te ya yekem hîn vala ye.",
    emptyBody: "Dema tomara şeva yekem temam bibe, rapor û bûyerên dengê li vir xuya dibin.",
    emptyCta: "Dest bi şeva yekem bike",
    body: "Şevên berê, skor û tomarên dengê.",
    nights: "Şev",
    averageScore: "Skora navîn",
    scorePrefix: "Skor {{score}}",
    scoreEmpty: "Skor tune",
    deleteSessionTitle: "Tu dixwazî vê tomara şevê jê bibî?",
    deleteSessionDescription:
      "Rapor, rêzika demê û tomarên hevdem ji Cyllene bi awayekî mayînde tên rakirin.",
    deleteSessionConfirm: "Şevê jê bibe",
    deleteSwipeLabel: "Tomara xewê jê bibe",
    notFound: "Tomar nehat dîtin.",
  },
  profile: {
    title: "Profîl",
    subtitle: "Hesab û mîhengên sepanê",
    accountTitle: "Hesab",
    email: "E-name",
    plan: "Plan",
    sleepProfile: "Profîla xewê ya te",
    appCardTitle: "Sepan",
    pwaHelp: "Ji bo tomara şevê sepanê li ekrana sereke zêde bike û têxe şarjê.",
    logout: "Derkeve",
  },
  statistics: {
    eventLabels: {
      snore: "Horîn",
      cough: "Kuxik",
      talk: "Axaftin",
      noise: "Tevger / dengê derve",
    },
    eyebrow: "Têgihiştinên xewê",
    title: "Rîtma xwe keşf bike.",
    body: "Kurteya ji tomarên rastîn: kalîteya xewê, şopa dengê û rêkûpêkiyê.",
    nightsAnalyzed: "{{count}} şev hatin analîzkirin",
    trendView: "Dîtina meylê",
    trendBody: "Dema berawird bike û guhertinê bişopîne.",
    periods: {
      days: "Roj",
      weeks: "Hefte",
      months: "Meh",
      all: "Hemû",
    },
    trendCards: {
      quality: {
        title: "Kalîteya xewê",
        description: "Navîniya skorên şevê ya demê",
      },
      regularity: {
        title: "Rêkûpêkî",
        description: "Domdariya demjimêrên xewê",
      },
    },
    signature: {
      eyebrow: "Îmzeya xewê",
      title: "Profîla şevê ji tomarên rastîn.",
      duration: "Dem",
      soundTrace: "Şopa dengê",
      scoreRhythm: "Rîtma skorê",
      sleepDuration: "Demjimêra xewê",
      calmness: "Aramî",
      realDataNote:
        "Ev beş maket nîne; ji tomarên şevê yên hevdemkirî tê hesabkirin.",
      emptyNote: "Piştî tomara şeva yekem ev îmze bixweber çêdibe.",
    },
    detectedMoments: {
      eyebrow: "Kêliyên tespîtkirî",
      title: "Bûyerên dengê di herikîna analîzê de.",
      eventCount: "{{count}} bûyer",
      emptyDistribution:
        "Piştî bûyerên yekem ên tespîtkirî, belavbûna rastîn li vir xuya dibe.",
    },
    premium: {
      eyebrow: "Cyllene Premium",
      title: "Têgihiştinên kûrtir ji bo plana endamê têne amadekirin.",
      body: "Analîza kûrtir, dîroka bê sînor û raporên pêşketî li rê ne.",
      cta: "Endametiya Premium di nêzîk de",
    },
    chartEmptyTitle: "Hîn dane têra xwe nîne.",
    chartEmptyBody: "Piştî çend şevan meyl li vir çêdibe.",
  },
  recording: {
    setup: {
      readyEyebrow: "Analîza Cyllene amade ye",
      compactTitle: "Tu amade yî ku rîtma xewê tomar bikî?",
      compactBody:
        "Telefonê nêzîkî xwe deyne. Deng li ser amûrê têne analîzkirin û tomarên xav naçin ewrê.",
      realtimeAnalysis: "Analîza dem-rast",
      staysOnDevice: "Li ser amûrê dimîne",
      loading: "Tê amadekirin...",
      startSleepMode: "Moda xewê dest pê bike",
      fullTitle: "Dest bi tomara şevê bike",
      fullBody: "Analîza dengê li ser telefonê tê kirin. Dengê xav nayê şandin.",
    },
    sleepMode: {
      now: "Niha",
      sleepDuration: "Demjimêra xewê",
      recordingContinues: "Tomar berdewam e",
      screenMayTurnOff: "Ekran dikare bigire",
      recordingMayStop: "Tomar dikare raweste",
      ambientSound: "Dengê derdorê",
    },
    stop: {
      finishing: "Rapor tê amadekirin…",
      finishRecording: "Tomarê temam bike",
      swipeToFinish: "Ji bo temamkirinê ber bi jorê bikişîne",
    },
    analysisHandoff: {
      eyebrow: "Analîz tê amadekirin",
      title: "Tomara şevê dibe rapor.",
      body: "Cyllene şopên dengê dinirxîne, bûyeran vediqetîne û kurteya sibehê amade dike.",
      duration: "Dem",
      inspectedEvent: "Bûyera nirxandî",
    },
    errors: {
      microphoneDenied: "Destûra mikrofonê hate redkirin. Ji kerema xwe destûr bide.",
    },
  },
  sessionDetail: {
    loading: "Tê barkirin...",
    title: "Dengên şevê guhdarî bike",
    localTitle: "Tomara şevê",
    localNotFound: "Tomara herêmî nehat dîtin.",
    backToJournal: "Vegere rojnivîskê",
    localUnsynced:
      "Ev tomar hîn bi ewrê re nehatiye hevdemkirin. Bûyer û klîp li ser amûrê ne.",
    syncing: "Tê hevdemkirin...",
    retry: "Dîsa biceribîne",
    syncSuccess: "Tomar hate hevdemkirin.",
    timeInBed: "Demê li ser nivînê",
    estimatedSleep: "Xewa texmînî",
    detectedEvents: "Bûyerên tespîtkirî",
    detectedEventsWithCount: "Bûyerên tespîtkirî ({{count}})",
    noEvents: "Vê şevê bûyer nehat tespîtkirin.",
    quality: "Kalîte",
  },
  events: {
    noEventsDetected: "Hîn bûyer nehat tespîtkirin.",
    deleteSuccess: "Bûyer hate jêbirin.",
    deleteError: "Bûyer nehat jêbirin.",
    deleteRemoteTitle: "Tu dixwazî vê bûyera dengê jê bibî?",
    deleteLocalTitle: "Tu dixwazî vê bûyera dengê ya herêmî jê bibî?",
    deleteConfirm: "Bûyerê jê bibe",
  },
} as const satisfies Record<string, unknown>;

export type KuAppMessages = typeof kuAppMessages;

/** Merge helper typing for Locale overlays */
export const kuLocaleBundle: Record<"ku", typeof kuAppMessages> = {
  ku: kuAppMessages,
};
