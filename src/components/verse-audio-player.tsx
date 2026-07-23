"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import {
  subscribe,
  subscribeTime,
  getState,
  getServerState,
  togglePlayAll,
  next,
  previous,
  seekTo,
  getProgress,
} from "@/lib/verse-audio";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VerseAudioPlayer({ title }: { title: string }) {
  const audio = useSyncExternalStore(subscribe, getState, getServerState);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const rafRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const isSounding = audio.status === "playing" || audio.status === "loading";
  const isLoading = audio.status === "loading";
  const isError = audio.status === "error";

  const syncProgress = useCallback(() => setProgress(getProgress()), []);

  // Reliable position updates from the audio's own timeupdate events (fire ~4x/s
  // during playback even if the tab is backgrounded / rAF is throttled).
  useEffect(() => subscribeTime(syncProgress), [syncProgress]);

  // Smooth 60fps updates while foregrounded and sounding; also re-read once on
  // any status/verse change so pause, seek, and track switches settle correctly.
  useEffect(() => {
    syncProgress();
    if (!isSounding) return;
    const tick = () => {
      setProgress(getProgress());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSounding, audio.currentSrc, audio.currentOrder, audio.status, syncProgress]);

  const duration = progress.duration;
  const current = Math.min(progress.currentTime, duration || progress.currentTime);
  const fraction = duration > 0 ? current / duration : 0;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || duration <= 0) return;
      const rect = el.getBoundingClientRect();
      const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const t = f * duration;
      seekTo(t);
      setProgress((p) => ({ ...p, currentTime: t }));
    },
    [duration]
  );

  const afterControl = () => requestAnimationFrame(syncProgress);

  const label = audio.currentNumber != null ? `Verse ${audio.currentNumber}` : "Play all verses";

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-40 border-t border-border bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/80 sm:bottom-0">
      <div className="mx-auto max-w-3xl px-4 py-2.5 sm:px-6">
        {/* Scrubber */}
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
            {formatTime(current)}
          </span>
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek within recitation"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(current)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) seekFromClientX(e.clientX);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(current + 5);
              else if (e.key === "ArrowLeft") seekTo(Math.max(0, current - 5));
              else return;
              e.preventDefault();
              afterControl();
            }}
            className="group relative h-4 flex-1 cursor-pointer touch-none"
          >
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-gold" style={{ width: `${fraction * 100}%` }} />
            </div>
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus:opacity-100 [[data-active='true']_&]:opacity-100"
              style={{ left: `${fraction * 100}%` }}
              data-active={isSounding || audio.status === "paused"}
            />
          </div>
          <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-muted">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls + label */}
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                previous();
                afterControl();
              }}
              aria-label="Previous verse"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold-soft hover:text-ink"
            >
              <PrevIcon />
            </button>

            <button
              type="button"
              onClick={togglePlayAll}
              aria-label={isSounding ? "Pause" : "Play"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ivory shadow-soft transition-transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <SpinnerIcon />
              ) : isSounding ? (
                <PauseIcon />
              ) : isError ? (
                <RetryIcon />
              ) : (
                <PlayIcon />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                next();
                afterControl();
              }}
              aria-label="Next verse"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold-soft hover:text-ink"
            >
              <NextIcon />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {isError ? "Audio failed — tap play to retry" : label}
            </p>
            <p className="truncate text-xs text-ink-muted">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.28-6.86a.5.5 0 0 0 0-.84L8.77 4.72a.5.5 0 0 0-.77.42Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="5" y="5" width="2.5" height="14" rx="1" />
      <path d="M20 5.5v13a.5.5 0 0 1-.78.42l-9-6.5a.5.5 0 0 1 0-.84l9-6.5A.5.5 0 0 1 20 5.5Z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
      <path d="M4 5.5v13a.5.5 0 0 0 .78.42l9-6.5a.5.5 0 0 0 0-.84l-9-6.5A.5.5 0 0 0 4 5.5Z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v4h-4M4 20v-4h4" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
