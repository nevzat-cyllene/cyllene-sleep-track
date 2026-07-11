"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  AudioWaveform,
  BarChart3,
  CalendarRange,
  Crown,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildTrendData, formatDurationHours, type StatsPeriod } from "@/lib/sleep-analytics";
import type { SleepEvent, SleepEventType, SleepSession } from "@/types";

interface StatisticsClientProps {
  sessions: SleepSession[];
  events: SleepEvent[];
}

const EVENT_LABELS: Record<SleepEventType, string> = {
  snore: "Horlama",
  cough: "Öksürük",
  talk: "Konuşma",
  noise: "Hareket / dış ses",
};

const EVENT_TONES: Record<SleepEventType, string> = {
  snore: "bg-[#79b7ff]",
  cough: "bg-[#75f2d6]",
  talk: "bg-[#9c8cff]",
  noise: "bg-[#f5b86b]",
};

function totalEvents(session: SleepSession) {
  return session.snore_count + session.cough_count + session.talk_count + session.noise_count;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function StatisticsClient({ sessions, events }: StatisticsClientProps) {
  const [period, setPeriod] = useState<StatsPeriod>("months");
  const trend = useMemo(() => buildTrendData(sessions, period), [sessions, period]);

  const signature = useMemo(() => {
    const scored = sessions
      .map((session) => session.sleep_score)
      .filter((score): score is number => typeof score === "number");
    const durations = sessions
      .map((session) => session.duration_minutes)
      .filter((duration): duration is number => typeof duration === "number");
    const eventTotal = sessions.reduce((sum, session) => sum + totalEvents(session), 0);
    const eventAverage = sessions.length ? Math.round(eventTotal / sessions.length) : 0;
    const quietScore = Math.max(8, Math.min(100, 100 - eventAverage * 6));

    return {
      avgScore: average(scored),
      avgDuration: average(durations),
      eventTotal,
      eventAverage,
      quietScore,
      scoredCount: scored.length,
    };
  }, [sessions]);

  const eventCounts = useMemo(
    () => ({
      snore: sessions.reduce((sum, session) => sum + session.snore_count, 0),
      cough: sessions.reduce((sum, session) => sum + session.cough_count, 0),
      talk: sessions.reduce((sum, session) => sum + session.talk_count, 0),
      noise: sessions.reduce((sum, session) => sum + session.noise_count, 0),
    }),
    [sessions]
  );

  return (
    <div className="space-y-6 pb-[calc(7.25rem+env(safe-area-inset-bottom))] sm:pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Uyku içgörüleri
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">Ritmini keşfet.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Uyku kalitesi, ses izi ve düzenliliğinin gerçek kayıtlarından oluşan özeti.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-white/35">
          <CalendarRange className="h-3.5 w-3.5 text-[#78b7ff]" />
          {sessions.length} gece analiz edildi
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <SleepSignatureCard sessions={sessions} signature={signature} />
        <DetectedMomentsCard events={events} eventCounts={eventCounts} />
      </div>

      <div className="surface-panel overflow-hidden rounded-[1.8rem] p-4 sm:p-6">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as StatsPeriod)}>
          <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Trend görünümü</p>
              <p className="mt-1 text-xs text-white/30">Dönemleri karşılaştır ve değişimi izle.</p>
            </div>
            <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl bg-[#050b19]/70 p-1 sm:w-auto sm:min-w-80">
              <TabsTrigger value="days" className="rounded-lg text-xs">
                Gün
              </TabsTrigger>
              <TabsTrigger value="weeks" className="rounded-lg text-xs">
                Hafta
              </TabsTrigger>
              <TabsTrigger value="months" className="rounded-lg text-xs">
                Ay
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg text-xs">
                Tümü
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={period} className="mt-5 grid gap-4 xl:grid-cols-2">
            <TrendCard
              title="Uyku kalitesi"
              description="Gece skorlarının dönemsel ortalaması"
              icon={BarChart3}
              data={trend}
              dataKey="quality"
              gradientId="qualityGrad"
              color="#6da9ff"
            />
            <TrendCard
              title="Düzenlilik"
              description="Uyku saatlerindeki tutarlılık"
              icon={Activity}
              data={trend}
              dataKey="regularity"
              gradientId="regularityGrad"
              color="#5ed7dc"
            />
          </TabsContent>
        </Tabs>
      </div>

      <PremiumAnalysisCard />
    </div>
  );
}

function SleepSignatureCard({
  sessions,
  signature,
}: {
  sessions: SleepSession[];
  signature: {
    avgScore: number;
    avgDuration: number;
    eventTotal: number;
    eventAverage: number;
    quietScore: number;
    scoredCount: number;
  };
}) {
  const durationPercent = Math.min(100, Math.round((signature.avgDuration / 480) * 100));
  const scorePercent = Math.max(0, Math.min(100, signature.avgScore));

  return (
    <section className="surface-panel overflow-hidden rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            Uyku imzası
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
            Gerçek kayıtlarından çıkan gece profili.
          </h2>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155eff]/12 text-[#9bd5ff]">
          <AudioWaveform className="h-4.5 w-4.5" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <MetricPill
          label="Skor"
          value={signature.avgScore ? `${signature.avgScore}` : "—"}
          detail={`${signature.scoredCount} gece`}
        />
        <MetricPill
          label="Süre"
          value={signature.avgDuration ? formatDurationHours(signature.avgDuration) : "—"}
          detail="ortalama"
        />
        <MetricPill
          label="Ses izi"
          value={`${signature.eventAverage}`}
          detail={`${signature.eventTotal} toplam`}
        />
      </div>

      <div className="mt-5 space-y-3 rounded-[1.35rem] border border-white/[0.06] bg-[#06142f]/70 p-4">
        <SignatureBar label="Skor ritmi" value={scorePercent} color="from-[#1769ff] to-[#6fd2ff]" />
        <SignatureBar label="Uyku süresi" value={durationPercent} color="from-[#5f8cff] to-[#8f7cff]" />
        <SignatureBar label="Sakinlik" value={signature.quietScore} color="from-[#75f2d6] to-[#6da9ff]" />
      </div>

      <p className="mt-4 text-[11px] leading-5 text-white/34">
        {sessions.length > 0
          ? "Bu bölüm pazarlama maketi değil; senkronize edilen gece kayıtlarının özetinden hesaplanır."
          : "İlk gece kaydından sonra bu imza otomatik oluşur."}
      </p>
    </section>
  );
}

function DetectedMomentsCard({
  events,
  eventCounts,
}: {
  events: SleepEvent[];
  eventCounts: Record<SleepEventType, number>;
}) {
  const total = Object.values(eventCounts).reduce((sum, value) => sum + value, 0);
  const recentEvents = events.slice(0, 3);

  return (
    <section className="surface-panel overflow-hidden rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            Tespit edilen anlar
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
            Ses olayları analiz akışında.
          </h2>
        </div>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] text-white/42">
          {total} olay
        </span>
      </div>

      {recentEvents.length > 0 ? (
        <div className="mt-5 space-y-2.5">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.035] px-3 py-2.5"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_TONES[event.event_type]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white/82">
                    {EVENT_LABELS[event.event_type]}
                  </p>
                  <span className="text-[10px] tabular-nums text-white/35">
                    {formatEventTime(event.occurred_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-white/32">
                  {Math.round(event.duration_ms / 1000)} sn · {Math.round(event.peak_db)} dB
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {(Object.keys(eventCounts) as SleepEventType[]).map((type) => {
            const count = eventCounts[type];
            const width = total > 0 ? Math.max(8, Math.round((count / total) * 100)) : 0;
            return (
              <div key={type}>
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/38">
                  <span>{EVENT_LABELS[type]}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${EVENT_TONES[type]}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
          {total === 0 && (
            <div className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-4 text-sm text-white/42">
              İlk tespit edilen olaylardan sonra burada gerçek dağılım görünecek.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PremiumAnalysisCard() {
  return (
    <section className="relative overflow-hidden rounded-[1.8rem] border border-[#8dbdff]/14 bg-[linear-gradient(120deg,rgba(18,48,96,.74),rgba(7,16,35,.92))] p-5 shadow-[0_24px_90px_rgba(24,105,255,.18),inset_0_1px_0_rgba(255,255,255,.07)] sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6fd2ff]/14 blur-[76px]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#9bd5ff]/72">
            <Crown className="h-3.5 w-3.5" />
            Cyllene Premium
          </div>
          <h2 className="text-2xl font-medium tracking-[-0.04em]">
            Daha derin içgörüler üyelik planına hazırlanıyor.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/42">
            Gelişmiş trend karşılaştırmaları, uzun dönem arşiv ve kişisel uyku notları premium
            planda yer alacak. Şimdilik kayıt ve temel analiz ücretsiz kalır.
          </p>
        </div>
        <button
          type="button"
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-5 text-sm font-semibold text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"
        >
          <LockKeyhole className="h-4 w-4 text-[#78b7ff]" />
          Premium üyelik yakında
        </button>
      </div>
    </section>
  );
}

function MetricPill({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-white/26">{label}</p>
      <p className="mt-1.5 text-lg font-medium tracking-[-0.04em]">{value}</p>
      <p className="mt-0.5 text-[10px] text-[#8fc0ff]/62">{detail}</p>
    </div>
  );
}

function SignatureBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/38">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TrendCard({
  title,
  description,
  icon: Icon,
  data,
  dataKey,
  gradientId,
  color,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
  data: ReturnType<typeof buildTrendData>;
  dataKey: "quality" | "regularity";
  gradientId: string;
  color: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/[0.065] bg-[#071126]/55 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="mt-1 text-[11px] text-white/28">{description}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className="h-4 w-4 text-[#78b7ff]" />
        </span>
      </div>

      <div className="mt-5 h-52 w-full overflow-visible sm:mt-6 sm:h-56">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <BarChart3 className="h-6 w-6 text-white/15" />
            <p className="mt-3 text-sm text-muted-foreground">Henüz yeterli veri yok.</p>
            <p className="mt-1 text-[11px] text-white/25">Birkaç gece sonra trendin burada oluşur.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.38} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,.055)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke="rgba(255,255,255,.25)"
              />
              <YAxis
                domain={[40, 100]}
                width={28}
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke="rgba(255,255,255,.25)"
              />
              <Tooltip
                contentStyle={{
                  background: "#09142a",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#${gradientId})`}
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
