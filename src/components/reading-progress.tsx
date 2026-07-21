"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const content = document.getElementById("reader-content");
    if (!content) return;

    function onScroll() {
      const rect = content!.getBoundingClientRect();
      const contentTop = window.scrollY + rect.top;
      const total = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, (window.scrollY - contentTop) / total));

      if (barRef.current) {
        barRef.current.style.width = `${progress * 100}%`;
      }
      if (backToTopRef.current) {
        const visible = window.scrollY > 600;
        backToTopRef.current.style.opacity = visible ? "1" : "0";
        backToTopRef.current.style.pointerEvents = visible ? "auto" : "none";
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="no-print fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
        <div ref={barRef} className="h-full w-0 bg-gold" />
      </div>
      <button
        ref={backToTopRef}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="no-print fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted opacity-0 shadow-soft transition-opacity duration-300 hover:border-gold hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
