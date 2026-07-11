/** True inside Vercel / social / Android WebView shells — not a normal browser tab. */
export function isEmbeddedBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";

  if (/\bwv\b|; wv\)/i.test(ua)) return true;

  if (
    /Instagram|FBAN|FBAV|Line\/|Twitter|LinkedInApp|MicroMessenger|BytedanceWebview|Vercel/i.test(
      ua
    )
  ) {
    return true;
  }

  const isIos = /iPhone|iPad|iPod/i.test(ua);
  if (isIos && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua)) return true;

  return false;
}

/**
 * Leave in-app WebView and open the same URL in the device browser chooser
 * (Chrome, Samsung, Yandex, Safari… — no forced browser).
 */
export function getOpenInBrowserHref(
  href = typeof window !== "undefined" ? window.location.href : ""
) {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return href;
    const hostAndPath = `${url.host}${url.pathname}${url.search}${url.hash}`;
    const fallback = encodeURIComponent(url.toString());
    // No package= → user/system picks any installed browser.
    return `intent://${hostAndPath}#Intent;scheme=${url.protocol.replace(":", "")};action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end`;
  } catch {
    return href;
  }
}
