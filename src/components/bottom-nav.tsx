"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS, isActivePath } from "@/components/nav-items";

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.75h.01" />
    </svg>
  );
}

const tabClass = (active: boolean) =>
  `flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
    active ? "text-gold" : "text-ink-muted"
  }`;

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = () => setMoreOpen(false);

  const aboutActive = isActivePath(pathname, "/about");

  return (
    <div className="no-print sm:hidden">
      {moreOpen ? (
        <>
          {/* Tap-away backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-ink/20"
          />
          <div className="fixed inset-x-3 bottom-[4.75rem] z-50 rounded-2xl border border-border bg-ivory p-2 shadow-lifted">
            <Link
              href="/about"
              onClick={closeMore}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base ${
                aboutActive ? "bg-gold-soft text-ink" : "text-ink hover:bg-gold-soft"
              }`}
            >
              <InfoIcon className="h-5 w-5" />
              About &amp; sources
            </Link>
            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-ink">
              <span>Light / dark theme</span>
              <ThemeToggle />
            </div>
          </div>
        </>
      ) : null}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/80"
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href) && !moreOpen;
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMore}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={tabClass(moreOpen)}
        >
          <MoreIcon className="h-6 w-6" />
          More
        </button>
      </nav>
    </div>
  );
}
