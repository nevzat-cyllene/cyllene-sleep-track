"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, CalendarRange, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildTrendData, type StatsPeriod } from "@/lib/sleep-analytics";
import type { SleepSession } from "@/types";

interface StatisticsClientProps {
  sessions: SleepSession[];
}

export function StatisticsClient({ sessions }: StatisticsClientProps) {
  const [period, setPeriod] = useState<StatsPeriod>("months");
  const trend = useMemo(() => buildTrendData(sessions, period), [sessions, period]);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Uyku içgörüleri
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">Ritmini keşfet.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Uyku kalitesi ve düzenliliğinin zaman içindeki değişimi.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-white/35">
          <CalendarRange className="h-3.5 w-3.5 text-[#78b7ff]" />
          {sessions.length} gece analiz edildi
        </div>
      </div>

      <div className="surface-panel rounded-[1.8rem] p-4 sm:p-6">
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

          <TabsContent value={period} className="mt-6 grid gap-4 xl:grid-cols-2">
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

      <div className="mt-6 h-56 w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <BarChart3 className="h-6 w-6 text-white/15" />
            <p className="mt-3 text-sm text-muted-foreground">Henüz yeterli veri yok.</p>
            <p className="mt-1 text-[11px] text-white/25">Birkaç gece sonra trendin burada oluşur.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
