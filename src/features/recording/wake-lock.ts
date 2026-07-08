type WakeLockSentinel = {
  release: () => Promise<void>;
};

export type WakeLockMethod = "api" | "fallback" | "none";

export interface WakeLockResult {
  active: boolean;
  method: WakeLockMethod;
}

export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private noSleepVideo: HTMLVideoElement | null = null;
  private active = false;
  private method: WakeLockMethod = "none";

  getState(): WakeLockResult {
    return { active: this.active && this.method !== "none", method: this.method };
  }

  async acquire(): Promise<WakeLockResult> {
    this.active = true;

    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await (
          navigator as Navigator & {
            wakeLock: { request: (type: "screen") => Promise<WakeLockSentinel> };
          }
        ).wakeLock.request("screen");

        this.wakeLock &&
          document.addEventListener("visibilitychange", this.onVisibilityChange);

        this.method = "api";
        return { active: true, method: "api" };
      } catch {
        // Fall through to video fallback
      }
    }

    const fallbackOk = this.acquireVideoFallback();
    this.method = fallbackOk ? "fallback" : "none";
    return { active: fallbackOk, method: this.method };
  }

  private onVisibilityChange = async () => {
    if (document.visibilityState === "visible" && this.active) {
      try {
        this.wakeLock = await (
          navigator as Navigator & {
            wakeLock: { request: (type: "screen") => Promise<WakeLockSentinel> };
          }
        ).wakeLock.request("screen");
      } catch {
        // ignore
      }
    }
  };

  private acquireVideoFallback(): boolean {
    try {
      const video = document.createElement("video");
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.muted = true;
      video.loop = true;
      video.style.cssText =
        "position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;";
      video.src =
        "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT1xYXZlciB0cmVsbGlzPTEgOHg4ZGN0PTAgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MCB3ZWlnaHRwPTAga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAA";

      document.body.appendChild(video);
      void video.play();
      this.noSleepVideo = video;
      return true;
    } catch {
      return false;
    }
  }

  async release(): Promise<void> {
    this.active = false;
    this.method = "none";
    document.removeEventListener("visibilitychange", this.onVisibilityChange);

    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {
        // ignore
      }
      this.wakeLock = null;
    }

    if (this.noSleepVideo) {
      this.noSleepVideo.pause();
      this.noSleepVideo.remove();
      this.noSleepVideo = null;
    }
  }
}
