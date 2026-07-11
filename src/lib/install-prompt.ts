"use client";

/**
 * Capture Chrome beforeinstallprompt in real browsers only.
 * In Vercel/WebView shells we do nothing — those hosts show their own white dialogs.
 */

import { isEmbeddedBrowser } from "@/lib/browser-env";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __cylleneBIP?: BeforeInstallPromptEvent | null;
    __cylleneBIPBound?: boolean;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();
let listening = false;

function notify() {
  for (const listener of listeners) listener(deferredPrompt);
}

function adoptPrompt(event: BeforeInstallPromptEvent | null) {
  deferredPrompt = event;
  if (typeof window !== "undefined") window.__cylleneBIP = event;
  notify();
}

function onBeforeInstallPrompt(event: Event) {
  // Never fight the host WebView — let it alone / ignore install there.
  if (isEmbeddedBrowser()) return;
  event.preventDefault();
  adoptPrompt(event as BeforeInstallPromptEvent);
}

function onAppInstalled() {
  adoptPrompt(null);
}

export function ensureInstallPromptCapture() {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  if (isEmbeddedBrowser()) {
    deferredPrompt = null;
    notify();
    return;
  }

  if (window.__cylleneBIP) deferredPrompt = window.__cylleneBIP;

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt, true);
  window.addEventListener("appinstalled", onAppInstalled);
  notify();
}

export function subscribeInstallPrompt(
  listener: (event: BeforeInstallPromptEvent | null) => void
) {
  ensureInstallPromptCapture();
  listeners.add(listener);
  listener(deferredPrompt);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt() {
  if (typeof window !== "undefined" && isEmbeddedBrowser()) return null;
  return deferredPrompt ?? (typeof window !== "undefined" ? window.__cylleneBIP ?? null : null);
}

export function clearDeferredInstallPrompt() {
  adoptPrompt(null);
}
