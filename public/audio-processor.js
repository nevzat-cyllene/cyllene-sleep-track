class AudioLevelProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastReport = 0;
    this._interval = 100; // ms
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || input.length === 0) return true;

    const now = currentTime * 1000;
    if (now - this._lastReport < this._interval) return true;
    this._lastReport = now;

    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * input[i];
    }
    const rms = Math.sqrt(sum / input.length);
    const db = rms > 0 ? 20 * Math.log10(rms) + 90 : 0;

    this.port.postMessage({ type: "level", db, timestamp: now });

    return true;
  }
}

registerProcessor("audio-level-processor", AudioLevelProcessor);
