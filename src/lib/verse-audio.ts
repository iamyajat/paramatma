// Single shared audio controller for per-verse recitation playback.
//
// Design mirrors the module-level store idiom in reader-toolbar.tsx (a Set of
// listeners + useSyncExternalStore). Exactly ONE <audio> element exists for the
// whole app, created lazily on the first play — so a reader page with 700 verses
// makes zero audio requests until a play button is tapped, and only one verse
// can ever sound at a time. Reusing the same element also keeps mobile Safari's
// user-gesture unlock valid across auto-advance to the next verse.

export type VerseAudioStatus = "idle" | "loading" | "playing" | "error";

export interface VerseAudioState {
  currentSrc: string | null;
  status: VerseAudioStatus;
}

const IDLE: VerseAudioState = { currentSrc: null, status: "idle" };

let state: VerseAudioState = IDLE;
let currentOrder: number | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

function setState(next: VerseAudioState) {
  state = next;
  notify();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getState(): VerseAudioState {
  return state;
}

export function getServerState(): VerseAudioState {
  return IDLE;
}

// order -> playable info, populated by mounted buttons. Drives auto-advance:
// when a verse ends we play the next-higher registered order in the same page.
const registry = new Map<number, { src: string; anchor: string }>();

export function register(order: number, src: string, anchor: string) {
  registry.set(order, { src, anchor });
}

export function unregister(order: number, src: string) {
  registry.delete(order);
  // Navigating away from the verse that is currently sounding: stop it so audio
  // doesn't bleed across into an unrelated page.
  if (state.currentSrc === src) stop();
}

let audio: HTMLAudioElement | null = null;

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  const el = new Audio();
  el.preload = "none";

  el.addEventListener("playing", () => {
    setState({ currentSrc: state.currentSrc, status: "playing" });
  });
  el.addEventListener("waiting", () => {
    if (state.currentSrc) setState({ currentSrc: state.currentSrc, status: "loading" });
  });
  el.addEventListener("error", () => {
    if (state.currentSrc) setState({ currentSrc: state.currentSrc, status: "error" });
  });
  el.addEventListener("ended", handleEnded);

  audio = el;
  return el;
}

function handleEnded() {
  const from = currentOrder;
  if (from == null) {
    setState(IDLE);
    return;
  }
  let nextOrder: number | null = null;
  let next: { src: string; anchor: string } | null = null;
  for (const [ord, info] of registry) {
    if (ord > from && (nextOrder === null || ord < nextOrder)) {
      nextOrder = ord;
      next = info;
    }
  }
  if (next && nextOrder !== null) {
    play(next.src, nextOrder);
    const anchor = next.anchor;
    requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  } else {
    currentOrder = null;
    setState(IDLE);
  }
}

function play(src: string, order: number) {
  const el = ensureAudio();
  currentOrder = order;
  setState({ currentSrc: src, status: "loading" });
  el.src = src;
  el.play().catch(() => {
    // Ignore aborts caused by quickly switching to another verse; only surface a
    // real failure for the verse that is still the active one.
    if (state.currentSrc === src) setState({ currentSrc: src, status: "error" });
  });
}

function stop() {
  if (audio) audio.pause();
  currentOrder = null;
  setState(IDLE);
}

/** Play `src` (verse `order`), or pause it if it is the one already sounding. */
export function toggle(src: string, order: number) {
  const isActive = state.currentSrc === src;
  if (isActive && (state.status === "playing" || state.status === "loading")) {
    stop();
  } else {
    play(src, order);
  }
}
