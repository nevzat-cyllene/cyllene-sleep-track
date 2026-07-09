"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { dbToPercent } from "@/lib/sleep-utils";

interface LiveSoundWaveProps {
  samples: number[];
  currentDb: number;
  className?: string;
}

const BUFFER_SIZE = 160;
const CYAN = "oklch(0.78 0.14 195)";
const CYAN_DIM = "oklch(0.78 0.14 195 / 35%)";

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
      phaseRef.current += 0.04;
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
      while (tail.length < BUFFER_SIZE) tail.unshift(liveDb * 0.3);
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const db = i === BUFFER_SIZE - 1 ? liveDb : tail[i];
        const breathe = 1 + Math.sin(phaseRef.current + i * 0.08) * 0.04;
        points.push((dbToPercent(db) / 100) * (h * 0.38) * breathe);
      }

      ctx.clearRect(0, 0, w, h);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "oklch(0.78 0.14 195 / 4%)");
      bgGrad.addColorStop(0.5, "oklch(0 0 0 / 0%)");
      bgGrad.addColorStop(1, "oklch(0.78 0.14 195 / 4%)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 1; i <= 4; i++) {
        const y = mid + (i % 2 === 0 ? 1 : -1) * (h * 0.12 * Math.ceil(i / 2));
        ctx.strokeStyle = "oklch(1 0 0 / 4%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const buildPath = (sign: 1 | -1) => {
        ctx.beginPath();
        ctx.moveTo(0, mid);
        const step = w / (BUFFER_SIZE - 1);
        for (let i = 0; i < BUFFER_SIZE; i++) {
          const x = i * step;
          const y = mid - sign * points[i];
          if (i === 0) ctx.lineTo(x, y);
          else {
            const prevX = (i - 1) * step;
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(cpX, mid - sign * points[i - 1], x, y);
          }
        }
        ctx.lineTo(w, mid);
      };

      buildPath(1);
      buildPath(-1);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, 0, w, 0);
      fillGrad.addColorStop(0, "oklch(0.78 0.14 195 / 0%)");
      fillGrad.addColorStop(0.5, "oklch(0.78 0.14 195 / 22%)");
      fillGrad.addColorStop(1, "oklch(0.78 0.14 195 / 45%)");
      ctx.fillStyle = fillGrad;
      ctx.fill();

      buildPath(1);
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 2;
      ctx.shadowColor = CYAN_DIM;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      buildPath(-1);
      ctx.strokeStyle = "oklch(0.78 0.14 195 / 45%)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      const pulse = (dbToPercent(liveDb) / 100) * (h * 0.38);
      const scanX = w - 2;
      ctx.beginPath();
      ctx.moveTo(scanX, mid - pulse);
      ctx.lineTo(scanX, mid + pulse);
      ctx.strokeStyle = "oklch(1 0 0 / 70%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(scanX, mid - pulse, 4, 0, Math.PI * 2);
      ctx.fillStyle = CYAN;
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const level = Math.round(dbToPercent(currentDb));

  return (
    <div
      className={cn(
        "relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08]",
        "bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-5 shadow-[0_0_60px_oklch(0.78_0.14_195/12%)]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/35">
        <span>Canlı ses</span>
        <span className="tabular-nums text-cyllene-cyan">{level}%</span>
      </div>
      <canvas ref={canvasRef} className="h-28 w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyllene-cyan/40 to-transparent" />
    </div>
  );
}
