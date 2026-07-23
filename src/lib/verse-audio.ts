// Single shared audio controller for verse recitation playback.
//
// Design mirrors the module-level store idiom in reader-toolbar.tsx (a Set of
// listeners + useSyncExternalStore). Exactly ONE <audio> element exists for the
// whole app, created lazily on the first play — so a reader page with 700 verses
// makes zero audio requests until playback starts, and only one verse can ever
// sound at a time. Reusing the same element keeps mobile Safari's user-gesture
// unlock valid across auto-advance to the next verse.
//
// The controller drives a docked audio player: play/pause, previous/next verse,
// auto-advance through the chapter (scrolling + highlighting each verse), and
// seeking. Pause keeps the element's position and the current verse so resume
// continues exactly where it stopped. State is intentionally not persisted
// across a full page reload — a refresh simply starts over.

export type VerseAudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface VerseAudioState {
  currentSrc: string | null;
  currentOrder: number | null;
  currentNumber: number | null;
  status: VerseAudioStatus;
}

const IDLE: VerseAudioState = {
  currentSrc: null,
  currentOrder: null,
  currentNumber: null,
  status: "idle",
};

let state: VerseAudioState = IDLE;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

// Separate high-frequency channel for playback position, so only the player's
// scrubber re-reads on every timeupdate — the status listeners above (per-verse
// buttons, toolbar) are untouched by position ticks.
const timeListeners = new Set<() => void>();

function notifyTime() {
  timeListeners.forEach((cb) => cb());
}

export function subscribeTime(cb: () => void): () => void {
  timeListeners.add(cb);
  return () => {
    timeListeners.delete(cb);
  };
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

// order -> playable info, populated by mounted buttons. Drives auto-advance,
// previous/next, and the player's verse label.
const registry = new Map<number, { src: string; anchor: string; number: number }>();

export function register(order: number, src: string, anchor: string, number: number) {
  registry.set(order, { src, anchor, number });
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

function orderedOrders(): number[] {
  return Array.from(registry.keys()).sort((a, b) => a - b);
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
  el.addEventListener("timeupdate", notifyTime);
  el.addEventListener("durationchange", notifyTime);
  el.addEventListener("loadedmetadata", notifyTime);
  el.addEventListener("ended", handleEnded);
  audio = el;
  return el;
}

function setStatus(status: VerseAudioStatus) {
  setState({ ...state, status });
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
  const number = registry.get(order)?.number ?? null;
  setState({ currentSrc: src, currentOrder: order, currentNumber: number, status: "loading" });
  el.src = src;
  el.play().catch(() => {
    // Ignore aborts from quickly switching verses; only surface a real failure
    // for the verse that is still the active one.
    if (state.currentSrc === src) {
      setState({ currentSrc: src, currentOrder: order, currentNumber: number, status: "error" });
    }
  });
  if (scroll) scrollToOrder(order);
}

function handleEnded() {
  if (state.currentOrder == null) {
    stop();
    return;
  }
  const orders = orderedOrders();
  const idx = orders.indexOf(state.currentOrder);
  const nextOrder = idx >= 0 && idx < orders.length - 1 ? orders[idx + 1] : null;
  if (nextOrder !== null) {
    const info = registry.get(nextOrder)!;
    play(info.src, nextOrder, true);
  } else {
    stop();
  }
}

function pause() {
  if (audio) audio.pause();
  // Keep currentSrc/currentOrder/currentNumber so resume() continues from here.
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
  const orders = orderedOrders();
  if (orders.length === 0) return;
  const info = registry.get(orders[0])!;
  play(info.src, orders[0], true);
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

/** Player play/pause: start the chapter, pause it, or resume from where it stopped. */
export function togglePlayAll() {
  if (state.status === "playing" || state.status === "loading") {
    pause();
  } else if (state.status === "paused") {
    resume();
  } else {
    startFromFirst();
  }
}

/** Player "next": advance to the following verse (no-op past the last). */
export function next() {
  const orders = orderedOrders();
  if (orders.length === 0) return;
  if (state.currentOrder == null) {
    startFromFirst();
    return;
  }
  const idx = orders.indexOf(state.currentOrder);
  const nextOrder = idx >= 0 && idx < orders.length - 1 ? orders[idx + 1] : null;
  if (nextOrder !== null) {
    const info = registry.get(nextOrder)!;
    play(info.src, nextOrder, true);
  }
}

/** Player "previous": restart the current verse if >2s in, else go to the prior verse. */
export function previous() {
  const orders = orderedOrders();
  if (orders.length === 0) return;
  if (state.currentOrder == null) {
    startFromFirst();
    return;
  }
  if (audio && audio.currentTime > 2) {
    audio.currentTime = 0;
    notify();
    return;
  }
  const idx = orders.indexOf(state.currentOrder);
  const prevOrder = idx > 0 ? orders[idx - 1] : null;
  if (prevOrder !== null) {
    const info = registry.get(prevOrder)!;
    play(info.src, prevOrder, true);
  } else if (audio) {
    audio.currentTime = 0;
    notify();
  }
}

export function seekTo(seconds: number) {
  if (audio && Number.isFinite(seconds)) {
    audio.currentTime = Math.max(0, seconds);
    notify();
  }
}

export function getProgress(): { currentTime: number; duration: number } {
  if (!audio) return { currentTime: 0, duration: 0 };
  return {
    currentTime: audio.currentTime || 0,
    duration: Number.isFinite(audio.duration) ? audio.duration : 0,
  };
}

// Highlight the sounding verse by toggling a data attribute on its container
// element (SegmentBlock stays a pure server component; styling lives in
// globals.css). Highlight shows only while actively playing/loading — pausing
// clears it.
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
