"use client";

import * as React from "react";
import { chromeMessages } from "@/i18n/chrome-messages";
import {
  isLocale,
  LOCALE_STORAGE_KEY,
  parseLocale,
  writeLocaleCookie,
  type Locale,
  localeOptions,
} from "@/i18n/locales";
import { messages, type MessageLocale } from "@/i18n/messages";

export { localeOptions, type Locale };

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  m: <T>(path: string, fallback: T) => T;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function toMessageLocale(locale: Locale): MessageLocale {
  return locale === "ku" ? "en" : locale;
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
  const catalogLocale = toMessageLocale(locale);
  const value =
    getByPath(chromeMessages[locale], path) ??
    getByPath(messages[catalogLocale], path) ??
    getByPath(chromeMessages.tr, path) ??
    getByPath(messages.tr, path);

  if (typeof value !== "string") return path;
  return interpolate(value, params);
}

function readMessage<T>(locale: Locale, path: string, fallback: T): T {
  const catalogLocale = toMessageLocale(locale);
  const value =
    getByPath(chromeMessages[locale], path) ??
    getByPath(messages[catalogLocale], path) ??
    getByPath(chromeMessages.tr, path) ??
    getByPath(messages.tr, path);

  return value === undefined ? fallback : (value as T);
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  /** From server cookie — keeps first paint aligned with client. */
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    writeLocaleCookie(nextLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // Cookie (server) is source of truth. Only promote localStorage when cookie is absent.
    try {
      const hasCookie = document.cookie
        .split(";")
        .some((part) => part.trim().startsWith("cyllene.locale="));
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!hasCookie && isLocale(stored)) {
        writeLocaleCookie(stored);
        setLocaleState(stored);
        return;
      }
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bridge once on mount
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale === "ku" ? "ku" : locale;
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

export function readLocaleFromCookieHeader(cookieHeader: string | null | undefined): Locale {
  if (!cookieHeader) return "tr";
  const match = cookieHeader.match(/(?:^|;\s*)cyllene\.locale=([^;]+)/);
  return parseLocale(match?.[1] ? decodeURIComponent(match[1]) : null);
}
