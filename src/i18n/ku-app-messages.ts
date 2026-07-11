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
    delete: "Jê bibe",
    deleting: "Tê jêbirin...",
    cancel: "Betal bike",
    secondsShort: "çrk",
    minutesShort: "dq",
    event: "bûyer",
    events: "bûyer",
  },
  brand: {
    developerCredit: "Pêşvebirê Cyllene Şopandina Xewê",
  },
  formatting: {
    locale: "ku",
    durationHourMinute: "{{hours}}d {{minutes}}dq",
    durationMinute: "{{minutes}}dq",
    timeRangeSeparator: "–",
    eventDurationSeparator: "·",
  },
  deleteConfirm: {
    closeAria: "Pejirandina jêbirinê bigire",
    cancelAria: "Betal bike",
    defaultConfirm: "Jê bibe",
    pending: "Tê jêbirin...",
    cancel: "Betal bike",
  },
  dashboard: {
    sleepScore: "Skora Xewê",
    noSavedNights: "Hîn şeva tomarî tune.",
    startFirstNight: "Tomara şeva yekem dest pê bike →",
  },
  sleepHub: {
    guestSavedLocally: "Bê têketin tomar li ser amûrê hate hilanîn.",
    eyebrow: "Rîtma xewê amade ye",
    trustBadge: "Analîza li ser amûrê",
    title: "Şev baş.",
    greetings: {
      morning: "Sibeh baş.",
      afternoon: "Dem baş.",
      evening: "Êvar baş.",
      night: "Şev baş.",
    },
    body: "Telefonê nêzîkî xwe deyne; Cyllene nîşanên şevê vediguherîne rapora sibehê.",
    startTonight: "Dest bi îşevê bike",
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
    estimatedStages: "Qonaxên xewê yên texmînî",
    noSoundData: "Ji bo vê şevê dane ya dengê tune",
    stages: {
      awake: "Hişyar",
      light: "Xew",
      deep: "Xewa kûr",
    },
  },
  events: {
    types: {
      snore: { title: "Horîn", unit: "horîn" },
      cough: { title: "Kuxik", unit: "kuxik" },
      talk: { title: "Axaftin", unit: "axaftin" },
      noise: { title: "Tevger / dengê derve", unit: "tevger" },
      generic: { title: "Bûyera dengê", unit: "bûyer" },
      noiseLegacy: "Deng",
    },
    noEventsDetected: "Hîn bûyer nehat tespîtkirin.",
    noEventsTonight: "Vê şevê bûyer nehat tespîtkirin.",
    noEventsForTonight: "Ji bo vê şevê bûyerên tespîtkirî tune.",
    zeroEvents: "0 bûyer",
    detected: "bûyer hate tespîtkirin",
    notDetected: "bûyer nehat tespîtkirin",
    deleteSuccess: "Bûyer hate jêbirin.",
    deleteError: "Bûyer nehat jêbirin.",
    deleteRemoteTitle: "Tu dixwazî vê bûyera dengê jê bibî?",
    deleteRemoteDescription:
      "Bûyer ji lîsteyê tê rakirin; heke klîpa dengê hebe ew jî tê paqijkirin.",
    deleteLocalTitle: "Tu dixwazî vê bûyera dengê ya herêmî jê bibî?",
    deleteLocalDescription: "Bûyer û klîpa dengê ya li ser telefonê ji amûrê tên rakirin.",
    deleteConfirm: "Bûyerê jê bibe",
  },
  welcome: {
    premiumEntrance: {
      headerSubtitle: "Zekîya xewê",
      soundOff: "Dengê bigire",
      soundOn: "Dengê veke",
      preStart: {
        eyebrow: "Dema heyv bilind dibe",
        title: "Zimanê bêdeng ê xewê keşf bike.",
        body:
          "Xew çîrokek e ku laşê te bi şevê vedibêje. Cyllene bi naskirina akustîk a jîr li ser amûrê wê çîrokê analîz dike.",
        cta: "Moda şevê dest pê bike",
        acousticRecognition: "Naskirina akustîk a li ser amûrê",
        signals: ["Rîtma nefesê", "Kuxîn", "Dengê jîngehê"],
      },
      moments: [
        {
          eyebrow: "Analîza li ser amûrê",
          title: "Dengê xav li ser amûrê dimîne.",
          body: "Cyllene nîşanên dengê şevê li ser telefona te dixebitîne.",
        },
        {
          eyebrow: "Cyllene",
          title: "Bûyerên şevê têne nîşankirin.",
          body: "Xerxere, kuxîn û dengên nişkê di rapora sibehê de dibin kêliyên xwendî.",
        },
        {
          eyebrow: "Rapora sibehê",
          title: "Rîtma xewê ya te zelal dibe.",
          body: "Skor, rêzika demê û kêliyên tespîtkirî wekî kurteyek sade vedibin.",
        },
      ],
      continue: "Berdewam",
      goMorning: "Here sibehê",
      ambianceOn: "Ambîyansa heyvê vekirî ye",
      soundStartsOnTouch: "Deng bi destlêdanê dest pê dike",
    },
  },
  marketing: {
    header: {
      eyebrow: "Zekîya xewê",
      startFree: "Bêpere dest pê bike",
      startShort: "Dest pê bike",
    },
    hero: {
      eyebrow: "Zekîya xewê · analîza li ser amûrê",
      titleLines: ["Tiştên ku laşê te", "di şevê de dike", "diyar", "bike."],
      body:
        "Dema tu dinê, Cyllene dixebite. Di şevê de dengên xurt û bêdeng li ser amûra te bi taybetî analîz dike. Daneyên tevlihev vediguherîne rêbera tenduristiyê ya sibehê.",
      primaryCta: "Bêpere dest pê bike",
      secondaryCta: "Têkeve hesabê xwe",
      loggedInCta: "Here panelê",
      journalCta: "Rojnivîska xewê",
      assurances: [
        "Karta krediyê nabe",
        "Dengê xav nayê barkirin",
        "Skor û rêzika demê",
      ],
    },
    features: [
      {
        title: "Nîşana xewê li ser amûra te vedibêje",
        description:
          "Xurtbûn, qehirandin, axaftin û dengên bêdeng li ser telefona te digire. Tomarên xav ji amûra te dernakevin.",
      },
      {
        title: "Rîtma şevê sade dike",
        description:
          "Daneyên tevlihev ên şevê vediguherîne kurteyek xewê ya zelal bi dem, tundî û demên girîng.",
      },
      {
        title: "Rapora sibehê zelal dike",
        description:
          "Skora xewê, rêzika demê ya dengê û bûyerên ku tu dixwazî bibihîsî di yek herikînê de pêşkêş dike.",
      },
    ],
    reportPreview: {
      title: "Zekîya xewê",
      subtitle: "Rapora şevê ya Cyllene · analîza li ser amûrê",
      privacyBadge: "Dengê xav nayê barkirin",
      sleepScore: "Skora xewê",
      calmerThanPrevious: "%8 aramtir ji şeva berê",
      totalSleep: "Xewa tevahî",
      soundTrace: "Nîşana dengê",
      markedMoment: "demê nîşankirî",
      privacyLabel: "Nepenî",
      calmerMeta: "+%8 aramî",
      totalSleepValue: "7d 42dq",
      stageLight: "Sivik",
      stageDeep: "Kûr",
      stageRem: "REM",
      notAudioFile: "Ne pelê dengê ye; tenê metrikên raporê tê hevgirtin.",
      detectedMoments: "Demên hatine dîtin",
      playableEvents: "Bûyerên guhdarkirî û rêzika demê ya şevê",
      eventCount: "14 bûyer",
      reportReady: "Kurteya raporê amade ye",
      reportReadyMeta: "Skor · rêzika demê · bûyer",
      nightReport: "Rapora Şevê ya Cyllene",
      sampleDateRange: "9 Tîrmeh · 00:18—07:56",
      processedOnDevice: "Li ser amûrê hatiye pêvajokirin",
      sleepSignature: "Îmzeya xewê",
      signatureMeta: "Aramî, nîşana dengê û herikîna qonaxan",
      liveAnalysis: "analîza zindî",
      localAudioProtection: "Parastina dengê ya herêmî",
      localAudioProtectionBody:
        "Klîp li ser amûrê dimînin; hesabê te tenê rapor û metrikên kurteyê hev dike.",
      noRawTransfer: "Veguhastina pelê xav tune",
      morningSummaryReady: "Kurteya sibehê amade ye",
      morningSummaryMeta: "Skorê zelal · rêzika demê · bûyer",
      exampleReportView: "Nîşana rapora nimûneyê",
      onDevice: "li ser amûrê",
    },
    eventSamples: {
      snoreCluster: { title: "Komkirina xurtbûnê", meta: "36 sn · tundiya kêm" },
      coughSeries: { title: "Rêza qehirandinê", meta: "12 sn · bûyera yekane" },
      suddenNoise: { title: "Dengê bêdeng", meta: "8 sn · hat nîşankirin" },
    },
    privacy: {
      title: "Nepenî di navenda sêwiranê de ye",
      rawAudioStaysLocal: "Dengê xav naçe ewrê",
      secureAccount: "Avahiya hesabê ya ewle",
      realtimeAnalysis: "Analîza demrast li ser telefona te",
    },
    insight: {
      title: "Ji nîşana xewê heya têgihîştinê",
      subtitle: "Bi wêneyek xewê ya zelaltir sibehê dest pê bike.",
      body:
        "Cyllene nîşanên dengê yên şevê vediguherîne raporeke sibehê ya sade. Bê tevlihevî; tenê hûrguliyên ku alîkariya te dikin ku xewa xwe fêm bikî.",
    },
    closing: {
      eyebrow: "Îşev amade ye",
      title: "Rapora sibehê ya yekem dibe ku îşev amade be.",
      body:
        "Hesabeke belaş çêke, telefonê nêzîkî xwe bide û rîtma nedîyar a xewa xwe bi raporeke sibehê ya zelal veke.",
      primaryCta: "Hesaba xwe ya belaş veke",
      secondaryCta: "Hesab çêke",
    },
    footer: {
      login: "Têkeve",
      createAccount: "Hesab çêke",
      startFree: "Bêpere dest pê bike",
      panel: "Panel",
      profile: "Profîl",
    },
  },
  auth: {
    signupForm: {
      login: "Têkeve",
    },
  },
} as const satisfies Record<string, unknown>;

export type KuAppMessages = typeof kuAppMessages;

/** Merge helper typing for Locale overlays */
export const kuLocaleBundle: Record<"ku", typeof kuAppMessages> = {
  ku: kuAppMessages,
};
