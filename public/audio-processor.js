const THRESHOLD_DB = 42;
const RELEASE_DB = 36;
const MIN_DURATION_MS = 800;
const MAX_DURATION_MS = 90000;
const SILENCE_GAP_MS = 5000;
const LEVEL_INTERVAL_MS = 100;
const MAX_BUFFER_SECONDS = 2;
const MAX_CLIP_SECONDS = 90;

class AudioLevelProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options.processorOptions ?? {};
    this._sessionOffsetMs = opts.sessionOffsetMs ?? 0;
    this._sampleRate = sampleRate;
    this._lastLevelReport = 0;
    this._elapsedMs = this._sessionOffsetMs;

    this._audioBuffer = [];
    this._maxBufferChunks = 0;

    this._active = false;
    this._eventStartElapsed = 0;
    this._lastActiveElapsed = 0;
    this._peakDb = 0;
    this._eventSamples = [];

    this.port.onmessage = (event) => {
      if (event.data?.type !== "flush") return;
      if (this._active) {
        this._finalizeEvent(this._elapsedMs);
      }
      this.port.postMessage({ type: "flushed", elapsedMs: this._elapsedMs });
    };
  }

  _rmsToDb(rms) {
    return rms > 0 ? 20 * Math.log10(rms) + 90 : 0;
  }

  _chunkDb(chunk) {
    let sum = 0;
    for (let i = 0; i < chunk.length; i++) sum += chunk[i] * chunk[i];
    return this._rmsToDb(Math.sqrt(sum / chunk.length));
  }

  _pushBuffer(chunk) {
    this._audioBuffer.push(chunk);
    if (this._maxBufferChunks === 0) {
      this._maxBufferChunks = Math.ceil((MAX_BUFFER_SECONDS * this._sampleRate) / chunk.length);
    }
    while (this._audioBuffer.length > this._maxBufferChunks) {
      this._audioBuffer.shift();
    }
  }

  _mergeSamples(chunks) {
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const maxLen = this._sampleRate * MAX_CLIP_SECONDS;
    const merged = new Float32Array(Math.min(totalLength, maxLen));
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

  _finalizeEvent(endElapsed) {
    const duration = endElapsed - this._eventStartElapsed;
    const audioData = this._mergeSamples(this._eventSamples);

    if (duration >= MIN_DURATION_MS && audioData.length > 0) {
      this.port.postMessage(
        {
          type: "event",
          startElapsedMs: this._eventStartElapsed,
          durationMs: duration,
          peakDb: this._peakDb,
          audioData: audioData.buffer,
          sampleRate: this._sampleRate,
        },
        [audioData.buffer]
      );
    }

    this._active = false;
    this._eventStartElapsed = 0;
    this._lastActiveElapsed = 0;
    this._peakDb = 0;
    this._eventSamples = [];
  }

  _processDetection(db, chunk, elapsedMs) {
    if (db >= THRESHOLD_DB) {
      if (!this._active) {
        this._active = true;
        this._eventStartElapsed = elapsedMs;
        this._peakDb = db;
        this._eventSamples = [...this._audioBuffer];
      } else {
        this._peakDb = Math.max(this._peakDb, db);
        if (chunk) this._eventSamples.push(chunk);
      }
      this._lastActiveElapsed = elapsedMs;
    } else if (this._active && db < RELEASE_DB) {
      if (chunk) this._eventSamples.push(chunk);
      if (elapsedMs - this._eventStartElapsed >= MAX_DURATION_MS) {
        this._finalizeEvent(elapsedMs);
        return;
      }
      if (elapsedMs - this._lastActiveElapsed >= SILENCE_GAP_MS) {
        this._finalizeEvent(elapsedMs);
      }
    } else if (this._active) {
      this._lastActiveElapsed = elapsedMs;
      if (chunk) this._eventSamples.push(chunk);
      this._peakDb = Math.max(this._peakDb, db);
      if (elapsedMs - this._eventStartElapsed >= MAX_DURATION_MS) {
        this._finalizeEvent(elapsedMs);
      }
    }
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || input.length === 0) return true;

    const chunk = new Float32Array(input);
    this._pushBuffer(chunk);

    const elapsedMs = this._sessionOffsetMs + currentTime * 1000;
    this._elapsedMs = elapsedMs;
    const db = this._chunkDb(chunk);

    this._processDetection(db, chunk, elapsedMs);

    const now = currentTime * 1000;
    if (now - this._lastLevelReport >= LEVEL_INTERVAL_MS) {
      this._lastLevelReport = now;
      this.port.postMessage({ type: "level", db, elapsedMs });
    }

    return true;
  }
}

registerProcessor("audio-level-processor", AudioLevelProcessor);
