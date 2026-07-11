/**
 * Local verification of welcome fade + exit (no auth required on /).
 */
import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const INGEST =
  "http://127.0.0.1:7668/ingest/6ebf33a3-e317-467b-8188-4ae3fc7f8fb1";

async function dbg(message, data = {}, hypothesisId = "V") {
  const payload = {
    sessionId: "d5fe36",
    runId: "local-verify-2",
    hypothesisId,
    location: "verify-welcome-flow.mjs",
    message,
    data,
    timestamp: Date.now(),
  };
  try {
    await fetch(INGEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d5fe36",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }
  console.log(`[verify] ${message}`, JSON.stringify(data));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 307 || res.status === 302) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not ready: ${url}`);
}

async function main() {
  await waitForServer(BASE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  // Force guest splash
  await page.addInitScript(() => {
    localStorage.removeItem("cyllene-guest-splash-seen");
  });

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  // Wait until loading gate clears
  await page.waitForFunction(
    () => !document.body.innerText.includes("CYLLENE") || document.querySelectorAll("button").length > 0,
    { timeout: 20000 }
  ).catch(() => {});
  await page.waitForTimeout(1500);

  await dbg("page ready", {
    url: page.url(),
    title: await page.title(),
    body: (await page.locator("body").innerText()).slice(0, 200),
    buttons: await page.evaluate(() =>
      [...document.querySelectorAll("button")].map((b) => b.innerText.trim().slice(0, 60))
    ),
  }, "B");

  const welcomeRoot = page.locator(".fixed.inset-0").first();
  const visibleWelcome = await welcomeRoot.isVisible().catch(() => false);
  await dbg("welcome overlay visible", { visibleWelcome }, "B");

  const overlayButtons = page.locator("button");
  const btnCount = await overlayButtons.count();
  await dbg("button count", { btnCount }, "B");

  if (btnCount > 0) {
    let clicked = false;
    for (let i = 0; i < btnCount; i++) {
      const text = ((await overlayButtons.nth(i).innerText()) || "").trim();
      if (/gece modunu başlat|başla|başlat|dinle|keşfet|devam|sabaha/i.test(text)) {
        await overlayButtons.nth(i).click();
        await dbg("clicked welcome button", { text }, "B");
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      await overlayButtons.first().click();
      await dbg("clicked first button", {}, "B");
    }
  }

  // Sound start + moment UI can take a moment
  await page.waitForTimeout(2000);

  const t0 = Date.now();
  let finished = false;
  for (let step = 0; step < 10; step++) {
    await page.waitForTimeout(700);
    const buttons = page.locator("button");
    const count = await buttons.count();
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(((await buttons.nth(i).innerText()) || "").trim().slice(0, 40));
    }
    await dbg("loop buttons", { step, labels }, "B");

    let advanced = false;
    for (let i = 0; i < count; i++) {
      const text = labels[i] || "";
      if (/sabaha geç/i.test(text)) {
        await buttons.nth(i).click();
        await dbg("clicked Sabaha geç", { step }, "B");
        await page.waitForTimeout(1500);
        const stillThere = await page
          .locator("text=/Ham ses cihazında kalır|Uyku ritmin netleşir|Gece olayları işaretlenir/")
          .first()
          .isVisible()
          .catch(() => false);
        const startGone = !(await page.getByText("Gece modunu başlat").isVisible().catch(() => false));
        finished = !stillThere;
        await dbg("after sabaha geç", { finished, stillThere, startGone, elapsedMs: Date.now() - t0 }, "B");
        advanced = true;
        break;
      }
      if (/^devam$/i.test(text) || text.includes("Devam")) {
        await buttons.nth(i).click();
        await dbg("clicked Devam", { step }, "B");
        advanced = true;
        break;
      }
    }
    if (finished) break;
    if (!advanced) {
      await dbg("no advance button", { step, count, labels }, "B");
      // keep looping a bit in case UI still animating
      if (step >= 6) break;
    }
  }

  // Volume regression: ensure negative assignment still throws, clamp path safe
  const vol = await page.evaluate(() => {
    const a = new Audio();
    let threw = false;
    try {
      a.volume = -0.00012285;
    } catch {
      threw = true;
    }
    const clamp = (v) => Math.min(1, Math.max(0, v));
    a.volume = clamp(-0.00012285);
    return { threw, volume: a.volume };
  });
  await dbg("volume regression", vol, "E");

  const volumeErrors = pageErrors.filter((e) => /IndexSizeError|volume/i.test(e));
  await dbg("page errors summary", { pageErrors, volumeErrors, finished, elapsedMs: Date.now() - t0 }, "B");

  await browser.close();

  if (volumeErrors.length > 0) {
    console.error("VERIFY FAILED: volume errors");
    process.exit(1);
  }
  if (!finished) {
    console.error("VERIFY FAILED: welcome did not finish");
    process.exit(1);
  }
  if (Date.now() - t0 > 8000) {
    console.error("VERIFY FAILED: finish took too long");
    process.exit(1);
  }
  console.log("VERIFY OK");
}

main().catch(async (err) => {
  await dbg("crashed", { error: String(err) });
  console.error(err);
  process.exit(1);
});
