const WELCOME_KEY = "cyllene-welcome-complete";

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(WELCOME_KEY) === "1";
}

export function markWelcomeSeen(): void {
  localStorage.setItem(WELCOME_KEY, "1");
}

export function shouldShowWelcome(): boolean {
  if (typeof window === "undefined") return false;
  if (hasSeenWelcome()) return false;

  const isPwa =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return isPwa || isMobile;
}
