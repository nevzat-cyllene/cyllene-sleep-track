const GUEST_SPLASH_KEY = "cyllene-guest-splash-seen";

export function hasSeenGuestSplash(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(GUEST_SPLASH_KEY) === "1";
}

export function markGuestSplashSeen(): void {
  localStorage.setItem(GUEST_SPLASH_KEY, "1");
}

export function shouldShowGuestSplash(): boolean {
  if (typeof window === "undefined") return false;
  return !hasSeenGuestSplash();
}
