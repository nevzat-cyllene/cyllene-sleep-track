export function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export async function decodeWavBlob(blob: Blob): Promise<Float32Array | null> {
  try {
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);
    if (buffer.byteLength < 44) return null;

    const dataOffset = 44;
    const sampleCount = Math.floor((buffer.byteLength - dataOffset) / 2);
    if (sampleCount <= 0) return null;

    const samples = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const int16 = view.getInt16(dataOffset + i * 2, true);
      samples[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
    }
    return samples;
  } catch {
    return null;
  }
}

export function formatEventTime(timestamp: number, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  snore: "Horlama",
  cough: "Öksürük",
  talk: "Konuşma",
  noise: "Hareket / dış ses",
};
