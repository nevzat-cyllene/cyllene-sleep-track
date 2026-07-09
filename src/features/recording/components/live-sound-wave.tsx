"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { dbToPercent } from "@/lib/sleep-utils";

interface LiveSoundWaveProps {
  samples: number[];
  currentDb: number;
  className?: string;
}

export function LiveSoundWave({ samples, currentDb, className }: LiveSoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const mid = h / 2;

    ctx.clearRect(0, 0, w, h);

    const data = samples.length > 0 ? samples : [currentDb];
    const step = w / Math.max(data.length - 1, 1);

    ctx.beginPath();
    ctx.moveTo(0, mid);

    data.forEach((db, i) => {
      const amp = (dbToPercent(db) / 100) * (h * 0.42);
      const x = i * step;
      const y = mid - amp;
      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevX = (i - 1) * step;
        const prevAmp = (dbToPercent(data[i - 1]) / 100) * (h * 0.42);
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpX, mid - prevAmp, x, y);
      }
    });

  ctx.lineTo(w, mid);
    ctx.strokeStyle = "var(--chart-2)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "oklch(0.78 0.14 195 / 60%)";
    ctx.shadowBlur = 8;
    ctx.stroke();

    const liveAmp = (dbToPercent(currentDb) / 100) * (h * 0.42);
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.strokeStyle = "oklch(1 0 0 / 12%)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w - 4, mid - liveAmp, 3, 0, Math.PI * 2);
    ctx.fillStyle = "var(--chart-2)";
    ctx.fill();
  }, [samples, currentDb]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-24 w-full max-w-md", className)}
      aria-hidden
    />
  );
}
