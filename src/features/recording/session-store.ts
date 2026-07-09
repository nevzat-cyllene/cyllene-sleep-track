import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LocalSleepSession } from "@/types";

interface CylleneSleepDB extends DBSchema {
  sessions: {
    key: string;
    value: LocalSleepSession;
    indexes: { "by-synced": number };
  };
}

const DB_NAME = "cyllene-sleep-track";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CylleneSleepDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CylleneSleepDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("sessions", { keyPath: "id" });
        store.createIndex("by-synced", "synced");
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: LocalSleepSession): Promise<void> {
  const db = await getDB();
  await db.put("sessions", session);
}

export async function getSession(id: string): Promise<LocalSleepSession | undefined> {
  const db = await getDB();
  return db.get("sessions", id);
}

export async function getActiveSession(): Promise<LocalSleepSession | undefined> {
  const db = await getDB();
  const all = await db.getAll("sessions");
  return all.find((s) => !s.endedAt);
}

export async function getUnsyncedSessions(): Promise<LocalSleepSession[]> {
  const db = await getDB();
  const all = await db.getAll("sessions");
  return all.filter((s) => !s.synced);
}

export async function getAllSessions(): Promise<LocalSleepSession[]> {
  const db = await getDB();
  const sessions = await db.getAll("sessions");
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sessions", id);
}

export function createSession(userId?: string): LocalSleepSession {
  return {
    id: crypto.randomUUID(),
    userId,
    startedAt: Date.now(),
    noiseSamples: [],
    events: [],
    interruptionCount: 0,
    synced: false,
  };
}
