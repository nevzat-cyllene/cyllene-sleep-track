"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventDetector } from "./event-detector";
import { WakeLockManager, type WakeLockMethod } from "./wake-lock";
import {
  createSession,
  getActiveSession,
  saveSession,
} from "./session-store";
import { saveEventClip } from "./audio-clip-store";
import { float32ToWav } from "@/lib/audio-clip-utils";
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

export function useRecording({ userId, onSessionComplete }: UseRecordingOptions = {}) {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [currentDb, setCurrentDb] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [detectedEvents, setDetectedEvents] = useState<LocalSleepEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockMethod, setWakeLockMethod] = useState<WakeLockMethod>("none");

  const sessionRef = useRef<LocalSleepSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef(new EventDetector());
  const wakeLockRef = useRef(new WakeLockManager());
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasHiddenRef = useRef(false);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const persistSession = useCallback(async () => {
    if (sessionRef.current) {
      await saveSession(sessionRef.current);
    }
  }, []);

  const handlePendingEvent = useCallback(
    async (payload: PendingEventPayload) => {
      if (!sessionRef.current) return;

      const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
      const { type, confidence } = await classifyAudio(payload.audioData, sampleRate);

      const classifiedEvent: LocalSleepEvent = {
        ...payload.pendingEvent,
        type,
        confidence,
      };

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
      setEventCount(sessionRef.current.events.length);
      setDetectedEvents([...sessionRef.current.events]);
      await persistSession();
    },
    [persistSession]
  );

  const cleanupAudio = useCallback(async () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

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

    try {
      await preloadYamnet();

      const existing = await getActiveSession();
      const session = existing ?? createSession(userId);
      sessionRef.current = session;

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
      detectorRef.current.setSampleRate(audioContext.sampleRate);

      await audioContext.audioWorklet.addModule("/audio-processor.js");
      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, "audio-level-processor");

      worklet.port.onmessage = (event) => {
        const { db, timestamp } = event.data as { db: number; timestamp: number };
        setCurrentDb(db);

        if (!sessionRef.current) return;

        const sample: NoiseSample = { timestamp: sessionRef.current.startedAt + timestamp, db };
        sessionRef.current.noiseSamples.push(sample);

        if (sessionRef.current.noiseSamples.length % 6 === 0) {
          const minuteBuckets = new Map<number, number[]>();
          for (const s of sessionRef.current.noiseSamples) {
            const minute = Math.floor((s.timestamp - sessionRef.current!.startedAt) / 60000);
            if (!minuteBuckets.has(minute)) minuteBuckets.set(minute, []);
            minuteBuckets.get(minute)!.push(s.db);
          }
          sessionRef.current.noiseSamples = Array.from(minuteBuckets.entries()).flatMap(
            ([minute, dbs]) => {
              const avg = dbs.reduce((a, b) => a + b, 0) / dbs.length;
              return [{ timestamp: sessionRef.current!.startedAt + minute * 60000, db: avg }];
            }
          );
        }
      };

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(input);
        const now = Date.now();
        const rms = Math.sqrt(chunk.reduce((s, v) => s + v * v, 0) / chunk.length);
        const db = rms > 0 ? 20 * Math.log10(rms) + 90 : 0;

        const result = detectorRef.current.pushLevel(db, now, chunk) as NoiseSample &
          Partial<PendingEventPayload>;

        if (result.pendingEvent && result.audioData) {
          void handlePendingEvent({
            audioData: result.audioData,
            pendingEvent: result.pendingEvent,
          });
        }
      };

      source.connect(worklet);
      source.connect(processor);
      processor.connect(audioContext.destination);

      const wakeState = await wakeLockRef.current.acquire();
      setWakeLockActive(wakeState.active);
      setWakeLockMethod(wakeState.method);

      saveIntervalRef.current = setInterval(() => {
        void persistSession();
      }, 30000);

      const startTime = session.startedAt;
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 1000);

      await saveSession(session);
      setStatus("recording");
      setEventCount(session.events.length);
      setDetectedEvents([...session.events]);
      setElapsedMs(0);
    } catch (err) {
      await cleanupAudio();
      setStatus("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Mikrofon erişimi reddedildi. Lütfen izin verin."
      );
    }
  }, [cleanupAudio, handlePendingEvent, persistSession, userId]);

  const stopRecording = useCallback(async () => {
    setStatus("stopping");

    if (sessionRef.current) {
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
      await onSessionComplete?.(sessionRef.current);
    }

    await cleanupAudio();
    setStatus("idle");
    setCurrentDb(0);
    setElapsedMs(0);
  }, [cleanupAudio, onSessionComplete]);

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
