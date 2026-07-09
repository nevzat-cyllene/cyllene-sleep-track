"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { getEventClip } from "@/features/recording/audio-clip-store";
import { claimEventAudioPlayback, releaseEventAudioPlayback } from "./event-audio-playback";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventAudioPlayerProps {
  eventId: string;
  className?: string;
  compact?: boolean;
  /** local = cihazda kayıt; cloud = senkronize oturum (klip genelde yok) */
  audioContext?: "local" | "cloud";
}

export function EventAudioPlayer({ eventId, className, compact, audioContext = "local" }: EventAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPlaying(false);
    setProgress(0);
    releaseEventAudioPlayback(eventId);
  }, [eventId]);

  useEffect(() => () => cleanup(), [cleanup]);

  const togglePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      releaseEventAudioPlayback(eventId);
      return;
    }

    claimEventAudioPlayback(eventId, cleanup);

    setLoading(true);
    setError(false);

    try {
      if (!audioRef.current) {
        const clip = await getEventClip(eventId);
        if (!clip) {
          setError(true);
          releaseEventAudioPlayback(eventId);
          return;
        }

        const url = URL.createObjectURL(clip.wavBlob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
        });
        audio.addEventListener("timeupdate", () => {
          setProgress(audio.currentTime);
        });
        audio.addEventListener("ended", () => {
          setPlaying(false);
          setProgress(0);
          releaseEventAudioPlayback(eventId);
        });
      }

      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError(true);
      releaseEventAudioPlayback(eventId);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (error) {
    const message =
      audioContext === "cloud"
        ? "Kayıt telefonunuzda"
        : "Ses klibi yok";
    return (
      <span className={cn("text-xs text-muted-foreground", className)} title="Ses klipleri yalnızca kaydı yaptığınız cihazda dinlenebilir">
        {message}
      </span>
    );
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("rounded-full", className)}
        onClick={(e) => void togglePlay(e)}
        disabled={loading}
        aria-label={playing ? "Duraklat" : "Dinle"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full"
        onClick={(e) => void togglePlay(e)}
        disabled={loading}
        aria-label={playing ? "Duraklat" : "Dinle"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="min-w-0 flex-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
            }}
          />
        </div>
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {formatSeconds(progress)} / {duration > 0 ? formatSeconds(duration) : "—"}
        </p>
      </div>
    </div>
  );
}
