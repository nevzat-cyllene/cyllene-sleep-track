import type { LocalSleepEvent, SleepEventType } from "@/types";

/** Aynı türde ardışık olaylar bu süreden kısa arayla gelirse tek klip olarak birleştirilir. */
export const EVENT_MERGE_GAP_MS = 12_000;

const MERGEABLE_TYPES = new Set<SleepEventType>(["snore", "cough", "talk"]);

export function isMergeableEventType(type: SleepEventType): boolean {
  return MERGEABLE_TYPES.has(type);
}

export function findMergeTargetEvent(
  events: LocalSleepEvent[],
  next: Pick<LocalSleepEvent, "type" | "timestamp">
): LocalSleepEvent | null {
  if (!isMergeableEventType(next.type)) return null;

  const last = events[events.length - 1];
  if (!last || last.type !== next.type) return null;

  const gapMs = next.timestamp - (last.timestamp + last.durationMs);
  if (gapMs > EVENT_MERGE_GAP_MS) return null;

  return last;
}

export function mergeFloat32Audio(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
