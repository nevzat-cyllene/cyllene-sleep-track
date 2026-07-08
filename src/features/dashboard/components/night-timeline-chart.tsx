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
  snore: "oklch(0.65 0.22 25)",
  cough: "oklch(0.75 0.18 85)",
  talk: "oklch(0.68 0.2 285)",
  noise: "oklch(0.6 0.12 265)",
};

export function NightTimelineChart({
  sessionStart,
  events,
  avgDb = 35,
}: NightTimelineChartProps) {
  const startMs = new Date(sessionStart).getTime();

  const chartData = events.map((event) => ({
    time: formatTime(event.occurred_at),
    db: Number(event.peak_db),
    type: event.event_type,
    timestamp: new Date(event.occurred_at).getTime() - startMs,
  }));

  if (chartData.length === 0) {
    const hours = Array.from({ length: 8 }, (_, i) => ({
      time: formatTime(startMs + i * 3600000),
      db: avgDb ?? 30 + Math.random() * 10,
    }));
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hours}>
            <defs>
              <linearGradient id="dbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.68 0.2 285)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.68 0.2 285)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.05 265 / 40%)" />
            <XAxis dataKey="time" stroke="oklch(0.6 0.04 265)" fontSize={12} />
            <YAxis stroke="oklch(0.6 0.04 265)" fontSize={12} domain={[20, 80]} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.16 0.04 265)",
                border: "1px solid oklch(0.3 0.05 265 / 40%)",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="db"
              stroke="oklch(0.68 0.2 285)"
              fill="url(#dbGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="dbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.68 0.2 285)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.68 0.2 285)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.05 265 / 40%)" />
          <XAxis dataKey="time" stroke="oklch(0.6 0.04 265)" fontSize={12} />
          <YAxis stroke="oklch(0.6 0.04 265)" fontSize={12} domain={[20, 80]} />
          <Tooltip
            contentStyle={{
              background: "oklch(0.16 0.04 265)",
              border: "1px solid oklch(0.3 0.05 265 / 40%)",
              borderRadius: "8px",
            }}
            formatter={(value, _name, props) => [
              `${value} dB (${props.payload.type})`,
              "Ses",
            ]}
          />
          <Area
            type="monotone"
            dataKey="db"
            stroke="oklch(0.68 0.2 285)"
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
