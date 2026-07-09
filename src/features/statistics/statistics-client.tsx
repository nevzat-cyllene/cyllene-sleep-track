"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildTrendData, type StatsPeriod } from "@/lib/sleep-analytics";
import type { SleepSession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsClientProps {
  sessions: SleepSession[];
}

export function StatisticsClient({ sessions }: StatisticsClientProps) {
  const [period, setPeriod] = useState<StatsPeriod>("months");

  const trend = useMemo(() => buildTrendData(sessions, period), [sessions, period]);

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Uyku düzeninizi iyileştirin</h1>
        <p className="text-sm text-muted-foreground">Kalite ve düzenlilik trendleri</p>
      </div>

      <Card className="border-white/10 bg-[#0A1621]/90 shadow-soft">
        <CardHeader>
          <CardTitle>İstatistikler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as StatsPeriod)}
          >
            <TabsList className="grid w-full grid-cols-4 bg-black/30">
              <TabsTrigger value="days">Günler</TabsTrigger>
              <TabsTrigger value="weeks">Haftalar</TabsTrigger>
              <TabsTrigger value="months">Aylar</TabsTrigger>
              <TabsTrigger value="all">Hepsi</TabsTrigger>
            </TabsList>

            <TabsContent value={period} className="mt-6 space-y-8">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Uyku kalitesi</h3>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="h-48 w-full">
                  {trend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Yeterli veri yok
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                        <XAxis dataKey="label" fontSize={11} stroke="oklch(0.7 0.04 265)" />
                        <YAxis domain={[40, 100]} fontSize={11} stroke="oklch(0.7 0.04 265)" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="quality"
                          stroke="var(--chart-3)"
                          fill="url(#qualityGrad)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Düzenlilik</h3>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="h-48 w-full">
                  {trend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Yeterli veri yok
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                        <XAxis dataKey="label" fontSize={11} stroke="oklch(0.7 0.04 265)" />
                        <YAxis domain={[40, 100]} fontSize={11} stroke="oklch(0.7 0.04 265)" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="regularity"
                          stroke="var(--chart-2)"
                          fill="url(#regGrad)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
