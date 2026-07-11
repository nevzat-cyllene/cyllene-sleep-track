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
  Snoring: "snore",
  Cough: "cough",
  "Throat clearing": "cough",
  Speech: "talk",
  Conversation: "talk",
  "Narration, monologue": "talk",
  Laughter: "talk",
  Giggle: "talk",
  Whispering: "talk",
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

function heuristicClassify(audio: Float32Array, sampleRate: number): {
  type: SleepEventType;
  confidence: number;
} {
  const chunkSize = Math.floor(sampleRate * 0.1);
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
    rms = Math.sqrt(rms / chunk.length);
    peak = Math.max(peak, rms);
    chunkCount += 1;
    if (rms > 0.012) activeChunks += 1;
    if (rms > 0.045) loudChunks += 1;

    const zeroCrossings = chunk.reduce((count, val, idx, arr) => {
      if (idx === 0) return 0;
      return count + (val >= 0 !== arr[idx - 1] >= 0 ? 1 : 0);
    }, 0);
    const zcr = zeroCrossings / chunk.length;

    if (zcr < 0.05) lowEnergy += rms;
    else if (zcr < 0.15) midEnergy += rms;
    else highEnergy += rms;
  }

  const total = lowEnergy + midEnergy + highEnergy || 1;
  const lowRatio = lowEnergy / total;
  const midRatio = midEnergy / total;
  const highRatio = highEnergy / total;
  const activeRatio = activeChunks / Math.max(1, chunkCount);
  const loudRatio = loudChunks / Math.max(1, chunkCount);

  if ((highRatio > 0.34 || loudRatio > 0.18) && peak > 0.045) {
    return { type: "cough", confidence: 0.64 };
  }

  if (lowRatio > 0.68 && highRatio < 0.22 && activeRatio > 0.42 && peak > 0.024) {
    return { type: "snore", confidence: 0.62 };
  }

  if (midRatio > 0.35) {
    return { type: "talk", confidence: 0.55 };
  }
  return { type: "noise", confidence: 0.5 };
}

export async function classifyAudio(
  audio: Float32Array,
  sampleRate: number
): Promise<{ type: SleepEventType; confidence: number }> {
  // Default path: no network, no TF — recording stays responsive.
  if (!YAMNET_LOAD) {
    return heuristicClassify(audio, sampleRate);
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

    let bestType: SleepEventType = "noise";
    let bestScore = 0;
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
      if (mapped && scores[i] > bestScore) {
        bestScore = scores[i];
        bestType = mapped;
      }
    }

    if (mappedScores.cough > 0.12 && mappedScores.cough >= mappedScores.snore * 0.82) {
      return { type: "cough", confidence: Math.min(0.99, mappedScores.cough) };
    }

    if (bestScore > (bestType === "snore" ? 0.18 : 0.15)) {
      return { type: bestType, confidence: Math.min(0.99, bestScore) };
    }
  } catch {
    // Model load/inference failed — use heuristic
  }

  return heuristicClassify(audio, sampleRate);
}
