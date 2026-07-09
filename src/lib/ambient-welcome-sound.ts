/** Derin uyku / meditasyon ambient — nefes modülasyonlu drone */
export class AmbientWelcomeSound {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private breathGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private breathLfo: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private running = false;

  async start(): Promise<void> {
    if (this.running) return;

    this.ctx = new AudioContext();
    await this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.value = 1;
    this.breathGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    const layers: { freq: number; gain: number; type: OscillatorType }[] = [
      { freq: 55, gain: 0.1, type: "sine" },
      { freq: 82.41, gain: 0.065, type: "sine" },
      { freq: 110, gain: 0.045, type: "triangle" },
      { freq: 164.81, gain: 0.028, type: "sine" },
      { freq: 220, gain: 0.015, type: "sine" },
    ];

    for (const layer of layers) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = layer.type;
      osc.frequency.value = layer.freq;
      gain.gain.value = layer.gain;
      osc.connect(gain);
      gain.connect(this.breathGain);
      osc.start(now);
      this.oscillators.push(osc);
    }

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.98 + white * 0.02;
      data[i] = last * 2.5;
    }
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 280;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.018;
    this.noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.breathGain);
    this.noiseSource.start(now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 2.5;
    lfo.connect(lfoGain);
    if (this.oscillators[0]) {
      lfoGain.connect(this.oscillators[0].frequency);
    }
    lfo.start(now);
    this.lfo = lfo;

    const breathLfo = this.ctx.createOscillator();
    const breathLfoGain = this.ctx.createGain();
    breathLfo.type = "sine";
    breathLfo.frequency.value = 0.12;
    breathLfoGain.gain.value = 0.12;
    breathLfo.connect(breathLfoGain);
    if (this.breathGain) {
      breathLfoGain.connect(this.breathGain.gain);
    }
    breathLfo.start(now);
    this.breathLfo = breathLfo;

    this.masterGain.gain.linearRampToValueAtTime(0.55, now + 8);
    this.running = true;
  }

  async fadeOut(durationSec = 2.5): Promise<void> {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationSec);

    await new Promise((r) => setTimeout(r, durationSec * 1000 + 150));
    this.dispose();
  }

  dispose(): void {
    try {
      this.noiseSource?.stop();
      this.noiseSource?.disconnect();
    } catch {
      // ignore
    }
    this.noiseSource = null;

    try {
      this.lfo?.stop();
      this.lfo?.disconnect();
      this.breathLfo?.stop();
      this.breathLfo?.disconnect();
    } catch {
      // ignore
    }
    this.lfo = null;
    this.breathLfo = null;

    for (const osc of this.oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    this.oscillators = [];
    void this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.breathGain = null;
    this.running = false;
  }
}
