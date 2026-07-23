"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { WorkSummary } from "@/lib/data";
import { SaveToggle } from "@/components/save-toggle";
import { ShareButton } from "@/components/share-button";
import { ReaderMoreMenu } from "@/components/reader-more-menu";

const SCALE_STEPS = [0.875, 1, 1.125, 1.25, 1.375];
const SCALE_KEY = "reader:scale";
const PRONUNCIATION_KEY = "reader:pronunciation";

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((cb) => cb());
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getContentEl(): HTMLElement | null {
  return document.getElementById("reader-content");
}

function getScaleIndex(): number {
  const raw = Number(getContentEl()?.style.getPropertyValue("--reader-scale"));
  const idx = SCALE_STEPS.indexOf(raw);
  return idx === -1 ? 1 : idx;
}
function getScaleServerSnapshot(): number {
  return 1;
}

function getPronunciationOn(): boolean {
  return getContentEl()?.getAttribute("data-pronunciation") !== "off";
}
function getPronunciationServerSnapshot(): boolean {
  return true;
}

function applyScale(index: number) {
  const clamped = Math.max(0, Math.min(SCALE_STEPS.length - 1, index));
  const value = SCALE_STEPS[clamped];
  getContentEl()?.style.setProperty("--reader-scale", String(value));
  localStorage.setItem(SCALE_KEY, String(value));
  notify();
}

function togglePronunciation() {
  const next = getPronunciationOn() ? "off" : "on";
  getContentEl()?.setAttribute("data-pronunciation", next);
  localStorage.setItem(PRONUNCIATION_KEY, next);
  notify();
}

function setAllMeanings(expand: boolean) {
  const details = document.querySelectorAll<HTMLDetailsElement>(
    "#reader-content details.meaning"
  );
  details.forEach((d) => (d.open = expand));
}

export function ReaderToolbar({ work }: { work: WorkSummary }) {
  const [meaningsExpanded, setMeaningsExpanded] = useState(false);
  const scaleIndex = useSyncExternalStore(subscribe, getScaleIndex, getScaleServerSnapshot);
  const pronunciationOn = useSyncExternalStore(
    subscribe,
    getPronunciationOn,
    getPronunciationServerSnapshot
  );

  // Restore persisted preferences onto the content element once on mount.
  useEffect(() => {
    const storedScale = Number(localStorage.getItem(SCALE_KEY));
    if (SCALE_STEPS.includes(storedScale)) {
      getContentEl()?.style.setProperty("--reader-scale", String(storedScale));
    }
    const storedPronunciation = localStorage.getItem(PRONUNCIATION_KEY);
    if (storedPronunciation === "off") {
      getContentEl()?.setAttribute("data-pronunciation", "off");
    }
    notify();
  }, []);

  return (
    <div className="no-print sticky top-16 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-ivory/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
        <button
          type="button"
          onClick={() => applyScale(scaleIndex - 1)}
          disabled={scaleIndex === 0}
          aria-label="Decrease text size"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-muted hover:bg-gold-soft hover:text-ink disabled:opacity-30"
        >
          A−
        </button>
        <button
          type="button"
          onClick={() => applyScale(scaleIndex + 1)}
          disabled={scaleIndex === SCALE_STEPS.length - 1}
          aria-label="Increase text size"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-muted hover:bg-gold-soft hover:text-ink disabled:opacity-30"
        >
          A+
        </button>
      </div>

      <button
        type="button"
        onClick={togglePronunciation}
        aria-pressed={pronunciationOn}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          pronunciationOn
            ? "border-gold bg-gold-soft text-ink"
            : "border-border text-ink-muted hover:border-gold hover:text-gold"
        }`}
      >
        Pronunciation
      </button>

      <div className="ml-auto flex items-center gap-2">
        <SaveToggle work={work} />
        <ShareButton work={work} />
        <ReaderMoreMenu
          work={work}
          meaningsExpanded={meaningsExpanded}
          onToggleMeanings={() => {
            const next = !meaningsExpanded;
            setAllMeanings(next);
            setMeaningsExpanded(next);
          }}
        />
      </div>
    </div>
  );
}
