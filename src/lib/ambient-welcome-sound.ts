/**
 * Cyllene açılış / onboarding ambiyansı.
 * Tek kaynak: public/audio/cyllene-welcome.mp3
 */
import { registerWelcomeAmbience } from "@/lib/stop-app-audio";

const WELCOME_AUDIO_SRC = "/audio/cyllene-welcome.mp3";
const FILE_AMBIENCE_TARGET_VOLUME = 0.42;
const FILE_AMBIENCE_FADE_IN_SEC = 7.2;

export class AmbientWelcomeSound {
  private audio: HTMLAudioElement | null = null;
  private fadeFrame: number | null = null;
  private running = false;

  async start(): Promise<void> {
    if (this.running) return;
    if (typeof Audio === "undefined") return;

    registerWelcomeAmbience(this);

    const audio = new Audio(WELCOME_AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    try {
      await this.waitUntilReady(audio);
      this.audio = audio;
      await audio.play();
      this.running = true;
      void this.fadeAudioVolume(FILE_AMBIENCE_TARGET_VOLUME, FILE_AMBIENCE_FADE_IN_SEC);
    } catch {
      audio.pause();
      audio.src = "";
      this.audio = null;
      this.running = false;
      registerWelcomeAmbience(null);
      throw new Error("Welcome ambience could not start");
    }
  }

  async fadeOut(durationSec = 4.2): Promise<void> {
    if (!this.audio) {
      this.dispose();
      return;
    }
    await this.fadeAudioVolume(0, durationSec);
    this.dispose();
  }

  dispose(): void {
    registerWelcomeAmbience(null);

    if (this.fadeFrame !== null) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = "";
      this.audio = null;
    }

    this.running = false;
  }

  private waitUntilReady(audio: HTMLAudioElement): Promise<void> {
    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Welcome audio failed to load"));
      };
      const cleanup = () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("loadeddata", onReady);
        audio.removeEventListener("error", onError);
      };

      audio.addEventListener("canplaythrough", onReady, { once: true });
      audio.addEventListener("loadeddata", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
      audio.load();
    });
  }

  private fadeAudioVolume(targetVolume: number, durationSec: number): Promise<void> {
    if (!this.audio) return Promise.resolve();

    const audio = this.audio;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const startVolume = clamp(audio.volume);
    const endVolume = clamp(targetVolume);
    const startAt = performance.now();
    const durationMs = Math.max(1, durationSec * 1000);

    if (this.fadeFrame !== null) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    return new Promise((resolve) => {
      const finish = () => {
        this.fadeFrame = null;
        try {
          audio.volume = endVolume;
        } catch {
          // ignore
        }
        resolve();
      };

      const tick = (now: number) => {
        try {
          const progress = Math.min(1, Math.max(0, (now - startAt) / durationMs));
          audio.volume = clamp(startVolume + (endVolume - startVolume) * progress);

          if (progress < 1) {
            this.fadeFrame = requestAnimationFrame(tick);
            return;
          }
        } catch {
          finish();
          return;
        }

        finish();
      };

      this.fadeFrame = requestAnimationFrame(tick);
    });
  }
}
