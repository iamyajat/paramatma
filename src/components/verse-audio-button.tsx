"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  subscribe,
  getState,
  getServerState,
  register,
  unregister,
  toggle,
} from "@/lib/verse-audio";

export function VerseAudioButton({
  src,
  order,
  anchor,
  number,
}: {
  src: string;
  order: number;
  anchor: string;
  number: number;
}) {
  const audio = useSyncExternalStore(subscribe, getState, getServerState);
  const isActive = audio.currentSrc === src;
  const status = isActive ? audio.status : "idle";

  useEffect(() => {
    register(order, src, anchor);
    return () => unregister(order, src);
  }, [order, src, anchor]);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isError = status === "error";

  const label = isPlaying
    ? `Pause recitation of verse ${number}`
    : isError
      ? `Recitation of verse ${number} failed — tap to retry`
      : `Play recitation of verse ${number}`;

  return (
    <button
      type="button"
      onClick={() => toggle(src, order)}
      aria-label={label}
      title={isError ? "Audio failed — tap to retry" : isPlaying ? "Pause" : "Play recitation"}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
        isActive
          ? "bg-gold-soft text-gold"
          : "text-ink-muted hover:bg-gold-soft hover:text-ink"
      }`}
    >
      {isLoading ? (
        <SpinnerIcon />
      ) : isPlaying ? (
        <PauseIcon />
      ) : isError ? (
        <RetryIcon />
      ) : (
        <PlayIcon />
      )}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.28-6.86a.5.5 0 0 0 0-.84L8.77 4.72a.5.5 0 0 0-.77.42Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v4h-4M4 20v-4h4" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
