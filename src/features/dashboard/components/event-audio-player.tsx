"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Smartphone } from "lucide-react";
import { getEventClip } from "@/features/recording/audio-clip-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventAudioPlayerProps {
  eventId: string;
  className?: string;
  compact?: boolean;
}

const EVENT_AUDIO_PLAY_EVENT = "cyllene:event-audio-play";

type MissingDeviceCopy = {
  short: string;
  detail: string;
};

function getLikelySourceDeviceCopy(): MissingDeviceCopy {
  const isCurrentDeviceMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isCurrentDeviceMobile
    ? {
        short: "Webde",
        detail: "Kaydı başlattığın web tarayıcısında dinleyebilirsin.",
      }
    : {
        short: "Mobilde",
        detail: "Kaydı başlattığın mobil cihazında dinleyebilirsin.",
      };
}

export function EventAudioPlayer({ eventId, className, compact }: EventAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [missingDevice, setMissingDevice] = useState<MissingDeviceCopy | null>(null);

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
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    const handleOtherPlayback = (event: Event) => {
      const nextEventId = (event as CustomEvent<string>).detail;
      if (nextEventId !== eventId) cleanup();
    };

    window.addEventListener(EVENT_AUDIO_PLAY_EVENT, handleOtherPlayback);
    return () => window.removeEventListener(EVENT_AUDIO_PLAY_EVENT, handleOtherPlayback);
  }, [cleanup, eventId]);

  const togglePlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    setError(false);
    setMissingDevice(null);

    try {
      if (!audioRef.current) {
        const clip = await getEventClip(eventId);
        if (!clip) {
          setMissingDevice(getLikelySourceDeviceCopy());
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
        });
      }

      window.dispatchEvent(new CustomEvent(EVENT_AUDIO_PLAY_EVENT, { detail: eventId }));
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (missingDevice) {
    if (compact) {
      return (
        <span
          className={cn(
            "inline-flex max-w-28 items-center gap-1.5 rounded-full border border-[#6da9ff]/12 bg-[#155eff]/8 px-2 py-1 text-[10px] font-medium text-[#8fc0ff]",
            className
          )}
          role="status"
        >
          <Smartphone className="h-3 w-3 shrink-0" />
          <span className="truncate">{missingDevice.short}</span>
        </span>
      );
    }

    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border border-[#6da9ff]/12 bg-[#155eff]/8 p-3",
          className
        )}
        role="status"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#155eff]/14 text-[#8fc0ff]">
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">Ses dosyası bu cihazda yok.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{missingDevice.detail}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Ses klibi açılamadı
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
        onClick={(event) => {
          event.stopPropagation();
          void togglePlay();
        }}
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
        onClick={(event) => {
          event.stopPropagation();
          void togglePlay();
        }}
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
