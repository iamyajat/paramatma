// Single shared audio controller for per-verse recitation playback.
//
// Design mirrors the module-level store idiom in reader-toolbar.tsx (a Set of
// listeners + useSyncExternalStore). Exactly ONE <audio> element exists for the
// whole app, created lazily on the first play — so a reader page with 700 verses
// makes zero audio requests until playback starts, and only one verse can ever
// sound at a time. Reusing the same element keeps mobile Safari's user-gesture
// unlock valid across auto-advance to the next verse.
//
// The controller also drives "play all": starting playback auto-advances through
// the whole chapter, scrolling and highlighting each verse as it goes. Pause
// keeps the element's position and the current verse so a later resume continues
// from exactly where it stopped (state is intentionally not persisted across a
// full page reload — a refresh simply starts over).

export type VerseAudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface VerseAudioState {
  currentSrc: string | null;
  currentOrder: number | null;
  status: VerseAudioStatus;
}

const IDLE: VerseAudioState = { currentSrc: null, currentOrder: null, status: "idle" };

let state: VerseAudioState = IDLE;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

function setState(next: VerseAudioState) {
  state = next;
  applyHighlight();
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

// order -> playable info, populated by mounted buttons. Drives auto-advance and
// "play all": we always know the next-higher verse to play and where to scroll.
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

/** True when at least one verse on the page has registered audio. */
export function hasRegisteredAudio(): boolean {
  return registry.size > 0;
}

let audio: HTMLAudioElement | null = null;

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;
  const el = new Audio();
  el.preload = "none";
  el.addEventListener("playing", () => setStatus("playing"));
  el.addEventListener("waiting", () => {
    if (state.currentSrc) setStatus("loading");
  });
  el.addEventListener("error", () => {
    if (state.currentSrc) setStatus("error");
  });
  el.addEventListener("ended", handleEnded);
  audio = el;
  return el;
}

function setStatus(status: VerseAudioStatus) {
  setState({ ...state, status });
}

function firstOrder(): number | null {
  let min: number | null = null;
  for (const ord of registry.keys()) if (min === null || ord < min) min = ord;
  return min;
}

function nextOrderAfter(from: number): number | null {
  let next: number | null = null;
  for (const ord of registry.keys()) {
    if (ord > from && (next === null || ord < next)) next = ord;
  }
  return next;
}

function scrollToOrder(order: number) {
  const info = registry.get(order);
  if (!info || typeof document === "undefined") return;
  requestAnimationFrame(() => {
    document.getElementById(info.anchor)?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

function play(src: string, order: number, scroll: boolean) {
  const el = ensureAudio();
  setState({ currentSrc: src, currentOrder: order, status: "loading" });
  el.src = src;
  el.play().catch(() => {
    // Ignore aborts from quickly switching verses; only surface a real failure
    // for the verse that is still the active one.
    if (state.currentSrc === src) {
      setState({ currentSrc: src, currentOrder: order, status: "error" });
    }
  });
  if (scroll) scrollToOrder(order);
}

function handleEnded() {
  if (state.currentOrder == null) {
    stop();
    return;
  }
  const next = nextOrderAfter(state.currentOrder);
  if (next !== null) {
    const info = registry.get(next)!;
    play(info.src, next, true);
  } else {
    stop();
  }
}

function pause() {
  if (audio) audio.pause();
  // Keep currentSrc/currentOrder so resume() continues from here.
  setState({ ...state, status: "paused" });
}

function resume() {
  if (!audio || state.currentSrc == null || state.currentOrder == null) {
    startFromFirst();
    return;
  }
  const order = state.currentOrder;
  setState({ ...state, status: "loading" });
  audio.play().catch(() => setState({ ...state, status: "error" }));
  scrollToOrder(order);
}

function stop() {
  if (audio) audio.pause();
  setState(IDLE);
}

function startFromFirst() {
  const first = firstOrder();
  if (first == null) return;
  const info = registry.get(first)!;
  play(info.src, first, true);
}

/** Per-verse button: play this verse, or pause/resume it if it is the active one. */
export function toggle(src: string, order: number) {
  const isActive = state.currentSrc === src;
  if (isActive && (state.status === "playing" || state.status === "loading")) {
    pause();
  } else if (isActive && state.status === "paused") {
    resume();
  } else {
    play(src, order, false);
  }
}

/** Toolbar "play all": start the chapter, pause it, or resume from where it stopped. */
export function togglePlayAll() {
  if (state.status === "playing" || state.status === "loading") {
    pause();
  } else if (state.status === "paused") {
    resume();
  } else {
    startFromFirst();
  }
}

// Highlight the sounding verse by toggling a data attribute on its container
// element (SegmentBlock stays a pure server component; styling lives in
// globals.css). Highlight shows only while actively playing/loading — pausing
// clears it, per the "remove highlights on pause" behavior.
function applyHighlight() {
  if (typeof document === "undefined") return;
  const active = state.status === "playing" || state.status === "loading";
  const activeAnchor =
    active && state.currentOrder != null ? registry.get(state.currentOrder)?.anchor ?? null : null;
  document.querySelectorAll("[data-verse-active]").forEach((el) => {
    if (el.id !== activeAnchor) el.removeAttribute("data-verse-active");
  });
  if (activeAnchor) document.getElementById(activeAnchor)?.setAttribute("data-verse-active", "");
}
