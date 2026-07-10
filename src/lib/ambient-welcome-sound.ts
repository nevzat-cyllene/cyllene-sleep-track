/**
 * Cyllene açılış ambiyansı.
 * Önce ürün için verilen MP3 ambiyansını kullanır; tarayıcı reddederse WebAudio fallback çalışır.
 */
import { registerWelcomeAmbience } from "@/lib/stop-app-audio";

const FILE_AMBIENCE_TARGET_VOLUME = 0.42;
const FILE_AMBIENCE_FADE_IN_SEC = 7.2;

export class AmbientWelcomeSound {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseSources: AudioBufferSourceNode[] = [];
  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private fadeFrame: number | null = null;
  private running = false;

  async start(): Promise<void> {
    if (this.running) return;
    registerWelcomeAmbience(this);

    if (await this.startFileAmbience()) return;
    await this.startGeneratedAmbience();
  }

  private async startFileAmbience(): Promise<boolean> {
    if (typeof Audio === "undefined") return false;

    const audio = new Audio("/audio/cyllene-welcome.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    try {
      this.audio = audio;
      await audio.play();
      this.running = true;
      void this.fadeAudioVolume(FILE_AMBIENCE_TARGET_VOLUME, FILE_AMBIENCE_FADE_IN_SEC);
      return true;
    } catch {
      audio.pause();
      this.audio = null;
      return false;
    }
  }

  private async startGeneratedAmbience(): Promise<void> {
    this.ctx = new AudioContext();
    await this.ctx.resume();

    const ctx = this.ctx;
    const now = ctx.currentTime;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.createReverbImpulse(2.6, 0.34);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.82;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.46;

    dryGain.connect(this.masterGain);
    reverb.connect(wetGain);
    wetGain.connect(this.masterGain);

    const harmonyGain = ctx.createGain();
    harmonyGain.gain.value = 0.68;
    harmonyGain.connect(dryGain);
    harmonyGain.connect(reverb);

    const oceanGain = ctx.createGain();
    oceanGain.gain.value = 0.035;
    oceanGain.connect(dryGain);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.01;
    shimmerGain.connect(dryGain);
    shimmerGain.connect(reverb);

    this.startFantasyPad(harmonyGain, now);
    this.startOceanBreath(oceanGain, shimmerGain, now);
    this.startBreathModulation(harmonyGain, 0.055, 0.075, now);
    this.startBreathModulation(oceanGain, 0.072, 0.022, now);
    this.scheduleBellPhrase(1.9);

    this.masterGain.gain.exponentialRampToValueAtTime(0.3, now + 6.2);
    this.running = true;
  }

  async fadeOut(durationSec = 4.2): Promise<void> {
    if (this.audio) {
      await this.fadeAudioVolume(0, durationSec);
      this.dispose();
      return;
    }

    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationSec);

    await new Promise((r) => setTimeout(r, durationSec * 1000 + 150));
    this.dispose();
  }

  dispose(): void {
    registerWelcomeAmbience(null);

    if (this.fadeFrame !== null) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = "";
      this.audio = null;
    }

    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers = [];

    for (const source of this.noiseSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // ignore
      }
    }
    this.noiseSources = [];

    for (const osc of this.oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    this.oscillators = [];

    try {
      this.masterGain?.disconnect();
    } catch {
      // ignore
    }
    void this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.running = false;
  }

  private fadeAudioVolume(targetVolume: number, durationSec: number): Promise<void> {
    if (!this.audio) return Promise.resolve();

    const audio = this.audio;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const startVolume = clamp(audio.volume);
    const endVolume = clamp(targetVolume);
    const startAt = performance.now();
    const durationMs = Math.max(1, durationSec * 1000);

    if (this.fadeFrame !== null) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    return new Promise((resolve) => {
      const finish = () => {
        this.fadeFrame = null;
        try {
          audio.volume = endVolume;
        } catch {
          // ignore
        }
        resolve();
      };

      const tick = (now: number) => {
        try {
          const progress = Math.min(1, Math.max(0, (now - startAt) / durationMs));
          audio.volume = clamp(startVolume + (endVolume - startVolume) * progress);

          if (progress < 1) {
            this.fadeFrame = requestAnimationFrame(tick);
            return;
          }
        } catch {
          finish();
          return;
        }

        finish();
      };

      this.fadeFrame = requestAnimationFrame(tick);
    });
  }

  private startFantasyPad(destination: AudioNode, now: number) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 980;
    padFilter.Q.value = 0.55;
    padFilter.connect(destination);

    const notes = [
      { freq: 146.83, gain: 0.022, detune: -3 }, // D3
      { freq: 220, gain: 0.017, detune: 2 }, // A3
      { freq: 293.66, gain: 0.015, detune: -1 }, // D4
      { freq: 369.99, gain: 0.009, detune: 1 }, // F#4
      { freq: 440, gain: 0.007, detune: -2 }, // A4
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const drift = ctx.createOscillator();
      const driftGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = note.freq;
      osc.detune.value = note.detune;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(note.gain, now + 2.2);

      drift.type = "sine";
      drift.frequency.value = 0.025 + note.gain;
      driftGain.gain.value = 0.12;
      drift.connect(driftGain);
      driftGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(padFilter);
      osc.start(now);
      drift.start(now);

      this.oscillators.push(osc, drift);
    }
  }

  private startOceanBreath(oceanDestination: AudioNode, shimmerDestination: AudioNode, now: number) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const ocean = this.createNoiseSource(7, 0.965);
    const oceanHighpass = ctx.createBiquadFilter();
    const oceanLowpass = ctx.createBiquadFilter();
    oceanHighpass.type = "highpass";
    oceanHighpass.frequency.value = 90;
    oceanLowpass.type = "lowpass";
    oceanLowpass.frequency.value = 1250;
    oceanLowpass.Q.value = 0.7;
    ocean.connect(oceanHighpass);
    oceanHighpass.connect(oceanLowpass);
    oceanLowpass.connect(oceanDestination);
    ocean.start(now);

    const foam = this.createNoiseSource(5, 0.82);
    const foamHighpass = ctx.createBiquadFilter();
    const foamLowpass = ctx.createBiquadFilter();
    foamHighpass.type = "highpass";
    foamHighpass.frequency.value = 760;
    foamLowpass.type = "lowpass";
    foamLowpass.frequency.value = 2600;
    foam.connect(foamHighpass);
    foamHighpass.connect(foamLowpass);
    foamLowpass.connect(shimmerDestination);
    foam.start(now);
  }

  private startBreathModulation(destination: GainNode, frequency: number, depth: number, now: number) {
    if (!this.ctx) return;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = frequency;
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(destination.gain);
    lfo.start(now);
    this.oscillators.push(lfo);
  }

  private scheduleBellPhrase(delaySec: number) {
    const timer = setTimeout(() => {
      if (!this.ctx || !this.masterGain || !this.running) return;

      const phrase = this.pickBellPhrase();
      const startAt = this.ctx.currentTime + 0.02;
      phrase.forEach((freq, index) => this.playBell(freq, startAt + index * 0.52));
      this.scheduleBellPhrase(6.8 + Math.random() * 3.2);
    }, delaySec * 1000);

    this.timers.push(timer);
  }

  private pickBellPhrase() {
    const phrases = [
      [587.33, 739.99, 880], // D5 F#5 A5
      [659.25, 880, 987.77], // E5 A5 B5
      [440, 587.33, 739.99], // A4 D5 F#5
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private playBell(freq: number, startAt: number) {
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startAt);
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    filter.Q.value = 0.45;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.028, startAt + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 3.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startAt);
    osc.stop(startAt + 4.2);
    this.oscillators.push(osc);
  }

  private createNoiseSource(durationSec: number, smoothing: number) {
    if (!this.ctx) throw new Error("Audio context is not ready");

    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * smoothing + white * (1 - smoothing);
      data[i] = last * 1.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    this.noiseSources.push(source);
    return source;
  }

  private createReverbImpulse(durationSec: number, decay: number) {
    if (!this.ctx) throw new Error("Audio context is not ready");

    const ctx = this.ctx;
    const length = Math.floor(ctx.sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * (1 - t) ** (3.5 + decay * 6) * 0.16;
      }
    }

    return impulse;
  }
}
