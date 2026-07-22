"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { OmMark } from "@/components/icons/om-mark";
import { NAV_ITEMS, isActivePath } from "@/components/nav-items";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <OmMark className="text-2xl text-gold transition-transform group-hover:scale-110" />
          <span
            lang="sa-Deva"
            className="font-scripture text-xl font-semibold tracking-tight text-ink"
          >
            परमात्मा
          </span>
        </Link>

        {/* Desktop navigation — the bottom bar covers small screens. */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-base transition-colors ${
                  active
                    ? "bg-gold-soft font-medium text-ink"
                    : "text-ink-muted hover:bg-gold-soft hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/about"
            aria-current={isActivePath(pathname, "/about") ? "page" : undefined}
            className={`rounded-full px-4 py-2.5 text-base transition-colors ${
              isActivePath(pathname, "/about")
                ? "bg-gold-soft font-medium text-ink"
                : "text-ink-muted hover:bg-gold-soft hover:text-ink"
            }`}
          >
            About
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* On mobile, only the theme toggle lives up here; links are in the bottom bar. */}
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
