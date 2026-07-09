"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { dbToPercent } from "@/lib/sleep-utils";

interface LiveSoundWaveProps {
  samples: number[];
  currentDb: number;
  className?: string;
}

const BUFFER_SIZE = 140;

export function LiveSoundWave({ samples, currentDb, className }: LiveSoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samplesRef = useRef(samples);
  const dbRef = useRef(currentDb);
  const phaseRef = useRef(0);

  useEffect(() => {
    samplesRef.current = samples;
    dbRef.current = currentDb;
  }, [samples, currentDb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = () => {
      phaseRef.current += 0.035;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1) {
        raf = requestAnimationFrame(draw);
        return;
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const mid = h / 2;
      const liveDb = dbRef.current;
      const history = samplesRef.current;

      const points: number[] = [];
      const tail = history.slice(-BUFFER_SIZE);
      while (tail.length < BUFFER_SIZE) tail.unshift(liveDb * 0.25);
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const db = i === BUFFER_SIZE - 1 ? liveDb : tail[i];
        const breathe = 1 + Math.sin(phaseRef.current + i * 0.06) * 0.03;
        points.push((dbToPercent(db) / 100) * (h * 0.42) * breathe);
      }

      ctx.clearRect(0, 0, w, h);

      const step = w / (BUFFER_SIZE - 1);
      const drawWave = (sign: 1 | -1, alpha: number, width: number) => {
        ctx.beginPath();
        ctx.moveTo(0, mid);
        for (let i = 0; i < BUFFER_SIZE; i++) {
          const x = i * step;
          const y = mid - sign * points[i];
          if (i === 0) ctx.lineTo(x, y);
          else {
            const prevX = (i - 1) * step;
            ctx.quadraticCurveTo((prevX + x) / 2, mid - sign * points[i - 1], x, y);
          }
        }
        ctx.strokeStyle = `oklch(0.78 0.14 195 / ${alpha}%)`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      drawWave(1, 18, 1);
      drawWave(-1, 10, 1);
      drawWave(1, 85, 1.5);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const level = Math.round(dbToPercent(currentDb));

  return (
    <div className={cn("w-full px-1", className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-white/30">Ortam sesi</span>
        <span className="text-[11px] tabular-nums text-white/40">{level}%</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] px-1 py-3">
        <canvas ref={canvasRef} className="h-[72px] w-full" aria-hidden />
      </div>
    </div>
  );
}
