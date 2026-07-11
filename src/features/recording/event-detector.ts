import type { LocalSleepEvent, NoiseSample, SleepEventType } from "@/types";

export interface EventDetectorConfig {
  thresholdDb: number;
  releaseDb: number;
  minDurationMs: number;
  maxDurationMs: number;
  silenceGapMs: number;
}

export const DEFAULT_DETECTOR_CONFIG: EventDetectorConfig = {
  thresholdDb: 39,
  releaseDb: 33,
  minDurationMs: 600,
  maxDurationMs: 90000,
  silenceGapMs: 5000,
};

interface DetectorState {
  active: boolean;
  startTime: number;
  lastActiveTime: number;
  peakDb: number;
  samples: Float32Array[];
}

export class EventDetector {
  private config: EventDetectorConfig;
  private state: DetectorState = {
    active: false,
    startTime: 0,
    lastActiveTime: 0,
    peakDb: 0,
    samples: [],
  };
  private audioBuffer: Float32Array[] = [];
  private readonly maxBufferSeconds = 2;
  private readonly maxClipSeconds = 90;
  private sampleRate = 44100;

  constructor(config: Partial<EventDetectorConfig> = {}) {
    this.config = { ...DEFAULT_DETECTOR_CONFIG, ...config };
  }

  setSampleRate(rate: number) {
    this.sampleRate = rate;
  }

  pushLevel(db: number, timestamp: number, audioChunk?: Float32Array): NoiseSample {
    if (audioChunk) {
      this.audioBuffer.push(audioChunk);
      const maxChunks = Math.ceil((this.maxBufferSeconds * this.sampleRate) / audioChunk.length);
      while (this.audioBuffer.length > maxChunks) {
        this.audioBuffer.shift();
      }
    }

    if (db >= this.config.thresholdDb) {
      if (!this.state.active) {
        this.state.active = true;
        this.state.startTime = timestamp;
        this.state.peakDb = db;
        this.state.samples = [...this.audioBuffer];
      } else {
        this.state.peakDb = Math.max(this.state.peakDb, db);
        if (audioChunk) this.state.samples.push(audioChunk);
      }
      this.state.lastActiveTime = timestamp;
    } else if (this.state.active && db < this.config.releaseDb) {
      if (audioChunk) this.state.samples.push(audioChunk);
      const gap = timestamp - this.state.lastActiveTime;
      const duration = timestamp - this.state.startTime;
      if (duration >= this.config.maxDurationMs) {
        return this.finalizeEvent(timestamp);
      }
      if (gap >= this.config.silenceGapMs) {
        return this.finalizeEvent(timestamp);
      }
    } else if (this.state.active) {
      this.state.lastActiveTime = timestamp;
      if (audioChunk) this.state.samples.push(audioChunk);
      this.state.peakDb = Math.max(this.state.peakDb, db);

      const duration = timestamp - this.state.startTime;
      if (duration >= this.config.maxDurationMs) {
        return this.finalizeEvent(timestamp);
      }
    }

    return { timestamp, db };
  }

  private finalizeEvent(endTime: number): NoiseSample {
    const duration = endTime - this.state.startTime;
    const event: LocalSleepEvent | null =
      duration >= this.config.minDurationMs
        ? {
            id: crypto.randomUUID(),
            timestamp: this.state.startTime,
            durationMs: duration,
            peakDb: this.state.peakDb,
            type: "noise",
            confidence: 0,
          }
        : null;

    const audioData = this.mergeSamples(this.state.samples);
    this.resetState();

    if (event && audioData.length > 0) {
      return {
        timestamp: endTime,
        db: event.peakDb,
        ...(event as unknown as Record<string, unknown>),
        audioData,
        pendingEvent: event,
      } as NoiseSample & {
        audioData: Float32Array;
        pendingEvent: LocalSleepEvent;
      };
    }

    return { timestamp: endTime, db: 0 };
  }

  private mergeSamples(chunks: Float32Array[]): Float32Array {
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(Math.min(totalLength, this.sampleRate * this.maxClipSeconds));
    let offset = 0;
    const startOffset = Math.max(0, totalLength - merged.length);
    let skipped = 0;

    for (const chunk of chunks) {
      if (skipped + chunk.length <= startOffset) {
        skipped += chunk.length;
        continue;
      }
      const start = skipped < startOffset ? startOffset - skipped : 0;
      const copyLen = Math.min(chunk.length - start, merged.length - offset);
      merged.set(chunk.subarray(start, start + copyLen), offset);
      offset += copyLen;
      skipped += chunk.length;
      if (offset >= merged.length) break;
    }
    return merged;
  }

  private resetState() {
    this.state = {
      active: false,
      startTime: 0,
      lastActiveTime: 0,
      peakDb: 0,
      samples: [],
    };
  }

  classifyPendingEvent(
    event: LocalSleepEvent,
    type: SleepEventType,
    confidence: number
  ): LocalSleepEvent {
    return { ...event, type, confidence };
  }
}
