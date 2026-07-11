const STOP_ALL_AUDIO_EVENT = "cyllene:stop-all-audio";

type DisposableAmbience = { dispose: () => void };

let activeWelcomeAmbience: DisposableAmbience | null = null;

export function registerWelcomeAmbience(instance: DisposableAmbience | null) {
  activeWelcomeAmbience = instance;
}

/** Stops welcome MP3 / generated ambience and any event clip players. */
export function stopAllAppAudio() {
  activeWelcomeAmbience?.dispose();
  activeWelcomeAmbience = null;

  if (typeof document !== "undefined") {
    document.querySelectorAll("audio").forEach((el) => {
      try {
        el.pause();
        el.currentTime = 0;
        el.removeAttribute("src");
        el.load();
      } catch {
        // ignore
      }
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STOP_ALL_AUDIO_EVENT));
  }
}

export function getStopAllAudioEventName() {
  return STOP_ALL_AUDIO_EVENT;
}
