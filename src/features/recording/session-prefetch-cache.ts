import {
  fetchSessionById,
  fetchSessionEvents,
  fetchSessionNoiseSamples,
  fetchUserSessions,
} from "@/features/recording/sync-session";
import type { SleepEvent, SleepNoiseSample, SleepSession } from "@/types";

export type SessionDetailBundle = {
  session: SleepSession;
  events: SleepEvent[];
  noiseSamples: SleepNoiseSample[];
  allSessions: SleepSession[];
};

const detailCache = new Map<string, SessionDetailBundle>();
const detailInflight = new Map<string, Promise<SessionDetailBundle>>();
let sessionsCache: { userId: string; sessions: SleepSession[]; at: number } | null = null;
let sessionsInflight: Promise<SleepSession[]> | null = null;

const SESSIONS_TTL_MS = 60_000;

export function getCachedSessionDetail(sessionId: string) {
  return detailCache.get(sessionId) ?? null;
}

export function setCachedSessionDetail(sessionId: string, bundle: SessionDetailBundle) {
  detailCache.set(sessionId, bundle);
}

export async function loadSessionDetailBundle(
  sessionId: string,
  userId: string
): Promise<SessionDetailBundle> {
  const cached = detailCache.get(sessionId);
  if (cached) return cached;

  const inflight = detailInflight.get(sessionId);
  if (inflight) return inflight;

  const request = Promise.all([
    fetchSessionById(sessionId),
    fetchSessionEvents(sessionId),
    fetchSessionNoiseSamples(sessionId),
    loadUserSessionsCached(userId),
  ]).then(([session, events, noiseSamples, allSessions]) => {
    const bundle: SessionDetailBundle = {
      session,
      events,
      noiseSamples,
      allSessions,
    };
    detailCache.set(sessionId, bundle);
    detailInflight.delete(sessionId);
    return bundle;
  });

  detailInflight.set(sessionId, request);
  try {
    return await request;
  } catch (error) {
    detailInflight.delete(sessionId);
    throw error;
  }
}

export function warmSessionDetail(sessionId: string, userId: string) {
  if (detailCache.has(sessionId) || detailInflight.has(sessionId)) return;
  void loadSessionDetailBundle(sessionId, userId).catch(() => {
    // Prefetch is best-effort.
  });
}

export function getCachedUserSessions(userId: string) {
  if (!sessionsCache || sessionsCache.userId !== userId) return null;
  if (Date.now() - sessionsCache.at > SESSIONS_TTL_MS) return null;
  return sessionsCache.sessions;
}

export function seedUserSessions(userId: string, sessions: SleepSession[]) {
  sessionsCache = { userId, sessions, at: Date.now() };
}

export async function loadUserSessionsCached(userId: string) {
  const cached = getCachedUserSessions(userId);
  if (cached) return cached;

  if (sessionsInflight) return sessionsInflight;

  sessionsInflight = fetchUserSessions(userId)
    .then((sessions) => {
      sessionsCache = { userId, sessions, at: Date.now() };
      sessionsInflight = null;
      return sessions;
    })
    .catch((error) => {
      sessionsInflight = null;
      throw error;
    });

  return sessionsInflight;
}

export function warmUserSessions(userId: string) {
  void loadUserSessionsCached(userId).catch(() => {
    // Prefetch is best-effort.
  });
}
