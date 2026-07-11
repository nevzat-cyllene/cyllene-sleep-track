"use client";

/**
 * Capture Chrome's beforeinstallprompt as early as possible and suppress the
 * white system install UI. Actual install only runs after an explicit user tap.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __cylleneBIP?: BeforeInstallPromptEvent | null;
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
  if (typeof window !== "undefined") {
    window.__cylleneBIP = event;
  }
  notify();
}

function onBeforeInstallPrompt(event: Event) {
  event.preventDefault();
  adoptPrompt(event as BeforeInstallPromptEvent);
}

function onAppInstalled() {
  adoptPrompt(null);
}

export function ensureInstallPromptCapture() {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  // Inline boot script may have captured the event before React hydrated.
  if (window.__cylleneBIP) {
    deferredPrompt = window.__cylleneBIP;
  }

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
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
  return deferredPrompt;
}

export function clearDeferredInstallPrompt() {
  adoptPrompt(null);
}
