import { chromeMessages } from "@/i18n/chrome-messages";
import { kuAppMessages } from "@/i18n/ku-app-messages";
import { LOCALE_STORAGE_KEY, parseLocale, type Locale } from "@/i18n/locales";
import { messages, type MessageLocale } from "@/i18n/messages";

function toMessageLocale(locale: Locale): MessageLocale {
  return locale === "ku" ? "en" : locale;
}

function localeOverlay(locale: Locale): unknown {
  if (locale === "ku") {
    return {
      ...chromeMessages.ku,
      ...kuAppMessages,
      navigation: chromeMessages.ku.navigation,
      appControl: chromeMessages.ku.appControl,
      nightPicker: chromeMessages.ku.nightPicker,
      privacyLegal: chromeMessages.ku.privacyLegal,
    };
  }
  return chromeMessages[locale];
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

export function translatePath(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
) {
  const catalogLocale = toMessageLocale(locale);
  const overlay = localeOverlay(locale);
  const value =
    getByPath(overlay, path) ??
    getByPath(messages[catalogLocale], path) ??
    getByPath(chromeMessages.tr, path) ??
    getByPath(messages.tr, path);

  if (typeof value !== "string") return path;
  return interpolate(value, params);
}

export function readMessage<T>(locale: Locale, path: string, fallback: T): T {
  const catalogLocale = toMessageLocale(locale);
  const overlay = localeOverlay(locale);
  const value =
    getByPath(overlay, path) ??
    getByPath(messages[catalogLocale], path) ??
    getByPath(chromeMessages.tr, path) ??
    getByPath(messages.tr, path);

  return value === undefined ? fallback : (value as T);
}

/** Resolve locale from cookie/storage for non-React client modules. */
export function translateClient(
  path: string,
  params?: Record<string, string | number>
) {
  if (typeof document === "undefined") {
    return translatePath("tr", path, params);
  }
  const cookieMatch = document.cookie.match(/(?:^|;\s*)cyllene\.locale=([^;]+)/);
  const fromCookie = cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : null;
  const fromStorage =
    typeof localStorage !== "undefined" ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
  const locale = parseLocale(fromCookie ?? fromStorage);
  return translatePath(locale, path, params);
}
