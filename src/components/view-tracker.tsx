"use client";

import { useEffect, useRef, useTransition } from "react";
import { recordView } from "@/lib/actions/analytics";

// Renders nothing; fires recordView exactly once per real page load.
//
// Tracks the last-fired workId (not a plain boolean) so this stays correct
// both when React Strict Mode double-invokes this effect in dev on the same
// mount, and if this instance's workId prop ever changes without a full
// unmount (this route has no template.tsx forcing a remount on navigation).
export function ViewTracker({ workId }: { workId: string }) {
  const firedFor = useRef<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (firedFor.current === workId) return;
    firedFor.current = workId;
    startTransition(async () => {
      try {
        await recordView(workId);
      } catch (err) {
        console.error("recordView failed", err);
      }
    });
  }, [workId]);

  return null;
}
