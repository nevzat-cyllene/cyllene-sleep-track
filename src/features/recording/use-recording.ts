"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WakeLockManager, type WakeLockMethod } from "./wake-lock";
import {
  createSession,
  getActiveSession,
  saveSession,
} from "./session-store";
import { saveEventClip, getEventClip } from "./audio-clip-store";
import { float32ToWav, decodeWavBlob } from "@/lib/audio-clip-utils";
import { findMergeTargetEvent, mergeFloat32Audio } from "@/lib/event-merge";
import { classifyAudio, preloadYamnet } from "./yamnet-classifier";
import { calculateSleepScore } from "@/lib/sleep-utils";
import type { LocalSleepEvent, LocalSleepSession, NoiseSample } from "@/types";

export type RecordingStatus = "idle" | "preparing" | "recording" | "stopping";

interface UseRecordingOptions {
  userId?: string;
  onSessionComplete?: (session: LocalSleepSession) => void | Promise<void>;
}

interface PendingEventPayload {
  audioData: Float32Array;
  pendingEvent: LocalSleepEvent;
}

interface WorkletEventMessage {
  type: "event";
  startElapsedMs: number;
  durationMs: number;
  peakDb: number;
  audioData: ArrayBuffer;
  sampleRate: number;
}

const LIVE_WAVE_SAMPLES = 120;

function bucketNoiseSamples(session: LocalSleepSession) {
  const minuteBuckets = new Map<number, number[]>();
  for (const s of session.noiseSamples) {
    const minute = Math.floor((s.timestamp - session.startedAt) / 60000);
    if (!minuteBuckets.has(minute)) minuteBuckets.set(minute, []);
    minuteBuckets.get(minute)!.push(s.db);
  }
  session.noiseSamples = Array.from(minuteBuckets.entries()).map(([minute, dbs]) => ({
    timestamp: session.startedAt + minute * 60000,
    db: dbs.reduce((a, b) => a + b, 0) / dbs.length,
  }));
}

export function useRecording({ userId, onSessionComplete }: UseRecordingOptions = {}) {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [currentDb, setCurrentDb] = useState(0);
  const [recentDbSamples, setRecentDbSamples] = useState<number[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [detectedEvents, setDetectedEvents] = useState<LocalSleepEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockMethod, setWakeLockMethod] = useState<WakeLockMethod>("none");

  const sessionRef = useRef<LocalSleepSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const wakeLockRef = useRef(new WakeLockManager());
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasHiddenRef = useRef(false);
  const eventQueueRef = useRef<Promise<void>>(Promise.resolve());
  const stoppingRef = useRef(false);

  const persistSession = useCallback(async () => {
    if (sessionRef.current) {
      await saveSession(sessionRef.current);
    }
  }, []);

  const enqueueEvent = useCallback(
    (payload: PendingEventPayload) => {
      eventQueueRef.current = eventQueueRef.current.then(async () => {
        if (!sessionRef.current || stoppingRef.current) return;

        const sampleRate = payload.pendingEvent.durationMs > 0
          ? audioContextRef.current?.sampleRate ?? 44100
          : 44100;

        const { type, confidence } = await classifyAudio(payload.audioData, sampleRate);

        const classifiedEvent: LocalSleepEvent = {
          ...payload.pendingEvent,
          type,
          confidence,
        };

        const mergeTarget = findMergeTargetEvent(sessionRef.current.events, classifiedEvent);

        if (mergeTarget) {
          const gapMs = Math.max(
            0,
            classifiedEvent.timestamp - (mergeTarget.timestamp + mergeTarget.durationMs)
          );
          const gapSamples = Math.floor((gapMs / 1000) * sampleRate);
          const silence = gapSamples > 0 ? new Float32Array(gapSamples) : null;

          const existingClip = await getEventClip(mergeTarget.id);
          const chunks: Float32Array[] = [];
          if (existingClip) {
            const decoded = await decodeWavBlob(existingClip.wavBlob);
            if (decoded) chunks.push(decoded);
          }
          if (silence) chunks.push(silence);
          chunks.push(payload.audioData);

          const mergedAudio = mergeFloat32Audio(chunks);
          mergeTarget.durationMs += gapMs + classifiedEvent.durationMs;
          mergeTarget.peakDb = Math.max(mergeTarget.peakDb, classifiedEvent.peakDb);
          mergeTarget.confidence = Math.max(mergeTarget.confidence, confidence);

          await saveEventClip({
            eventId: mergeTarget.id,
            sessionId: sessionRef.current.id,
            occurredAt: mergeTarget.timestamp,
            sampleRate,
            wavBlob: float32ToWav(mergedAudio, sampleRate),
            durationMs: mergeTarget.durationMs,
          });
        } else {
          const wavBlob = float32ToWav(payload.audioData, sampleRate);

          await saveEventClip({
            eventId: classifiedEvent.id,
            sessionId: sessionRef.current.id,
            occurredAt: classifiedEvent.timestamp,
            sampleRate,
            wavBlob,
            durationMs: classifiedEvent.durationMs,
          });

          sessionRef.current.events.push(classifiedEvent);
        }

        setEventCount(sessionRef.current.events.length);
        setDetectedEvents([...sessionRef.current.events]);
        await persistSession();
      });
    },
    [persistSession]
  );

  const drainEventQueue = useCallback(async () => {
    await eventQueueRef.current;
  }, []);

  const cleanupAudio = useCallback(async () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }

    workletRef.current?.disconnect();
    workletRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      await audioContextRef.current?.close();
    }
    audioContextRef.current = null;

    await wakeLockRef.current.release();
    setWakeLockActive(false);
    setWakeLockMethod("none");
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setStatus("preparing");
    stoppingRef.current = false;
    eventQueueRef.current = Promise.resolve();

    try {
      await preloadYamnet();

      const existing = await getActiveSession();
      const session = existing ?? createSession(userId);
      if (userId) session.userId = userId;
      sessionRef.current = session;

      const sessionOffsetMs = Date.now() - session.startedAt;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule("/audio-processor.js");
      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, "audio-level-processor", {
        processorOptions: { sessionOffsetMs },
      });
      workletRef.current = worklet;

      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      worklet.port.onmessage = (event) => {
        const data = event.data as
          | { type: "level"; db: number; elapsedMs: number }
          | WorkletEventMessage;

        if (!sessionRef.current) return;

        if (data.type === "level") {
          setCurrentDb(data.db);
          setRecentDbSamples((prev) => [...prev.slice(-(LIVE_WAVE_SAMPLES - 1)), data.db]);

          const sample: NoiseSample = {
            timestamp: sessionRef.current.startedAt + data.elapsedMs,
            db: data.db,
          };
          sessionRef.current.noiseSamples.push(sample);

          if (sessionRef.current.noiseSamples.length % 6 === 0) {
            bucketNoiseSamples(sessionRef.current);
          }
          return;
        }

        if (data.type === "event") {
          const audioData = new Float32Array(data.audioData);
          const pendingEvent: LocalSleepEvent = {
            id: crypto.randomUUID(),
            timestamp: sessionRef.current.startedAt + data.startElapsedMs,
            durationMs: data.durationMs,
            peakDb: data.peakDb,
            type: "noise",
            confidence: 0,
          };
          enqueueEvent({ audioData, pendingEvent });
        }
      };

      source.connect(worklet);
      worklet.connect(silentGain);
      silentGain.connect(audioContext.destination);

      const wakeState = await wakeLockRef.current.acquire();
      setWakeLockActive(wakeState.active);
      setWakeLockMethod(wakeState.method);

      saveIntervalRef.current = setInterval(() => {
        void persistSession();
      }, 30000);

      const startTime = session.startedAt;
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 250);

      await saveSession(session);
      setStatus("recording");
      setEventCount(session.events.length);
      setDetectedEvents([...session.events]);
      setElapsedMs(sessionOffsetMs > 0 ? sessionOffsetMs : 0);
      setRecentDbSamples([]);
    } catch (err) {
      await cleanupAudio();
      setStatus("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Mikrofon erişimi reddedildi. Lütfen izin verin."
      );
    }
  }, [cleanupAudio, enqueueEvent, persistSession, userId]);

  const stopRecording = useCallback(async () => {
    setStatus("stopping");
    stoppingRef.current = true;

    await cleanupAudio();
    await drainEventQueue();

    if (sessionRef.current) {
      bucketNoiseSamples(sessionRef.current);
      sessionRef.current.endedAt = Date.now();
      sessionRef.current.sleepScore = calculateSleepScore(sessionRef.current);
      sessionRef.current.avgDb =
        sessionRef.current.noiseSamples.length > 0
          ? sessionRef.current.noiseSamples.reduce((s, n) => s + n.db, 0) /
            sessionRef.current.noiseSamples.length
          : undefined;
      sessionRef.current.peakDb =
        sessionRef.current.noiseSamples.length > 0
          ? Math.max(...sessionRef.current.noiseSamples.map((n) => n.db))
          : undefined;

      await saveSession(sessionRef.current);
      const completed = sessionRef.current;
      await onSessionComplete?.(completed);
    }

    setStatus("idle");
    setCurrentDb(0);
    setRecentDbSamples([]);
    setElapsedMs(0);
    stoppingRef.current = false;
  }, [cleanupAudio, drainEventQueue, onSessionComplete]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        wasHiddenRef.current = true;
        if (sessionRef.current && status === "recording") {
          sessionRef.current.interruptionCount += 1;
          void persistSession();
        }
      } else if (wasHiddenRef.current && status === "recording") {
        wasHiddenRef.current = false;
        void wakeLockRef.current.acquire().then((state) => {
          setWakeLockActive(state.active);
          setWakeLockMethod(state.method);
        });
        if (audioContextRef.current?.state === "suspended") {
          void audioContextRef.current.resume();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [persistSession, status]);

  useEffect(() => {
    return () => {
      void cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    status,
    currentDb,
    recentDbSamples,
    elapsedMs,
    eventCount,
    detectedEvents,
    error,
    wakeLockActive,
    wakeLockMethod,
    startRecording,
    stopRecording,
    session: sessionRef.current,
  };
}
