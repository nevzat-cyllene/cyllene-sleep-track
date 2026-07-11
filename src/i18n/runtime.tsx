"use client";

import * as React from "react";
import { messages as baseMessages } from "@/i18n/messages";

export const localeOptions = [
  { code: "tr", short: "TR", label: "Türkçe", nativeLabel: "Türkçe", dir: "ltr" },
  { code: "en", short: "EN", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ku", short: "KU", label: "Kurdish", nativeLabel: "Kurdî", dir: "ltr" },
  { code: "ar", short: "AR", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "fa", short: "FA", label: "Persian", nativeLabel: "فارسی", dir: "rtl" },
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
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  localizeText: (text: string) => string;
};

const STORAGE_KEY = "cyllene.locale";
const LOCALE_CHANGE_EVENT = "cyllene:locale-change";

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
      title: "Cyllene control",
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
      developerCredit: "Pêşvebirê Cyllene şopandina xewê",
    },
    appControl: {
      aria: "Mîheng û ziman",
      title: "Kontrola Cyllene",
      subtitle: "Ziman, hesab û herikîna şevê di yek menuyeke aram de.",
      quickAccess: "Gihîştina bilez",
      profile: "Profîl û mîheng",
      newNight: "Şeveke nû dest pê bike",
      journal: "Rojnameya xewê",
      language: "Ziman",
      active: "Çalak",
      ready: "Amade",
      privacyTitle: "Dengê xav li ser amûrê te dimîne",
      privacyBody: "Tenê rapor û metrikên kurt bi hesabê te re tên hevdemkirin.",
    },
    install: {
      close: "Bigire",
      openInBrowserTitle: "Cyllene di gerokê de veke",
      openInBrowserBody: "Chrome, Safari, Yandex… hemû baş in",
      open: "Veke",
      promptTitle: "Dixwazî Cyllene Şopandina Xewê saz bikî?",
      iosHint: "Parve bike → Zêde bike ser ekrana sereke",
      androidHint: "Bi tikandina Saz bike, sazkirin dest pê dike",
      browserHint: "Ji menûya gerokê Sazkirina sepanê hilbijêre",
      cancelled: "Sazkirin betal bû",
      failed: "Sazkirin dest pê nekir",
      oneTap: "Bi yek tikandinê saz bike",
      download: "Saz bike",
      iosInstructionBefore: "Di Safari de",
      addToHome: "Zêde bike ser ekrana sereke",
    },
    recordingPermission: {
      chip: "Destûra mikrofonê tê xwestin",
      note: "Dema dest pê bikî, gerok dê destûra mikrofonê bixwaze; ji kerema xwe destûr bide.",
    },
  },
  ar: {
    brand: {
      developerCredit: "مطوّر متتبع النوم Cyllene",
    },
    appControl: {
      aria: "الإعدادات واللغة",
      title: "تحكم Cyllene",
      subtitle: "اللغة والحساب وتدفق الليل في قائمة هادئة واحدة.",
      quickAccess: "وصول سريع",
      profile: "الملف والإعدادات",
      newNight: "ابدأ ليلة جديدة",
      journal: "سجل النوم",
      language: "اللغة",
      active: "نشط",
      ready: "جاهز",
      privacyTitle: "الصوت الخام يبقى على جهازك",
      privacyBody: "تتم مزامنة التقارير والمقاييس المختصرة فقط مع حسابك.",
    },
    install: {
      close: "إغلاق",
      openInBrowserTitle: "افتح Cyllene في المتصفح",
      openInBrowserBody: "Chrome أو Safari أو Yandex… أي متصفح حديث مناسب",
      open: "فتح",
      promptTitle: "هل تريد تثبيت متتبع النوم Cyllene؟",
      iosHint: "مشاركة → إضافة إلى الشاشة الرئيسية",
      androidHint: "اضغط تثبيت لبدء التثبيت",
      browserHint: "اختر تثبيت التطبيق من قائمة المتصفح",
      cancelled: "تم إلغاء التثبيت",
      failed: "تعذر بدء التثبيت",
      oneTap: "تثبيت بلمسة واحدة",
      download: "تثبيت",
      iosInstructionBefore: "في Safari استخدم",
      addToHome: "إضافة إلى الشاشة الرئيسية",
    },
    recordingPermission: {
      chip: "سيُطلب إذن الميكروفون",
      note: "عند البدء سيطلب المتصفح الوصول إلى الميكروفون؛ يرجى السماح.",
    },
  },
  fa: {
    brand: {
      developerCredit: "توسعه‌دهنده ردیاب خواب Cyllene",
    },
    appControl: {
      aria: "تنظیمات و زبان",
      title: "کنترل Cyllene",
      subtitle: "زبان، حساب و جریان شب در یک منوی آرام.",
      quickAccess: "دسترسی سریع",
      profile: "پروفایل و تنظیمات",
      newNight: "شروع شب جدید",
      journal: "دفتر خواب",
      language: "زبان",
      active: "فعال",
      ready: "آماده",
      privacyTitle: "صدای خام روی دستگاه شما می‌ماند",
      privacyBody: "فقط گزارش‌ها و معیارهای خلاصه با حساب شما همگام می‌شوند.",
    },
    install: {
      close: "بستن",
      openInBrowserTitle: "Cyllene را در مرورگر باز کنید",
      openInBrowserBody: "Chrome، Safari، Yandex… هر مرورگر مدرنی مناسب است",
      open: "باز کردن",
      promptTitle: "می‌خواهید ردیاب خواب Cyllene را نصب کنید؟",
      iosHint: "اشتراک‌گذاری → افزودن به صفحه اصلی",
      androidHint: "با زدن نصب، فرایند آغاز می‌شود",
      browserHint: "از منوی مرورگر گزینه نصب برنامه را انتخاب کنید",
      cancelled: "نصب لغو شد",
      failed: "نصب آغاز نشد",
      oneTap: "نصب با یک لمس",
      download: "نصب",
      iosInstructionBefore: "در Safari از",
      addToHome: "افزودن به صفحه اصلی",
    },
    recordingPermission: {
      chip: "اجازه میکروفون لازم است",
      note: "وقتی شروع می‌کنید، مرورگر اجازه دسترسی به میکروفون را می‌خواهد؛ لطفاً اجازه دهید.",
    },
  },
} as const satisfies Record<Locale, MessageTree>;

const manualTextTranslations = {
  ku: {
    "Cyllene Uyku Takipçisi": "Cyllene Şopandina Xewê",
    "Uyku": "Xew",
    "Günlük": "Rojname",
    "Analiz": "Analîz",
    "Profil": "Profîl",
    "İstatistik": "Statîstîk",
    "Ayarlar": "Mîheng",
    "Tema": "Tema",
    "Karanlık": "Tarî",
    "Aydınlık": "Ronî",
    "Sistem": "Sîstem",
    "Yeni gece": "Şeva nû",
    "Hazır": "Amade",
    "Bu gece": "Ev şev",
    "Uyku alanı": "Qada xewê",
    "Arşivin": "Arşîva te",
    "Uyku günlüğü": "Rojnameya xewê",
    "İçgörüler": "Têgihiştin",
    "İstatistikler": "Statîstîk",
    "Hesabın": "Hesabê te",
    "Profil ve ayarlar": "Profîl û mîheng",
    "Geceyi başlat": "Şevê dest pê bike",
    "Rapor arşivi": "Arşîva raporê",
    "Uyku eğilimleri": "Meylên xewê",
    "Hesap ve cihazlar": "Hesab û amûr",
    "Sleep intelligence": "Hişmendiya xewê",
    "Gece kontrolü": "Kontrola şevê",
    "Komuta paneli": "Panela fermanê",
    "Gece akışı hazır": "Herikîna şevê amade ye",
    "Yakında": "Nêzîk de",
    "Güven katmanı": "Qata ewlehiyê",
    "Bu gece hazır": "Ev şev amade ye",
    "Ham ses cihazında kalır": "Dengê xav li ser amûrê te dimîne",
    "Sabah raporu hesabınla senkron görünür.": "Rapora sibehê bi hesabê te re hevdem xuya dike.",
    "Cihaz": "Amûr",
    "Eşleşti": "Hevhatî",
    "Klipler": "Klîp",
    "Yerel": "Herêmî",
    "Ritim": "Rîtm",
    "Planlı": "Plansazkirî",
    "Rutinler": "Rûtîn",
    "Akşam hazırlığı": "Amadekariya êvarê",
    "Ses kasası": "Qutiya dengê",
    "Yerel klipler": "Klîpên herêmî",
    "Cihazlar": "Amûr",
    "Telefon eşleşmeleri": "Hevhatinên telefonê",
    "Takvim": "Salname",
    "Haftalık ritim": "Rîtma heftane",
    "Mahremiyet": "Taybetî",
    "Ham ses yüklenmez": "Dengê xav nayê barkirin",
    "Yerel analiz": "Analîza herêmî",
    "Klip cihazda kalır": "Klîp li ser amûrê dimîne",
    "Hesap kilidi": "Qefla hesabê",
    "Güvenli oturum": "Danişîna ewle",
    "Ücretsiz başla": "Belaş dest pê bike",
    "Hesabına giriş yap": "Têkeve hesabê xwe",
    "Panele git": "Biçe panelê",
    "Kredi kartı gerekmez": "Kartê krediyê ne pêwîst e",
    "Skor ve zaman çizelgesi": "Skor û rêzika demê",
    "Uykunun sessiz dilini keşfedin.": "Zimanê bêdeng ê xewê keşf bike.",
    "Gece modunu başlat": "Moda şevê dest pê bike",
    "Sabaha geç": "Derbasî sibehê bibe",
    "Devam": "Berdewam",
    "Sesi kapat": "Dengê bigire",
    "Sesi aç": "Dengê veke",
    "Cihaz içi akustik tanıma": "Naskirina akustîk li ser amûrê",
    "Nefes ritmi": "Rîtma nefesê",
    "Öksürük": "Kuxik",
    "Çevresel ses": "Dengê derdorê",
    "Gece olayları işaretlenir.": "Bûyerên şevê tên nîşankirin.",
    "Uyku ritmin netleşir.": "Rîtma xewê te zelal dibe.",
    "Kaydı tamamla": "Tomarkirinê biqedîne",
    "Kaydı tamamlamak için yukarı kaydır": "Ji bo qedandina tomarkirinê ber bi jor ve bikşîne",
    "Rapor hazırlanıyor…": "Rapor tê amade kirin…",
    "Sil": "Jê bibe",
    "Vazgeç": "Betal bike",
    "Siliniyor...": "Tê jêbirin...",
    "Gece kaydı silindi.": "Tomara şevê hate jêbirin.",
    "Gece kaydı silinemedi.": "Tomara şevê nehat jêbirin.",
  },
  ar: {
    "Cyllene Uyku Takipçisi": "متتبع النوم Cyllene",
    "Uyku": "النوم",
    "Günlük": "السجل",
    "Analiz": "التحليل",
    "Profil": "الملف",
    "İstatistik": "الإحصاءات",
    "Ayarlar": "الإعدادات",
    "Tema": "المظهر",
    "Karanlık": "داكن",
    "Aydınlık": "فاتح",
    "Sistem": "النظام",
    "Yeni gece": "ليلة جديدة",
    "Hazır": "جاهز",
    "Bu gece": "هذه الليلة",
    "Uyku alanı": "مساحة النوم",
    "Arşivin": "أرشيفك",
    "Uyku günlüğü": "سجل النوم",
    "İçgörüler": "رؤى",
    "İstatistikler": "الإحصاءات",
    "Hesabın": "حسابك",
    "Profil ve ayarlar": "الملف والإعدادات",
    "Geceyi başlat": "ابدأ الليل",
    "Rapor arşivi": "أرشيف التقارير",
    "Uyku eğilimleri": "اتجاهات النوم",
    "Hesap ve cihazlar": "الحساب والأجهزة",
    "Sleep intelligence": "ذكاء النوم",
    "Gece kontrolü": "تحكم الليل",
    "Komuta paneli": "لوحة الأوامر",
    "Gece akışı hazır": "تدفق الليل جاهز",
    "Yakında": "قريباً",
    "Güven katmanı": "طبقة الثقة",
    "Bu gece hazır": "جاهز لهذه الليلة",
    "Ham ses cihazında kalır": "الصوت الخام يبقى على جهازك",
    "Sabah raporu hesabınla senkron görünür.": "يظهر تقرير الصباح متزامناً مع حسابك.",
    "Cihaz": "الجهاز",
    "Eşleşti": "مقترن",
    "Klipler": "المقاطع",
    "Yerel": "محلي",
    "Ritim": "الإيقاع",
    "Planlı": "مخطط",
    "Rutinler": "الروتينات",
    "Akşam hazırlığı": "تحضير المساء",
    "Ses kasası": "خزنة الصوت",
    "Yerel klipler": "مقاطع محلية",
    "Cihazlar": "الأجهزة",
    "Telefon eşleşmeleri": "اقترانات الهاتف",
    "Takvim": "التقويم",
    "Haftalık ritim": "إيقاع أسبوعي",
    "Mahremiyet": "الخصوصية",
    "Ham ses yüklenmez": "لا يتم رفع الصوت الخام",
    "Yerel analiz": "تحليل محلي",
    "Klip cihazda kalır": "المقطع يبقى على الجهاز",
    "Hesap kilidi": "قفل الحساب",
    "Güvenli oturum": "جلسة آمنة",
    "Ücretsiz başla": "ابدأ مجاناً",
    "Hesabına giriş yap": "سجّل الدخول",
    "Panele git": "اذهب إلى اللوحة",
    "Kredi kartı gerekmez": "لا حاجة لبطاقة ائتمان",
    "Skor ve zaman çizelgesi": "النتيجة والخط الزمني",
    "Uykunun sessiz dilini keşfedin.": "اكتشف اللغة الصامتة للنوم.",
    "Gece modunu başlat": "ابدأ وضع الليل",
    "Sabaha geç": "انتقل إلى الصباح",
    "Devam": "متابعة",
    "Sesi kapat": "كتم الصوت",
    "Sesi aç": "تشغيل الصوت",
    "Cihaz içi akustik tanıma": "تعرف صوتي داخل الجهاز",
    "Nefes ritmi": "إيقاع التنفس",
    "Öksürük": "السعال",
    "Çevresel ses": "الصوت المحيط",
    "Gece olayları işaretlenir.": "يتم تمييز أحداث الليل.",
    "Uyku ritmin netleşir.": "يتضح إيقاع نومك.",
    "Kaydı tamamla": "إنهاء التسجيل",
    "Kaydı tamamlamak için yukarı kaydır": "اسحب للأعلى لإنهاء التسجيل",
    "Rapor hazırlanıyor…": "يتم تجهيز التقرير…",
    "Sil": "حذف",
    "Vazgeç": "إلغاء",
    "Siliniyor...": "جارٍ الحذف...",
    "Gece kaydı silindi.": "تم حذف تسجيل الليل.",
    "Gece kaydı silinemedi.": "تعذر حذف تسجيل الليل.",
  },
  fa: {
    "Cyllene Uyku Takipçisi": "ردیاب خواب Cyllene",
    "Uyku": "خواب",
    "Günlük": "دفتر",
    "Analiz": "تحلیل",
    "Profil": "پروفایل",
    "İstatistik": "آمار",
    "Ayarlar": "تنظیمات",
    "Tema": "تم",
    "Karanlık": "تیره",
    "Aydınlık": "روشن",
    "Sistem": "سیستم",
    "Yeni gece": "شب جدید",
    "Hazır": "آماده",
    "Bu gece": "امشب",
    "Uyku alanı": "فضای خواب",
    "Arşivin": "آرشیو شما",
    "Uyku günlüğü": "دفتر خواب",
    "İçgörüler": "بینش‌ها",
    "İstatistikler": "آمار",
    "Hesabın": "حساب شما",
    "Profil ve ayarlar": "پروفایل و تنظیمات",
    "Geceyi başlat": "شروع شب",
    "Rapor arşivi": "آرشیو گزارش",
    "Uyku eğilimleri": "روندهای خواب",
    "Hesap ve cihazlar": "حساب و دستگاه‌ها",
    "Sleep intelligence": "هوش خواب",
    "Gece kontrolü": "کنترل شب",
    "Komuta paneli": "پنل فرمان",
    "Gece akışı hazır": "جریان شب آماده است",
    "Yakında": "به‌زودی",
    "Güven katmanı": "لایه اعتماد",
    "Bu gece hazır": "امشب آماده است",
    "Ham ses cihazında kalır": "صدای خام روی دستگاه شما می‌ماند",
    "Sabah raporu hesabınla senkron görünür.": "گزارش صبح با حساب شما همگام نمایش داده می‌شود.",
    "Cihaz": "دستگاه",
    "Eşleşti": "متصل",
    "Klipler": "کلیپ‌ها",
    "Yerel": "محلی",
    "Ritim": "ریتم",
    "Planlı": "برنامه‌ریزی‌شده",
    "Rutinler": "روتین‌ها",
    "Akşam hazırlığı": "آمادگی شب",
    "Ses kasası": "صندوق صدا",
    "Yerel klipler": "کلیپ‌های محلی",
    "Cihazlar": "دستگاه‌ها",
    "Telefon eşleşmeleri": "اتصال‌های تلفن",
    "Takvim": "تقویم",
    "Haftalık ritim": "ریتم هفتگی",
    "Mahremiyet": "حریم خصوصی",
    "Ham ses yüklenmez": "صدای خام بارگذاری نمی‌شود",
    "Yerel analiz": "تحلیل محلی",
    "Klip cihazda kalır": "کلیپ روی دستگاه می‌ماند",
    "Hesap kilidi": "قفل حساب",
    "Güvenli oturum": "نشست امن",
    "Ücretsiz başla": "رایگان شروع کنید",
    "Hesabına giriş yap": "وارد حساب شوید",
    "Panele git": "رفتن به پنل",
    "Kredi kartı gerekmez": "نیازی به کارت اعتباری نیست",
    "Skor ve zaman çizelgesi": "امتیاز و خط زمانی",
    "Uykunun sessiz dilini keşfedin.": "زبان خاموش خواب را کشف کنید.",
    "Gece modunu başlat": "حالت شب را شروع کنید",
    "Sabaha geç": "رفتن به صبح",
    "Devam": "ادامه",
    "Sesi kapat": "صدا را ببند",
    "Sesi aç": "صدا را روشن کن",
    "Cihaz içi akustik tanıma": "تشخیص آکوستیک درون دستگاه",
    "Nefes ritmi": "ریتم تنفس",
    "Öksürük": "سرفه",
    "Çevresel ses": "صدای محیط",
    "Gece olayları işaretlenir.": "رویدادهای شب علامت‌گذاری می‌شوند.",
    "Uyku ritmin netleşir.": "ریتم خواب شما روشن‌تر می‌شود.",
    "Kaydı tamamla": "پایان ضبط",
    "Kaydı tamamlamak için yukarı kaydır": "برای پایان ضبط به بالا بکشید",
    "Rapor hazırlanıyor…": "گزارش در حال آماده‌سازی است…",
    "Sil": "حذف",
    "Vazgeç": "لغو",
    "Siliniyor...": "در حال حذف...",
    "Gece kaydı silindi.": "ضبط شب حذف شد.",
    "Gece kaydı silinemedi.": "ضبط شب حذف نشد.",
  },
} as const satisfies Record<Exclude<Locale, "tr" | "en">, Record<string, string>>;

const I18nContext = React.createContext<I18nContextValue | null>(null);

function isLocale(value: string | null | undefined): value is Locale {
  return localeOptions.some((option) => option.code === value);
}

function getLocaleDirection(locale: Locale) {
  return localeOptions.find((option) => option.code === locale)?.dir ?? "ltr";
}

function detectLocaleFromLanguageTag(language: string): Locale | null {
  const normalized = language.toLowerCase();
  if (normalized.startsWith("tr")) return "tr";
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("ku") || normalized.startsWith("ckb") || normalized.startsWith("kmr")) {
    return "ku";
  }
  if (normalized.startsWith("ar")) return "ar";
  if (normalized.startsWith("fa") || normalized.startsWith("per") || normalized.startsWith("prs")) {
    return "fa";
  }
  return null;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "tr";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
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

function flattenPairs(
  source: unknown,
  target: unknown,
  pairs: Record<string, string>,
) {
  if (typeof source === "string" && typeof target === "string") {
    if (source && target) pairs[source] = target;
    return;
  }

  if (Array.isArray(source) && Array.isArray(target)) {
    source.forEach((item, index) => flattenPairs(item, target[index], pairs));
    return;
  }

  if (source && target && typeof source === "object" && typeof target === "object") {
    Object.keys(source as Record<string, unknown>).forEach((key) => {
      flattenPairs(
        (source as Record<string, unknown>)[key],
        (target as Record<string, unknown>)[key],
        pairs
      );
    });
  }
}

function flattenExtraPairs(locale: Locale, pairs: Record<string, string>) {
  flattenPairs(extraMessages.tr, extraMessages[locale], pairs);
}

const englishTextPairs = (() => {
  const pairs: Record<string, string> = {};
  flattenPairs(baseMessages.tr, baseMessages.en, pairs);
  flattenExtraPairs("en", pairs);
  return pairs;
})();

const localeTextPairs: Record<Locale, Record<string, string>> = {
  tr: {},
  en: englishTextPairs,
  ku: { ...manualTextTranslations.ku },
  ar: { ...manualTextTranslations.ar },
  fa: { ...manualTextTranslations.fa },
};

(["ku", "ar", "fa"] as const).forEach((locale) => {
  flattenExtraPairs(locale, localeTextPairs[locale]);
});

const reverseTextPairs = (() => {
  const pairs: Record<string, string> = {};
  Object.entries(localeTextPairs).forEach(([locale, translations]) => {
    if (locale === "tr") return;
    Object.entries(translations).forEach(([source, target]) => {
      pairs[target] = source;
    });
  });
  return pairs;
})();

function localizePlainText(text: string, locale: Locale) {
  if (!text.trim()) return text;

  const prefix = text.match(/^\s*/)?.[0] ?? "";
  const suffix = text.match(/\s*$/)?.[0] ?? "";
  const core = text.slice(prefix.length, text.length - suffix.length);
  const source = reverseTextPairs[core] ?? core;

  if (locale === "tr") return `${prefix}${source}${suffix}`;

  const translated =
    localeTextPairs[locale][source] ??
    (locale === "en" ? undefined : englishTextPairs[source]) ??
    source;

  return `${prefix}${translated}${suffix}`;
}

function translatePath(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
) {
  const source =
    getByPath(extraMessages.tr, path) ??
    getByPath(baseMessages.tr, path);
  const localizedExtra = getByPath(extraMessages[locale], path);
  const english =
    getByPath(extraMessages.en, path) ??
    getByPath(baseMessages.en, path);
  const catalog =
    locale === "tr"
      ? source
      : locale === "en"
        ? english
        : typeof source === "string"
          ? localizePlainText(source, locale)
          : english;

  const value = localizedExtra ?? catalog ?? source;
  if (typeof value !== "string") return path;
  return interpolate(value, params);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("tr");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: nextLocale }));
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const direction = getLocaleDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, mounted]);

  const value = React.useMemo<I18nContextValue>(() => {
    const direction = getLocaleDirection(locale);
    return {
      locale,
      direction,
      setLocale,
      t: (path, params) => translatePath(locale, path, params),
      localizeText: (text) => localizePlainText(text, locale),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }
  return context;
}

function shouldSkipNode(node: Node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  if (!element) return false;
  return Boolean(element.closest("script,style,textarea,input,code,pre,[data-i18n-skip]"));
}

function localizeElementAttributes(element: Element, localizeText: (text: string) => string) {
  ["aria-label", "placeholder", "title", "alt"].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;
    const localized = localizeText(value);
    if (localized !== value) element.setAttribute(attribute, localized);
  });
}

function localizeDomTree(root: ParentNode, localizeText: (text: string) => string) {
  if (root instanceof Element) localizeElementAttributes(root, localizeText);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue ?? "";
      const localized = localizeText(value);
      if (localized !== value) node.nodeValue = localized;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      localizeElementAttributes(node as Element, localizeText);
    }

    node = walker.nextNode();
  }
}

export function LocalizedTextBridge() {
  const { localizeText, locale } = useI18n();

  React.useEffect(() => {
    let frame = 0;

    const run = () => {
      frame = 0;
      localizeDomTree(document.body, localizeText);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(run);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label", "placeholder", "title", "alt"],
    });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale, localizeText]);

  return null;
}
