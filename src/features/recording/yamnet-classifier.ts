import type { SleepEventType } from "@/types";

/**
 * Optional ML classifier. Recording must never depend on this loading.
 * Without a CORS-safe NEXT_PUBLIC_YAMNET_MODEL_URL, heuristic runs only.
 * tfhub.dev is rejected — browsers block it with CORS.
 */
const RAW_YAMNET_MODEL_URL = process.env.NEXT_PUBLIC_YAMNET_MODEL_URL?.trim() ?? "";

function resolveYamnetLoadConfig(rawUrl: string): { url: string; fromTFHub: boolean } | null {
  if (!rawUrl) return null;
  if (rawUrl.includes("tfhub.dev")) return null;

  const hasModelJson = /model\.json(\?|$)/.test(rawUrl);
  return {
    url: rawUrl,
    fromTFHub: !hasModelJson,
  };
}

const YAMNET_LOAD = resolveYamnetLoadConfig(RAW_YAMNET_MODEL_URL);

const CLASS_MAP: Record<string, SleepEventType> = {
  // Snore family — prefer labeling real night breathing events as snore
  Snoring: "snore",
  Breathing: "snore",
  Wheeze: "snore",
  Snort: "snore",
  Gasp: "snore",
  Pant: "snore",
  // Cough
  Cough: "cough",
  "Throat clearing": "cough",
  Sneeze: "cough",
  // Speech / talk
  Speech: "talk",
  "Child speech, kid speaking": "talk",
  Conversation: "talk",
  "Narration, monologue": "talk",
  Babbling: "talk",
  Whispering: "talk",
  Laughter: "talk",
  Giggle: "talk",
  Shout: "talk",
  Yell: "talk",
  Humming: "talk",
  Groan: "talk",
  Grunt: "talk",
  // Bed movement / body / impact → noise bucket (UI: hareket / dış ses)
  Run: "noise",
  Shuffle: "noise",
  "Walk, footsteps": "noise",
  Hands: "noise",
  "Finger snapping": "noise",
  Clapping: "noise",
  Chewing: "noise",
  "Chewing, mastication": "noise",
};

const YAMNET_CLASSES = [
  "Speech", "Child speech, kid speaking", "Conversation", "Narration, monologue",
  "Babbling", "Speech synthesizer", "Shout", "Bellow", "Whoop", "Yell",
  "Children shouting", "Screaming", "Whispering", "Laughter", "Baby laughter",
  "Giggle", "Snicker", "Belly laugh", "Chuckle, chortle", "Crying, sobbing",
  "Baby cry, infant cry", "Whimper", "Wail, moan", "Sigh", "Singing",
  "Choir", "Yodeling", "Chant", "Mantra", "Child singing", "Synthetic singing",
  "Rapping", "Humming", "Groan", "Grunt", "Whistling", "Breathing",
  "Wheeze", "Snoring", "Gasp", "Pant", "Snort", "Cough", "Throat clearing",
  "Sneeze", "Sniff", "Run", "Shuffle", "Walk, footsteps", "Chewing, mastication",
  "Biting", "Gargling", "Stomach rumble", "Burping, eructation", "Hiccup",
  "Fart", "Hands", "Finger snapping", "Clapping", "Heart sounds, heartbeat",
  "Heart murmur", "Cheering", "Applause", "Chatter", "Crowd", "Hubbub, speech noise, speech babble",
];

// Lazy TF types — no static @tensorflow/tfjs import on the recording critical path.
type TfModule = typeof import("@tensorflow/tfjs");
type GraphModel = import("@tensorflow/tfjs").GraphModel;

let tfModule: TfModule | null = null;
let model: GraphModel | null = null;
let loading: Promise<GraphModel> | null = null;

async function getTf(): Promise<TfModule> {
  if (tfModule) return tfModule;
  tfModule = await import("@tensorflow/tfjs");
  return tfModule;
}

async function loadYamnetModel(): Promise<GraphModel> {
  if (!YAMNET_LOAD) {
    throw new Error("YAMNet model URL is not configured; heuristic classifier is active.");
  }

  if (model) return model;
  if (loading) return loading;

  loading = (async () => {
    const tf = await getTf();
    try {
      const loaded = await tf.loadGraphModel(
        YAMNET_LOAD.url,
        YAMNET_LOAD.fromTFHub ? { fromTFHub: true } : undefined
      );
      model = loaded;
      return loaded;
    } catch (error) {
      loading = null;
      throw error;
    }
  })();

  return loading;
}

function resampleTo16k(audio: Float32Array, sampleRate: number): Float32Array {
  const targetRate = 16000;
  if (sampleRate === targetRate) return audio;

  const ratio = sampleRate / targetRate;
  const newLength = Math.floor(audio.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const idx = Math.floor(srcIndex);
    const frac = srcIndex - idx;
    const s0 = audio[idx] ?? 0;
    const s1 = audio[idx + 1] ?? s0;
    result[i] = s0 + frac * (s1 - s0);
  }
  return result;
}

/** Snore cycles are often ~0.8–3.5s — autocorrelation of the RMS envelope. */
function envelopePeriodicity(envelope: number[]): number {
  if (envelope.length < 12) return 0;

  const mean = envelope.reduce((sum, value) => sum + value, 0) / envelope.length;
  const centered = envelope.map((value) => value - mean);
  const energy = centered.reduce((sum, value) => sum + value * value, 0);
  if (energy < 1e-10) return 0;

  let best = 0;
  const minLag = 8;
  const maxLag = Math.min(35, Math.floor(envelope.length / 2));

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    const n = envelope.length - lag;
    for (let i = 0; i < n; i++) corr += centered[i] * centered[i + lag];
    best = Math.max(best, corr / energy);
  }

  return Math.max(0, Math.min(1, best));
}

function heuristicClassify(audio: Float32Array, sampleRate: number): {
  type: SleepEventType;
  confidence: number;
} {
  const chunkSize = Math.max(1, Math.floor(sampleRate * 0.1));
  const durationSec = audio.length / Math.max(1, sampleRate);
  const envelope: number[] = [];

  let lowEnergy = 0;
  let midEnergy = 0;
  let highEnergy = 0;
  let peak = 0;
  let activeChunks = 0;
  let loudChunks = 0;
  let chunkCount = 0;

  for (let i = 0; i < audio.length; i += chunkSize) {
    const chunk = audio.subarray(i, Math.min(i + chunkSize, audio.length));
    let rms = 0;
    for (let j = 0; j < chunk.length; j++) rms += chunk[j] * chunk[j];
    rms = Math.sqrt(rms / Math.max(1, chunk.length));
    peak = Math.max(peak, rms);
    envelope.push(rms);
    chunkCount += 1;
    if (rms > 0.01) activeChunks += 1;
    if (rms > 0.04) loudChunks += 1;

    let zeroCrossings = 0;
    for (let j = 1; j < chunk.length; j++) {
      if (chunk[j] >= 0 !== chunk[j - 1] >= 0) zeroCrossings += 1;
    }
    const zcr = zeroCrossings / Math.max(1, chunk.length);

    if (zcr < 0.055) lowEnergy += rms;
    else if (zcr < 0.14) midEnergy += rms;
    else highEnergy += rms;
  }

  const total = lowEnergy + midEnergy + highEnergy || 1;
  const lowRatio = lowEnergy / total;
  const midRatio = midEnergy / total;
  const highRatio = highEnergy / total;
  const activeRatio = activeChunks / Math.max(1, chunkCount);
  const loudRatio = loudChunks / Math.max(1, chunkCount);
  const periodicity = envelopePeriodicity(envelope);

  // Short, sharp, bright burst → cough / throat clear
  if (
    durationSec < 2.2 &&
    peak > 0.048 &&
    (highRatio > 0.3 || loudRatio > 0.2) &&
    periodicity < 0.28
  ) {
    return { type: "cough", confidence: 0.66 };
  }

  // Rhythmic low-band energy → snore (even a short 1–3 burst cluster)
  const snoreLike =
    (periodicity > 0.2 && lowRatio > 0.48 && highRatio < 0.34 && peak > 0.014) ||
    (lowRatio > 0.56 && highRatio < 0.26 && activeRatio > 0.3 && peak > 0.016) ||
    (periodicity > 0.28 && lowRatio > 0.42 && highRatio < 0.38 && peak > 0.012);

  if (snoreLike && midRatio < 0.55) {
    const confidence = Math.min(0.86, 0.58 + periodicity * 0.35 + lowRatio * 0.12);
    return { type: "snore", confidence };
  }

  // Sustained mid-band, less rhythmic → talk
  if (
    midRatio > 0.3 &&
    highRatio > 0.1 &&
    periodicity < 0.26 &&
    durationSec > 0.55 &&
    peak > 0.014
  ) {
    return { type: "talk", confidence: 0.58 };
  }

  // Short irregular / broadband → bed movement or external noise
  if (durationSec < 3.5 && periodicity < 0.18 && (highRatio > 0.22 || loudRatio > 0.12)) {
    return { type: "noise", confidence: 0.56 };
  }

  // Soft snore fallback: quiet low-band night sound that didn't meet talk rules
  if (lowRatio > 0.5 && highRatio < 0.3 && peak > 0.012 && midRatio < 0.42) {
    return { type: "snore", confidence: 0.54 };
  }

  return { type: "noise", confidence: 0.5 };
}

function decideFromYamnetScores(mappedScores: Record<SleepEventType, number>): {
  type: SleepEventType;
  confidence: number;
} | null {
  const { snore, cough, talk, noise } = mappedScores;

  // Cough wins only when clearly stronger than snore
  if (cough > 0.1 && cough >= snore * 0.9 && cough >= talk * 0.85) {
    return { type: "cough", confidence: Math.min(0.99, cough) };
  }

  // Prefer snore when present — even modest scores (1–3 events should still say Horlama)
  if (snore > 0.08 && snore >= talk * 0.75 && snore >= cough * 0.7) {
    return { type: "snore", confidence: Math.min(0.99, Math.max(snore, 0.45)) };
  }

  if (talk > 0.12 && talk >= snore * 1.05) {
    return { type: "talk", confidence: Math.min(0.99, talk) };
  }

  if (noise > 0.14 && noise >= Math.max(snore, talk, cough)) {
    return { type: "noise", confidence: Math.min(0.99, noise) };
  }

  const ranked = (
    [
      ["snore", snore],
      ["cough", cough],
      ["talk", talk],
      ["noise", noise],
    ] satisfies Array<[SleepEventType, number]>
  ).sort((a, b) => b[1] - a[1])[0];

  if (ranked[1] > (ranked[0] === "snore" ? 0.1 : 0.13)) {
    return { type: ranked[0], confidence: Math.min(0.99, ranked[1]) };
  }

  return null;
}

export async function classifyAudio(
  audio: Float32Array,
  sampleRate: number
): Promise<{ type: SleepEventType; confidence: number }> {
  const heuristic = heuristicClassify(audio, sampleRate);

  // Default path: no network, no TF — recording stays responsive.
  if (!YAMNET_LOAD) {
    return heuristic;
  }

  try {
    const tf = await getTf();
    const yamnet = await loadYamnetModel();
    const waveform = resampleTo16k(audio, sampleRate);
    const input = tf.tensor1d(waveform);
    const output = yamnet.execute(input) as import("@tensorflow/tfjs").Tensor | import("@tensorflow/tfjs").Tensor[];
    const scores = Array.isArray(output) ? await output[0].data() : await output.data();

    input.dispose();
    if (Array.isArray(output)) output.forEach((t) => t.dispose());
    else output.dispose();

    const mappedScores: Record<SleepEventType, number> = {
      snore: 0,
      cough: 0,
      talk: 0,
      noise: 0,
    };

    for (let i = 0; i < Math.min(scores.length, YAMNET_CLASSES.length); i++) {
      const className = YAMNET_CLASSES[i];
      const mapped = CLASS_MAP[className];
      if (mapped) {
        mappedScores[mapped] = Math.max(mappedScores[mapped], scores[i]);
      }
    }

    const decided = decideFromYamnetScores(mappedScores);
    if (decided) {
      // If model is soft-noise but heuristic clearly heard snore/talk/cough, trust heuristic.
      if (decided.type === "noise" && heuristic.type !== "noise" && heuristic.confidence >= 0.54) {
        return heuristic;
      }
      return decided;
    }
  } catch {
    // Model load/inference failed — use heuristic
  }

  return heuristic;
}
