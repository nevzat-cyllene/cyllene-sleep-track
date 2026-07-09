/** Procedural meditative drone — harici dosya gerekmez, PWA offline uyumlu */
export class AmbientWelcomeSound {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private running = false;

  async start(): Promise<void> {
    if (this.running) return;

    this.ctx = new AudioContext();
    await this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    const layers: { freq: number; gain: number; type: OscillatorType }[] = [
      { freq: 55, gain: 0.07, type: "sine" },
      { freq: 82.41, gain: 0.045, type: "sine" },
      { freq: 110, gain: 0.035, type: "triangle" },
      { freq: 164.81, gain: 0.02, type: "sine" },
    ];

    const now = this.ctx.currentTime;

    for (const layer of layers) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = layer.type;
      osc.frequency.value = layer.freq;
      gain.gain.value = layer.gain;
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      this.oscillators.push(osc);
    }

    this.masterGain.gain.linearRampToValueAtTime(0.42, now + 4);
    this.running = true;
  }

  async fadeOut(durationSec = 2): Promise<void> {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationSec);

    await new Promise((r) => setTimeout(r, durationSec * 1000 + 100));
    this.dispose();
  }

  dispose(): void {
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
    this.running = false;
  }
}
