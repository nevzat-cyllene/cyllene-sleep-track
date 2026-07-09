"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTime } from "@/lib/sleep-utils";
import type { SleepEvent } from "@/types";

interface NightTimelineChartProps {
  sessionStart: string;
  events: SleepEvent[];
  avgDb?: number | null;
}

const EVENT_COLORS: Record<string, string> = {
  snore: "var(--chart-4)",
  cough: "var(--chart-3)",
  talk: "var(--chart-1)",
  noise: "var(--chart-5)",
};

export function NightTimelineChart({
  sessionStart,
  events,
}: NightTimelineChartProps) {
  const startMs = new Date(sessionStart).getTime();

  const chartData = events.map((event) => ({
    time: formatTime(event.occurred_at),
    db: Number(event.peak_db),
    type: event.event_type,
    timestamp: new Date(event.occurred_at).getTime() - startMs,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Bu gece için grafik verisi yok
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="dbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
          <XAxis dataKey="time" stroke="oklch(0.7 0.04 265)" fontSize={12} />
          <YAxis stroke="oklch(0.7 0.04 265)" fontSize={12} domain={[20, 80]} />
          <Tooltip
            contentStyle={{
              background: "oklch(0.16 0.04 265 / 95%)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "12px",
            }}
            formatter={(value, _name, props) => [
              `${value} dB (${props.payload.type})`,
              "Ses",
            ]}
          />
          <Area
            type="monotone"
            dataKey="db"
            stroke="var(--chart-2)"
            fill="url(#dbGradient)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!cx || !cy) return <></>;
              return (
                <circle
                  key={`dot-${payload.time}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={EVENT_COLORS[payload.type] ?? EVENT_COLORS.noise}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
