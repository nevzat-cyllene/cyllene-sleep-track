"use client";

import * as React from "react";
import {
  detectLocaleFromDevice,
  isLocale,
  LOCALE_STORAGE_KEY,
  parseLocale,
  writeLocaleCookie,
  type Locale,
  localeOptions,
} from "@/i18n/locales";
import { readMessage, translatePath } from "@/i18n/lookup";

export { localeOptions, type Locale };
export { translateClient } from "@/i18n/lookup";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  m: <T>(path: string, fallback: T) => T;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

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
    // Cookie wins once set (including an early device-locale script).
    // Without a cookie, prefer OS/regional locale via Intl — not browser UI language.
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)cyllene\.locale=([^;]+)/);
      const cookieLocale = cookieMatch?.[1]
        ? decodeURIComponent(cookieMatch[1])
        : null;

      if (isLocale(cookieLocale)) {
        if (cookieLocale !== locale) setLocaleState(cookieLocale);
        window.localStorage.setItem(LOCALE_STORAGE_KEY, cookieLocale);
        return;
      }

      const next = detectLocaleFromDevice();
      writeLocaleCookie(next);
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      if (next !== locale) setLocaleState(next);
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
