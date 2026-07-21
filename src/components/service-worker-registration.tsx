"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev-mode chunk URLs aren't content-hashed the way production ones are,
    // so a cache-first service worker actively fights hot-reload — a chunk
    // can change on disk while the SW keeps serving the old bytes at the
    // same URL. Only ever run it against a real production build, and
    // actively clean up any SW left registered from an earlier `next start`
    // so switching back to `next dev` doesn't leave stale caches behind.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
