export type UserPlan = "free" | "premium";

export type SleepEventType = "snore" | "cough" | "talk" | "noise";

export interface NoiseSample {
  timestamp: number;
  db: number;
}

export interface LocalSleepEvent {
  id: string;
  timestamp: number;
  durationMs: number;
  peakDb: number;
  type: SleepEventType;
  confidence: number;
}

export interface LocalSleepSession {
  id: string;
  userId?: string;
  startedAt: number;
  endedAt?: number;
  noiseSamples: NoiseSample[];
  events: LocalSleepEvent[];
  interruptionCount: number;
  synced: boolean;
  sleepScore?: number;
  avgDb?: number;
  peakDb?: number;
}

export interface SleepSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  sleep_score: number | null;
  avg_db: number | null;
  peak_db: number | null;
  snore_count: number;
  cough_count: number;
  talk_count: number;
  noise_count: number;
  interruption_count: number;
  created_at: string;
}

export interface SleepEvent {
  id: string;
  session_id: string;
  occurred_at: string;
  duration_ms: number;
  event_type: SleepEventType;
  peak_db: number;
  confidence: number;
  created_at: string;
}

export interface SleepNoiseSample {
  id: string;
  session_id: string;
  minute_offset: number;
  avg_db: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: UserPlan;
  status: string;
  provider: string | null;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
