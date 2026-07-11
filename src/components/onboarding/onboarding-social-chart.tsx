"use client";

import { useI18n } from "@/i18n/runtime";

export function OnboardingSocialChart() {
  const { t } = useI18n();
  const points = [
    { x: 0, y: 35 },
    { x: 1, y: 42 },
    { x: 2, y: 48 },
    { x: 3, y: 58 },
    { x: 4, y: 72 },
    { x: 5, y: 88 },
  ];

  const width = 280;
  const height = 140;
  const pad = 16;

  const toX = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const toY = (v: number) => height - pad - (v / 100) * (height - pad * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.y)}`)
    .join(" ");

  const areaD = `${pathD} L ${toX(points.length - 1)} ${height - pad} L ${toX(0)} ${height - pad} Z`;

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="onboardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.14 195)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="oklch(0.78 0.14 195)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((v) => (
          <line
            key={v}
            x1={pad}
            x2={width - pad}
            y1={toY(v)}
            y2={toY(v)}
            stroke="white"
            strokeOpacity={0.06}
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaD} fill="url(#onboardGrad)" />
        <path d={pathD} fill="none" stroke="oklch(0.78 0.14 195)" strokeWidth={2.5} />
        {points.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p.y)} r={3} fill="white" />
        ))}
        <circle cx={toX(5)} cy={toY(88)} r={10} fill="oklch(0.78 0.14 195)" />
        <path
          d={`M ${toX(5) - 4} ${toY(88)} l 3 3 6 -7`}
          stroke="white"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-2 text-center text-xs text-white/40">{t("onboarding.socialChart.title")}</p>
    </div>
  );
}
