type StopFn = () => void;

let activeEventId: string | null = null;
let activeStop: StopFn | null = null;

/** Başka bir klip çalmadan önce mevcut oynatıcıyı durdurur. */
export function claimEventAudioPlayback(eventId: string, stop: StopFn) {
  if (activeStop && activeEventId !== eventId) {
    activeStop();
  }
  activeEventId = eventId;
  activeStop = stop;
}

export function releaseEventAudioPlayback(eventId: string) {
  if (activeEventId === eventId) {
    activeEventId = null;
    activeStop = null;
  }
}
