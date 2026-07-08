import * as tf from "@tensorflow/tfjs";
import type { SleepEventType } from "@/types";

const YAMNET_MODEL_URL =
  "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1/model.json?tfjs-format=file";

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

let model: tf.GraphModel | null = null;
let loading: Promise<tf.GraphModel> | null = null;

export async function loadYamnetModel(): Promise<tf.GraphModel> {
  if (model) return model;
  if (loading) return loading;

  loading = tf.loadGraphModel(YAMNET_MODEL_URL, { fromTFHub: true }).then((m) => {
    model = m;
    return m;
  });

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

  for (let i = 0; i < audio.length; i += chunkSize) {
    const chunk = audio.subarray(i, Math.min(i + chunkSize, audio.length));
    let rms = 0;
    for (let j = 0; j < chunk.length; j++) rms += chunk[j] * chunk[j];
    rms = Math.sqrt(rms / chunk.length);
    peak = Math.max(peak, rms);

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

  if (lowEnergy / total > 0.55 && peak > 0.02) {
    return { type: "snore", confidence: 0.65 };
  }
  if (highEnergy / total > 0.4 && peak > 0.05) {
    return { type: "cough", confidence: 0.6 };
  }
  if (midEnergy / total > 0.35) {
    return { type: "talk", confidence: 0.55 };
  }
  return { type: "noise", confidence: 0.5 };
}

export async function classifyAudio(
  audio: Float32Array,
  sampleRate: number
): Promise<{ type: SleepEventType; confidence: number }> {
  try {
    const yamnet = await loadYamnetModel();
    const waveform = resampleTo16k(audio, sampleRate);
    const input = tf.tensor1d(waveform);
    const output = yamnet.execute(input) as tf.Tensor | tf.Tensor[];
    const scores = Array.isArray(output) ? await output[0].data() : await output.data();

    input.dispose();
    if (Array.isArray(output)) output.forEach((t) => t.dispose());
    else output.dispose();

    let bestType: SleepEventType = "noise";
    let bestScore = 0;

    for (let i = 0; i < Math.min(scores.length, YAMNET_CLASSES.length); i++) {
      const className = YAMNET_CLASSES[i];
      const mapped = CLASS_MAP[className];
      if (mapped && scores[i] > bestScore) {
        bestScore = scores[i];
        bestType = mapped;
      }
    }

    if (bestScore > 0.15) {
      return { type: bestType, confidence: Math.min(0.99, bestScore) };
    }
  } catch {
    // Model load/inference failed — use heuristic
  }

  return heuristicClassify(audio, sampleRate);
}

export async function preloadYamnet(): Promise<void> {
  try {
    await loadYamnetModel();
  } catch {
    // Heuristic fallback will be used
  }
}
