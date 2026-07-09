import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface EventAudioClip {
  eventId: string;
  sessionId: string;
  occurredAt: number;
  sampleRate: number;
  wavBlob: Blob;
  durationMs: number;
}

interface CylleneSleepAudioDB extends DBSchema {
  eventClips: {
    key: string;
    value: EventAudioClip;
    indexes: { "by-session": string; "by-occurred": number };
  };
}

const DB_NAME = "cyllene-sleep-track-audio";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CylleneSleepAudioDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CylleneSleepAudioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("eventClips", { keyPath: "eventId" });
        store.createIndex("by-session", "sessionId");
        store.createIndex("by-occurred", "occurredAt");
      },
    });
  }
  return dbPromise;
}

export async function saveEventClip(clip: EventAudioClip): Promise<void> {
  const db = await getDB();
  await db.put("eventClips", clip);
}

export async function getEventClip(eventId: string): Promise<EventAudioClip | undefined> {
  const db = await getDB();
  return db.get("eventClips", eventId);
}

export async function getSessionClips(sessionId: string): Promise<EventAudioClip[]> {
  const db = await getDB();
  const clips = await db.getAllFromIndex("eventClips", "by-session", sessionId);
  return clips.sort((a, b) => a.occurredAt - b.occurredAt);
}

export async function deleteSessionClips(sessionId: string): Promise<void> {
  const db = await getDB();
  const clips = await db.getAllFromIndex("eventClips", "by-session", sessionId);
  const tx = db.transaction("eventClips", "readwrite");
  await Promise.all([
    ...clips.map((clip) => tx.store.delete(clip.eventId)),
    tx.done,
  ]);
}
